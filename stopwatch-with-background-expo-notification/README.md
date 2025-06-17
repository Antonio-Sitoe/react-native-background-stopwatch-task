# Service Timer App with Native Stopwatch Module

A high-performance service timer application built with Expo and React Native, featuring a custom native module for optimal stopwatch performance.

## Features

- **Native Stopwatch Module**: High-performance timer implementation using native code
- **Background Notifications**: Timer continues running with notification controls when app is minimized
- **Persistent State**: Timer state survives app restarts and device reboots
- **Session History**: Track completed and stopped timer sessions
- **Zustand State Management**: Efficient state management with automatic persistence
- **Cross-Platform**: Works on iOS, Android, and Web

## Architecture

### Native Module (`expo-stopwatch`)

The app uses a custom Expo native module for the stopwatch functionality to ensure:
- **Memory Efficiency**: Native timer implementation reduces JavaScript thread overhead
- **Precision**: High-precision timing using native platform APIs
- **Background Performance**: Optimal performance when app is backgrounded
- **Battery Optimization**: Native timers are more battery-efficient

### State Management

- **Zustand Store**: Centralized state management with selective subscriptions
- **Automatic Persistence**: State automatically saved to AsyncStorage
- **Event-Driven Updates**: Native module events update the store in real-time

### Notification System

- **Interactive Notifications**: Pause, resume, and stop controls in notifications
- **Background Updates**: Notifications update automatically with current timer state
- **Platform Optimized**: Uses Expo Notifications for cross-platform compatibility

## Project Structure

```
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Timer screen
│   │   ├── history.tsx          # Session history
│   │   └── settings.tsx         # App settings
│   └── _layout.tsx              # Root layout
├── modules/                      # Native modules
│   └── expo-stopwatch/          # Custom stopwatch module
│       ├── src/                 # TypeScript interface
│       ├── ios/                 # iOS native implementation
│       ├── android/             # Android native implementation
│       └── package.json         # Module configuration
├── stores/                       # State management
│   └── timerStore.ts            # Zustand store with native integration
└── hooks/                        # Custom hooks
    └── useFrameworkReady.ts     # Framework initialization
```

## Native Module Details

### iOS Implementation (Swift)
- Uses `Timer.scheduledTimer` for high-precision updates
- Main thread execution for UI consistency
- Memory-efficient state management

### Android Implementation (Kotlin)
- Uses `Handler` with `Looper.getMainLooper()` for UI thread updates
- Coroutines for async operations
- Optimized for battery usage

### Web Implementation (TypeScript)
- Fallback JavaScript implementation for web platform
- Uses `setInterval` with configurable update frequency
- Maintains API compatibility with native implementations

## Performance Optimizations

1. **Native Timer**: Reduces JavaScript thread load
2. **Selective Subscriptions**: Zustand prevents unnecessary re-renders
3. **Event-Driven Updates**: Only updates when timer state changes
4. **Memory Management**: Limited session history (50 sessions max)
5. **Configurable Update Interval**: Adjustable precision vs. performance

## Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the native module:
   ```bash
   cd modules/expo-stopwatch
   npm run build
   cd ../..
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

### Basic Timer Operations
```typescript
import { useTimerStore } from '@/stores/timerStore';

const { start, pause, resume, stop, reset, timerState } = useTimerStore();

// Start timer
await start();

// Pause timer
await pause();

// Resume timer
await resume();

// Stop and reset timer
await stop();
```

### Native Module Direct Usage
```typescript
import ExpoStopwatch from '@/modules/expo-stopwatch/src';

// Start native stopwatch
await ExpoStopwatch.start();

// Listen to native events
const listener = ExpoStopwatch.addListener('onChange', (event) => {
  console.log('Timer updated:', event.elapsed);
});

// Set update interval (milliseconds)
await ExpoStopwatch.setUpdateInterval(100);
```

## Configuration

### Update Interval
The native module supports configurable update intervals:
- Minimum: 50ms (20 FPS)
- Default: 100ms (10 FPS)
- Recommended: 100-200ms for optimal battery life

### Notification Settings
- Enable/disable background notifications
- Configure notification actions
- Customize notification appearance

## Building for Production

1. **iOS**: 
   ```bash
   expo build:ios
   ```

2. **Android**:
   ```bash
   expo build:android
   ```

3. **Web**:
   ```bash
   npm run build:web
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes to the native module or app code
4. Test on all platforms (iOS, Android, Web)
5. Submit a pull request

## License

MIT License - see LICENSE file for details.