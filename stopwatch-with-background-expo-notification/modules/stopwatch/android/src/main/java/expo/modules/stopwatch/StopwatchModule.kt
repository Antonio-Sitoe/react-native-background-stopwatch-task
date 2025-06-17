package expo.modules.stopwatch

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.os.Handler
import android.os.Looper
import java.net.URL


class StopwatchModule : Module() {
  private var isRunning = false
  private var isPaused = false
  private var elapsed: Long = 0
  private var startTime: Long? = null
  private var handler: Handler? = null
  private var runnable: Runnable? = null
  private var updateInterval: Long = 100L // default update interval

  override fun definition() = ModuleDefinition {
    Name("Stopwatch")

   
    Events("onChange")

    AsyncFunction("start") {
      start()
    }

    AsyncFunction("pause") {
      pause()
    }

    AsyncFunction("resume") {
      resume()
    }

    AsyncFunction("stop") {
      stop()
    }

    AsyncFunction("reset") {
      reset()
    }

    AsyncFunction("getState") {
      getState()
    }

    AsyncFunction("setUpdateInterval") { interval: Double ->
      setUpdateInterval(interval)
    }

    Function("hello") {
      "Hello world! 👋"
    }
  }

   private fun start() {
    if (isRunning) return

    isRunning = true
    isPaused = false
    startTime = System.currentTimeMillis()
    elapsed = 0L

    startTimer()
    emitChange()
  }

  private fun pause() {
    if (!isRunning || isPaused) return

    isPaused = true
    startTime?.let {
      elapsed += System.currentTimeMillis() - it
    }
    startTime = null

    stopTimer()
    emitChange()
  }

  private fun resume() {
    if (!isRunning || !isPaused) return

    isPaused = false
    startTime = System.currentTimeMillis()

    startTimer()
    emitChange()
  }

  private fun stop() {
    isRunning = false
    isPaused = false
    elapsed = 0L
    startTime = null

    stopTimer()
    emitChange()
  }

  private fun reset() {
    stop()
  }

  private fun getState(): Map<String, Any?> {
    val currentElapsed = if (isRunning && !isPaused && startTime != null) {
      elapsed + (System.currentTimeMillis() - startTime!!)
    } else {
      elapsed
    }

    return mapOf(
      "isRunning" to isRunning,
      "isPaused" to isPaused,
      "elapsed" to currentElapsed,
      "startTime" to startTime
    )
  }

  private fun setUpdateInterval(interval: Double) {
    updateInterval = maxOf(50L, interval.toLong()) // Enforce minimum interval

    if (handler != null) {
      stopTimer()
      startTimer()
    }
  }

  private fun startTimer() {
    if (handler != null) return

    handler = Handler(Looper.getMainLooper())
    runnable = object : Runnable {
      override fun run() {
        emitChange()
        handler?.postDelayed(this, updateInterval)
      }
    }

    handler?.post(runnable!!)
  }

  private fun stopTimer() {
    runnable?.let { handler?.removeCallbacks(it) }
    handler = null
    runnable = null
  }

  private fun emitChange() {
    val currentElapsed = if (isRunning && !isPaused && startTime != null) {
      elapsed + (System.currentTimeMillis() - startTime!!)
    } else {
      elapsed
    }

    sendEvent("onChange", mapOf(
      "elapsed" to currentElapsed,
      "isRunning" to isRunning,
      "isPaused" to isPaused
    ))
  }
}
