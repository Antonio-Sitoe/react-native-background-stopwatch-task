import React, { useEffect, useRef } from 'react'
import {
  StyleSheet,
  AppState,
  AppStateStatus,
  TouchableOpacity,
  View,
  Text,
} from 'react-native'

import notifee, { AndroidColor, EventType } from '@notifee/react-native'
import * as Linking from 'expo-linking'
import { useTimerStore } from './store'

let i = 0
export default function App() {
  const {
    isRunning,
    time,
    startTime,
    pausedTime,
    setRunning,
    setTime,
    setStartTime,
    setPausedTime,
    reset,
  } = useTimerStore()

  const appState = useRef(AppState.currentState)
  const lastUpdateRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':')
  }
  console.log('ss', i++)

  const updateNotification = async (isPaused = false) => {
    const now = Date.now()
    if (now - lastUpdateRef.current < 1000 && !isPaused) return
    lastUpdateRef.current = now

    await notifee.displayNotification({
      id: 'timer',
      title: 'Ministry Assistant',
      body: isPaused
        ? `Pausado: ${formatTime(time)}`
        : `Tempo: ${formatTime(time)}`,
      android: {
        channelId: 'timer',
        asForegroundService: true,
        ongoing: true,
        color: isPaused ? '#FFA500' : AndroidColor.GREEN,
        colorized: true,
        pressAction: { id: 'open-app', launchActivity: 'default' },
        actions: isPaused
          ? [
              { title: 'Continuar', pressAction: { id: 'continue' } },
              { title: 'Parar', pressAction: { id: 'stop' } },
            ]
          : [
              { title: 'Pausar', pressAction: { id: 'pause' } },
              { title: 'Parar', pressAction: { id: 'stop' } },
            ],
      },
    })
  }

  const startTimer = async () => {
    const now = Date.now()
    setRunning(true)
    setStartTime(now - pausedTime)
    setPausedTime(0)
    await updateNotification()

    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        switch (detail.pressAction?.id) {
          case 'pause':
            await pauseTimer()
            break
          case 'continue':
            await startTimer()
            break
          case 'stop':
            await stopTimer()
            break
          case 'open-app':
            await Linking.openURL(Linking.createURL('/'))
            break
        }
      }
    })

    notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        switch (detail.pressAction?.id) {
          case 'pause':
            pauseTimer()
            break
          case 'continue':
            startTimer()
            break
          case 'stop':
            stopTimer()
            break
          case 'open-app':
            await Linking.openURL(Linking.createURL('/'))
            break
        }
      }
    })
  }

  const pauseTimer = async () => {
    setRunning(false)
    if (startTime) setPausedTime(Date.now() - startTime)
    await updateNotification(true)
  }

  const stopTimer = async () => {
    setRunning(false)
    reset()
    await notifee.cancelNotification('timer')
    await notifee.stopForegroundService()
  }

  useEffect(() => {
    const setupNotifee = async () => {
      await notifee.requestPermission()
      await notifee.createChannel({ id: 'timer', name: 'Cronômetro' })
    }
    setupNotifee()
  }, [])

  useEffect(() => {
    const restoreState = async () => {
      if (isRunning && startTime) {
        setTime(Math.floor((Date.now() - startTime) / 1000))
      }
    }
    restoreState()
  }, [])

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000))
      }, 500)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, startTime])

  useEffect(() => {
    if (isRunning || pausedTime > 0) updateNotification(!isRunning)
  }, [time])

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        updateNotification(!isRunning)
      }
      appState.current = nextState
    }
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
    return () => subscription.remove()
  }, [isRunning])

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(time)}</Text>
      <View style={styles.buttonContainer}>
        {!isRunning ? (
          <TouchableOpacity style={styles.button} onPress={startTimer}>
            <Text style={styles.buttonText}>Iniciar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={pauseTimer}>
            <Text style={styles.buttonText}>Pausar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={stopTimer}
        >
          <Text style={styles.buttonText}>Parar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  timerText: { fontSize: 48, fontWeight: 'bold', marginBottom: 40 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  stopButton: { backgroundColor: '#F44336' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
})
