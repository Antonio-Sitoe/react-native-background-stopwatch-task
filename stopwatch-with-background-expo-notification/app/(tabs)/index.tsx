import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Play, Pause, Square, RotateCcw } from 'lucide-react-native';
import { useTimerStore } from '@/stores/timerStore';
import { Platform } from 'react-native';

export default function TimerScreen() {
  const {
    timerState,
    formatTime,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useTimerStore();

  const handleStartPause = () => {
    if (!timerState.isRunning) {
      start();
    } else if (timerState.isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleReset = () => {
    reset();
  };

  const getTimerStatus = () => {
    if (!timerState.isRunning) return 'Ready to start';
    if (timerState.isPaused) return 'Paused';
    return 'Running';
  };

  const getStartPauseIcon = () => {
    if (!timerState.isRunning || timerState.isPaused) {
      return <Play size={32} color="#FFFFFF" strokeWidth={2} />;
    }
    return <Pause size={32} color="#FFFFFF" strokeWidth={2} />;
  };

  const getStartPauseColor = () => {
    if (timerState.isPaused) return styles.resumeButton;
    return timerState.isRunning ? styles.pauseButton : styles.startButton;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Service Timer</Text>
          <Text style={styles.status}>{getTimerStatus()}</Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {formatTime(timerState.elapsed)}
          </Text>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, getStartPauseColor()]}
            onPress={handleStartPause}
            activeOpacity={0.8}
          >
            {getStartPauseIcon()}
          </TouchableOpacity>

          {timerState.isRunning && (
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
              activeOpacity={0.8}
            >
              <Square size={32} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <RotateCcw size={32} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Timer runs in background with notifications
          </Text>
          <Text style={styles.infoSubText}>
            Use notification controls when app is minimized
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  status: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '300',
    color: '#1C1C1E',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-thin',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  resumeButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  resetButton: {
    backgroundColor: '#8E8E93',
  },
  infoContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#C6C6C8',
  },
  infoText: {
    fontSize: 16,
    color: '#3A3A3C',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoSubText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});