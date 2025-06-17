import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import ExpoStopwatch from '../modules/stopwatch';

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsed: number;
  startTime: number | null;
  pausedTime: number;
}

export interface TimerSession {
  id: string;
  date: string;
  duration: number;
  type: 'Completed' | 'Stopped';
  startedAt: number;
  endedAt: number;
}

interface TimerStore {
  // Timer state
  timerState: TimerState;

  // History
  sessions: TimerSession[];

  // Settings
  notificationsEnabled: boolean;
  backgroundMode: boolean;
  persistData: boolean;

  // Actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;

  // Settings actions
  setNotificationsEnabled: (enabled: boolean) => void;
  setBackgroundMode: (enabled: boolean) => void;
  setPersistData: (enabled: boolean) => void;

  // Utility actions
  formatTime: (milliseconds: number) => string;
  loadPersistedState: () => Promise<void>;
  saveState: () => Promise<void>;
  updateNotification: () => Promise<void>;
  clearNotification: () => Promise<void>;
  addSession: (session: TimerSession) => void;
  getWeeklyTotal: () => number;
  getAverageSession: () => number;
}

const STORAGE_KEY = 'service_timer_state';
const SESSIONS_KEY = 'service_timer_sessions';
const SETTINGS_KEY = 'service_timer_settings';
const NOTIFICATION_ID = 'service_timer_notification';

export const useTimerStore = create<TimerStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    timerState: {
      isRunning: false,
      isPaused: false,
      elapsed: 0,
      startTime: null,
      pausedTime: 0,
    },

    sessions: [],

    notificationsEnabled: true,
    backgroundMode: true,
    persistData: true,

    // Timer actions - Now using native module
    start: async () => {
      try {
        await ExpoStopwatch.start();
        const state = await ExpoStopwatch.getState();

        set({
          timerState: {
            isRunning: state.isRunning,
            isPaused: state.isPaused,
            elapsed: state.elapsed,
            startTime: state.startTime,
            pausedTime: 0,
          },
        });

        get().saveState();
        get().updateNotification();
      } catch (error) {
        console.error('Error starting timer:', error);
      }
    },

    pause: async () => {
      try {
        await ExpoStopwatch.pause();
        const state = await ExpoStopwatch.getState();

        set({
          timerState: {
            isRunning: state.isRunning,
            isPaused: state.isPaused,
            elapsed: state.elapsed,
            startTime: state.startTime,
            pausedTime: state.elapsed,
          },
        });

        get().saveState();
        get().updateNotification();
      } catch (error) {
        console.error('Error pausing timer:', error);
      }
    },

    resume: async () => {
      try {
        await ExpoStopwatch.resume();
        const state = await ExpoStopwatch.getState();

        set({
          timerState: {
            isRunning: state.isRunning,
            isPaused: state.isPaused,
            elapsed: state.elapsed,
            startTime: state.startTime,
            pausedTime: get().timerState.pausedTime,
          },
        });

        get().saveState();
        get().updateNotification();
      } catch (error) {
        console.error('Error resuming timer:', error);
      }
    },

    stop: async () => {
      try {
        const currentState = get().timerState;

        // Add session to history if timer was running
        if (currentState.isRunning && currentState.elapsed > 0) {
          const session: TimerSession = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            duration: currentState.elapsed,
            type: 'Stopped',
            startedAt: currentState.startTime || Date.now(),
            endedAt: Date.now(),
          };

          get().addSession(session);
        }

        await ExpoStopwatch.stop();
        const state = await ExpoStopwatch.getState();

        set({
          timerState: {
            isRunning: state.isRunning,
            isPaused: state.isPaused,
            elapsed: state.elapsed,
            startTime: state.startTime,
            pausedTime: 0,
          },
        });

        get().saveState();
        get().clearNotification();
      } catch (error) {
        console.error('Error stopping timer:', error);
      }
    },

    reset: async () => {
      try {
        await ExpoStopwatch.reset();
        const state = await ExpoStopwatch.getState();

        set({
          timerState: {
            isRunning: state.isRunning,
            isPaused: state.isPaused,
            elapsed: state.elapsed,
            startTime: state.startTime,
            pausedTime: 0,
          },
        });

        get().saveState();
        get().clearNotification();
      } catch (error) {
        console.error('Error resetting timer:', error);
      }
    },

    // Settings actions
    setNotificationsEnabled: (enabled: boolean) => {
      set({ notificationsEnabled: enabled });
      get().saveState();

      if (!enabled) {
        get().clearNotification();
      } else if (get().timerState.isRunning) {
        get().updateNotification();
      }
    },

    setBackgroundMode: (enabled: boolean) => {
      set({ backgroundMode: enabled });
      get().saveState();
    },

    setPersistData: (enabled: boolean) => {
      set({ persistData: enabled });
      get().saveState();
    },
    formatTime(milliseconds: number): string {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    },
    loadPersistedState: async () => {
      try {
        // Load timer state
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsed: TimerState = JSON.parse(savedState);

          // Restore native module state if timer was running
          if (parsed.isRunning) {
            if (parsed.isPaused) {
              await ExpoStopwatch.start();
              await ExpoStopwatch.pause();
            } else {
              await ExpoStopwatch.start();
            }
          }

          // Get current state from native module
          const nativeState = await ExpoStopwatch.getState();

          set({
            timerState: {
              isRunning: nativeState.isRunning,
              isPaused: nativeState.isPaused,
              elapsed: nativeState.elapsed,
              startTime: nativeState.startTime,
              pausedTime: parsed.pausedTime,
            },
          });
        }

        // Load sessions
        const savedSessions = await AsyncStorage.getItem(SESSIONS_KEY);
        if (savedSessions) {
          const sessions: TimerSession[] = JSON.parse(savedSessions);
          set({ sessions });
        }

        // Load settings
        const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          set({
            notificationsEnabled: settings.notificationsEnabled ?? true,
            backgroundMode: settings.backgroundMode ?? true,
            persistData: settings.persistData ?? true,
          });
        }

        // Update notification if timer is running
        const state = get();
        if (state.timerState.isRunning && state.notificationsEnabled) {
          state.updateNotification();
        }
      } catch (error) {
        console.error('Error loading persisted state:', error);
      }
    },

    saveState: async () => {
      try {
        const state = get();

        if (state.persistData) {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state.timerState)
          );
          await AsyncStorage.setItem(
            SESSIONS_KEY,
            JSON.stringify(state.sessions)
          );
          await AsyncStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify({
              notificationsEnabled: state.notificationsEnabled,
              backgroundMode: state.backgroundMode,
              persistData: state.persistData,
            })
          );
        }
      } catch (error) {
        console.error('Error saving state:', error);
      }
    },

    updateNotification: async () => {
      if (Platform.OS === 'web') return;

      const state = get();
      if (!state.notificationsEnabled) return;

      try {
        // const timeString = state.formatTime(state.timerState.elapsed);
        const timeString = state.formatTime(state.timerState.elapsed);
        const isPaused = state.timerState.isPaused;

        await Notifications.scheduleNotificationAsync({
          identifier: NOTIFICATION_ID,
          content: {
            title: 'Service Timer',
            body: `${isPaused ? '⏸️ Paused' : '⏱️ Running'}: ${timeString}`,
            sticky: true,
            priority: 'high',
            categoryIdentifier: 'timer_actions',
          },
          trigger: null,
        });
      } catch (error) {
        console.error('Error updating notification:', error);
      }
    },

    clearNotification: async () => {
      if (Platform.OS === 'web') return;

      try {
        await Notifications.dismissNotificationAsync(NOTIFICATION_ID);
      } catch (error) {
        console.error('Error clearing notification:', error);
      }
    },

    addSession: (session: TimerSession) => {
      set((state) => ({
        sessions: [session, ...state.sessions].slice(0, 50), // Keep only last 50 sessions
      }));
      get().saveState();
    },

    getWeeklyTotal: () => {
      const state = get();
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      return state.sessions
        .filter((session) => session.endedAt > oneWeekAgo)
        .reduce((total, session) => total + session.duration, 0);
    },

    getAverageSession: () => {
      const state = get();
      if (state.sessions.length === 0) return 0;

      const total = state.sessions.reduce(
        (sum, session) => sum + session.duration,
        0
      );
      return total / state.sessions.length;
    },
  }))
);

// Setup native module event listener
let stopwatchListener: any = null;

// Initialize native module listener
export const initializeNativeStopwatch = () => {
  if (Platform.OS === 'web') return;

  try {
    // Listen to native module events
    stopwatchListener = ExpoStopwatch.addListener('onChange', (event: any) => {
      const store = useTimerStore.getState();

      // Update store with native module state
      useTimerStore.setState({
        timerState: {
          ...store.timerState,
          elapsed: event.elapsed,
          isRunning: event.isRunning,
          isPaused: event.isPaused,
        },
      });

      // Update notification
      if (store.notificationsEnabled) {
        store.updateNotification();
      }
    });

    // Set optimal update interval (100ms)
    ExpoStopwatch.setUpdateInterval(100);
  } catch (error) {
    console.error('Error initializing native stopwatch:', error);
  }
};

// Cleanup function
export const cleanupNativeStopwatch = () => {
  if (stopwatchListener) {
    stopwatchListener.remove();
    stopwatchListener = null;
  }
};

// Setup notification handlers
export const setupNotificationHandlers = () => {
  if (Platform.OS === 'web') return;

  // Initialize native stopwatch
  initializeNativeStopwatch();

  // Handle notification responses (button presses)
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const actionId = response.actionIdentifier;
      const store = useTimerStore.getState();

      switch (actionId) {
        case 'pause':
          store.pause();
          break;
        case 'resume':
          store.resume();
          break;
        case 'stop':
          store.stop();
          break;
      }
    }
  );

  return () => {
    subscription.remove();
    cleanupNativeStopwatch();
  };
};
