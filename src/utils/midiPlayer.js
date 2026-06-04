export function createMidiPlayer(events, callbacks = {}) {
  let status = 'stopped'
  let timers = []
  let playOffsetMs = 0
  let playStartedAt = 0
  let progressRaf = null
  let playbackRate = 1

  function getBaseDurationMs() {
    return events.length ? events[events.length - 1].timeMs : 0
  }

  function getPositionMs() {
    if (status === 'playing') {
      return (
        playOffsetMs + (performance.now() - playStartedAt) * playbackRate
      )
    }

    return playOffsetMs
  }

  function clearTimers() {
    for (const timerId of timers) {
      window.clearTimeout(timerId)
    }

    timers = []
  }

  function stopProgressLoop() {
    if (progressRaf !== null) {
      cancelAnimationFrame(progressRaf)
      progressRaf = null
    }
  }

  function emitProgress() {
    callbacks.onProgress?.(getPositionMs(), getBaseDurationMs())
  }

  function startProgressLoop() {
    stopProgressLoop()

    const tick = () => {
      if (status !== 'playing') return

      emitProgress()
      progressRaf = requestAnimationFrame(tick)
    }

    progressRaf = requestAnimationFrame(tick)
  }

  function dispatch(event) {
    if (status !== 'playing') return

    if (event.kind === 'noteOn') {
      callbacks.onNoteOn?.(event.midiNumber, event.velocity)
      return
    }

    if (event.kind === 'noteOff') {
      callbacks.onNoteOff?.(event.midiNumber)
      return
    }

    if (event.kind === 'sustain') {
      callbacks.onSustainPedal?.(event.value)
    }
  }

  function scheduleFrom(offsetMs) {
    clearTimers()

    const pending = events.filter((event) => event.timeMs >= offsetMs)
    const endMs = events.length ? events[events.length - 1].timeMs : offsetMs
    const rate = playbackRate > 0 ? playbackRate : 1

    for (const event of pending) {
      const delay = Math.max(0, (event.timeMs - offsetMs) / rate)
      const timerId = window.setTimeout(() => {
        dispatch(event)
      }, delay)

      timers.push(timerId)
    }

    timers.push(
      window.setTimeout(() => {
        if (status !== 'playing') return

        status = 'stopped'
        playOffsetMs = 0
        clearTimers()
        stopProgressLoop()
        emitProgress()
        callbacks.onFinish?.()
      }, Math.max(0, (endMs - offsetMs) / rate) + 50),
    )
  }

  function seek(toMs) {
    const duration = getBaseDurationMs()
    const clamped = Math.max(0, Math.min(toMs, duration))
    const wasPlaying = status === 'playing'

    clearTimers()
    stopProgressLoop()
    callbacks.onSeek?.(clamped)

    playOffsetMs = clamped

    if (wasPlaying) {
      status = 'playing'
      playStartedAt = performance.now()
      scheduleFrom(clamped)
      startProgressLoop()
      emitProgress()
      return
    }

    emitProgress()
  }

  function setPlaybackRate(rate) {
    const nextRate = Math.max(0.15, Math.min(6, rate))

    if (status === 'playing') {
      const currentPos = getPositionMs()
      playbackRate = nextRate
      playOffsetMs = currentPos
      playStartedAt = performance.now()
      scheduleFrom(currentPos)
      startProgressLoop()
      emitProgress()
      return
    }

    playbackRate = nextRate
    emitProgress()
  }

  return {
    play(fromMs = 0) {
      status = 'playing'
      playOffsetMs = fromMs
      playStartedAt = performance.now()
      scheduleFrom(fromMs)
      startProgressLoop()
      emitProgress()
    },

    pause() {
      if (status !== 'playing') return

      playOffsetMs = getPositionMs()
      status = 'paused'
      clearTimers()
      stopProgressLoop()
      emitProgress()
      callbacks.onPause?.(playOffsetMs)
    },

    stop() {
      status = 'stopped'
      playOffsetMs = 0
      clearTimers()
      stopProgressLoop()
      emitProgress()
      callbacks.onStop?.()
    },

    resume() {
      if (status !== 'paused') return

      this.play(playOffsetMs)
    },

    seek(toMs) {
      seek(toMs)
    },

    setPlaybackRate(rate) {
      setPlaybackRate(rate)
    },

    getPlaybackRate() {
      return playbackRate
    },

    getStatus() {
      return status
    },

    getPositionMs() {
      return getPositionMs()
    },

    getDurationMs() {
      return getBaseDurationMs()
    },

    dispose() {
      stopProgressLoop()
      this.stop()
    },
  }
}
