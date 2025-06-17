// Reexport the native module. On web, it will be resolved to StopwatchModule.web.ts
// and on native platforms to StopwatchModule.ts
export { default } from './src/StopwatchModule';
export * from './src/Stopwatch.types';
