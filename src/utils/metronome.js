export const METRONOME_TIME_SIGNATURES = ['3/4', '4/4', '6/8']

export const MIN_BPM = 40
export const MAX_BPM = 240

const BEATS_PER_BAR = {
  '3/4': 3,
  '4/4': 4,
  '6/8': 6,
}

const SCHEDULE_AHEAD_SEC = 0.1
const LOOKAHEAD_MS = 25

export function getMetronomeBeatsPerBar(timeSignature) {
  return BEATS_PER_BAR[timeSignature] ?? 4
}

export function createMetronome() {
  let audioContext = null
  let masterGain = null
  let schedulerTimer = null
  let nextTickTime = 0
  let tickIndex = 0
  let running = false
  let bpm = 120
  let timeSignature = '4/4'
  let onTick = null
  let pendingVisualTimers = []

  async function ensureContext() {
    if (!audioContext) {
      audioContext = new AudioContext()
      masterGain = audioContext.createGain()
      masterGain.gain.value = 0.45
      masterGain.connect(audioContext.destination)
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    return audioContext
  }

  function beatsPerBar() {
    return BEATS_PER_BAR[timeSignature] ?? 4
  }

  function tickInterval() {
    return 60 / bpm
  }

  function accentForTick(index) {
    if (index === 0) return 'strong'
    if (timeSignature === '6/8' && index === 3) return 'medium'
    return 'normal'
  }

  function playTick(when, accent) {
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()

    osc.type = 'sine'
    osc.connect(gain)
    gain.connect(masterGain)

    const frequency = accent === 'strong' ? 1200 : accent === 'medium' ? 900 : 700
    const volume = accent === 'strong' ? 0.9 : accent === 'medium' ? 0.55 : 0.35

    osc.frequency.setValueAtTime(frequency, when)
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(volume, when + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.04)

    osc.start(when)
    osc.stop(when + 0.05)
  }

  function clearVisualTimers() {
    for (const timerId of pendingVisualTimers) {
      window.clearTimeout(timerId)
    }

    pendingVisualTimers = []
  }

  function notifyTick(beatIndex, accent, when) {
    if (!onTick || !audioContext) return

    const delayMs = Math.max(0, (when - audioContext.currentTime) * 1000)
    const timerId = window.setTimeout(() => {
      if (running) {
        onTick(beatIndex, accent)
      }
    }, delayMs)

    pendingVisualTimers.push(timerId)
  }

  function scheduler() {
    if (!running || !audioContext) return

    while (nextTickTime < audioContext.currentTime + SCHEDULE_AHEAD_SEC) {
      const beatIndex = tickIndex
      const accent = accentForTick(beatIndex)

      playTick(nextTickTime, accent)
      notifyTick(beatIndex, accent, nextTickTime)
      nextTickTime += tickInterval()
      tickIndex = (tickIndex + 1) % beatsPerBar()
    }
  }

  function startSchedulerLoop() {
    schedulerTimer = window.setInterval(scheduler, LOOKAHEAD_MS)
  }

  function stopSchedulerLoop() {
    if (schedulerTimer !== null) {
      window.clearInterval(schedulerTimer)
      schedulerTimer = null
    }
  }

  return {
    async start() {
      if (running) return

      await ensureContext()
      running = true
      tickIndex = 0
      nextTickTime = audioContext.currentTime + 0.05
      scheduler()
      startSchedulerLoop()
    },

    stop() {
      running = false
      clearVisualTimers()
      stopSchedulerLoop()
    },

    setOnTick(callback) {
      onTick = typeof callback === 'function' ? callback : null
    },

    setBpm(value) {
      bpm = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)))
    },

    getBpm() {
      return bpm
    },

    setTimeSignature(value) {
      if (!BEATS_PER_BAR[value]) return
      timeSignature = value
      tickIndex = 0
    },

    getTimeSignature() {
      return timeSignature
    },

    isRunning() {
      return running
    },

    dispose() {
      this.stop()
      clearVisualTimers()

      if (audioContext) {
        audioContext.close()
        audioContext = null
        masterGain = null
      }
    },
  }
}
