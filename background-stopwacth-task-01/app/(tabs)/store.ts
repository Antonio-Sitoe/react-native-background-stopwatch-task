import { create } from 'zustand'

interface TimerState {
  isRunning: boolean
  time: number
  startTime: number | null
  pausedTime: number
  setRunning: (value: boolean) => void
  setTime: (time: number) => void
  setStartTime: (time: number | null) => void
  setPausedTime: (time: number) => void
  reset: () => void
}

export const useTimerStore = create<TimerState>((set) => ({
  isRunning: false,
  time: 0,
  startTime: null,
  pausedTime: 0,
  setRunning: (value) => set({ isRunning: value }),
  setTime: (time) => set({ time }),
  setStartTime: (time) => set({ startTime: time }),
  setPausedTime: (time) => set({ pausedTime: time }),
  reset: () =>
    set({
      isRunning: false,
      time: 0,
      startTime: null,
      pausedTime: 0,
    }),
}))

export default {}
