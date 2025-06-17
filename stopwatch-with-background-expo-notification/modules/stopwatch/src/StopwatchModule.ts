import { NativeModule, requireNativeModule } from 'expo';

import { StopwatchModuleEvents } from './Stopwatch.types';

export interface StopwatchState {
  isRunning: boolean;
  isPaused: boolean;
  elapsed: number;
  startTime: number | null;
}
declare class StopwatchModule extends NativeModule<StopwatchModuleEvents> {
  PI: number;
  hello(): string;
  start(): Promise<void>;
  // Pause the stopwatch
  pause(): Promise<void>;
  // Resume the stopwatch
  resume(): Promise<void>;
  // Stop and reset the stopwatch
  stop(): Promise<void>;
  // Get current state
  getState(): Promise<StopwatchState>;
  // Reset the stopwatch
  reset(): Promise<void>;
  // Set update interval (in milliseconds)
  setUpdateInterval(interval: number): Promise<void>;
}

export default requireNativeModule<StopwatchModule>('Stopwatch');
