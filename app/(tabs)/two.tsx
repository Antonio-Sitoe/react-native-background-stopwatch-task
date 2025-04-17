import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import notifee, { EventType, AndroidImportance } from '@notifee/react-native'
import { formatDuration, intervalToDuration } from 'date-fns'
import { Pause, Play, Store as Stop } from 'lucide-react-native'

notifee.registerForegroundService(() => {
  return new Promise(() => {
    notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        switch (detail.pressAction?.id) {
          case 'stop':
            await notifee.stopForegroundService()
            break
        }
      }
    })
  })
})
export default function StopwatchScreen() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // Request notification permissions
    requestPermissions()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const requestPermissions = async () => {
    await notifee.requestPermission()
  }

  const createChannel = async () => {
    await notifee.createChannel({
      id: 'stopwatch',
      name: 'Stopwatch Service',
      lights: false,
      vibration: false,
      importance: AndroidImportance.LOW,
    })
  }

  const startForegroundService = async () => {
    await createChannel()

    await notifee.displayNotification({
      id: 'stopwatch',
      title: 'Stopwatch Running',
      body: formatTime(elapsedTime),
      android: {
        channelId: 'stopwatch',
        asForegroundService: true,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: 'Pause',
            pressAction: {
              id: 'pause',
            },
          },
          {
            title: 'Stop',
            pressAction: {
              id: 'stop',
            },
          },
        ],
      },
    })
  }

  const stopForegroundService = async () => {
    await notifee.stopForegroundService()
  }

  const updateNotification = async () => {
    await notifee.displayNotification({
      id: 'stopwatch',
      title: 'Stopwatch Running',
      body: formatTime(elapsedTime),
      android: {
        channelId: 'stopwatch',
        asForegroundService: true,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: isRunning ? 'Pause' : 'Resume',
            pressAction: {
              id: 'pause',
            },
          },
          {
            title: 'Stop',
            pressAction: {
              id: 'stop',
            },
          },
        ],
      },
    })
  }

  const formatTime = (milliseconds: number) => {
    const duration = intervalToDuration({ start: 0, end: milliseconds })
    return formatDuration(duration, {
      format: ['hours', 'minutes', 'seconds'],
      zero: true,
      delimiter: ':',
    })
  }

  const handleStart = async () => {
    if (!isRunning) {
      setIsRunning(true)
      startTimeRef.current = Date.now() - elapsedTime

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const newElapsedTime = Date.now() - startTimeRef.current
          setElapsedTime(newElapsedTime)
          updateNotification()
        }
      }, 1000)

      if (Platform.OS === 'android') {
        await startForegroundService()
      }
    }
  }

  const handlePause = async () => {
    if (isRunning) {
      setIsRunning(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      await updateNotification()
    } else {
      handleStart()
    }
  }

  const handleStop = async () => {
    setIsRunning(false)
    setElapsedTime(0)
    startTimeRef.current = null
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    await stopForegroundService()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{formatTime(elapsedTime)}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonStart]}
          onPress={isRunning ? handlePause : handleStart}
        >
          {isRunning ? (
            <Pause size={24} color="white" />
          ) : (
            <Play size={24} color="white" />
          )}
        </TouchableOpacity>
        {(isRunning || elapsedTime > 0) && (
          <TouchableOpacity
            style={[styles.button, styles.buttonStop]}
            onPress={handleStop}
          >
            <Stop size={24} color="white" />
          </TouchableOpacity>
        )}
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
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonStart: {
    backgroundColor: '#4CAF50',
  },
  buttonStop: {
    backgroundColor: '#f44336',
  },
})
