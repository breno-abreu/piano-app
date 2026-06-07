import {
  getRhythmicFigure,
  getRhythmicPlacementAt,
} from './rhythmicFigures.js'

const SCHEDULE_AHEAD_SEC = 0.1
const LOOKAHEAD_MS = 25
const METRONOME_BASE_VOLUME = 0.45
const METRONOME_TICK_FREQUENCY = 1200
const METRONOME_TICK_VOLUME = 0.9

function beatDurationSec(bpm) {
  return 60 / bpm
}

export function buildCountInEvents(beatsPerBar, bpm) {
  const beatDuration = beatDurationSec(bpm)

  return Array.from({ length: beatsPerBar }, (_, beatIndex) => ({
    offsetSec: beatIndex * beatDuration,
    beatIndex,
    playSound: true,
    phase: 'count-in',
  }))
}

export function buildRhythmicTickEvents(score, measureCount, beatsPerBar, bpm) {
  const beatDuration = beatDurationSec(bpm)
  const events = []
  let time = 0

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
    for (let beatIndex = 0; beatIndex < beatsPerBar; beatIndex += 1) {
      const placement = getRhythmicPlacementAt(score, measureIndex, beatIndex)
      if (placement?.isContinuation) continue

      const figure = placement
        ? getRhythmicFigure(placement.figureId)
        : null
      const beatSpan = figure?.beats ?? 1
      const hits = figure?.hits ?? 0

      if (hits <= 0) {
        events.push({
          offsetSec: time,
          measureIndex,
          beatIndex,
          playSound: false,
          phase: 'sequence',
        })
        time += beatDuration * beatSpan
        continue
      }

      const subDuration = beatDuration / hits
      for (let hitIndex = 0; hitIndex < hits; hitIndex += 1) {
        events.push({
          offsetSec: time + hitIndex * subDuration,
          measureIndex,
          beatIndex,
          playSound: true,
          phase: 'sequence',
        })
      }

      time += beatDuration * beatSpan
    }
  }

  return {
    events,
    durationSec: time,
  }
}

export function createRhythmicPlayer() {
  let audioContext = null
  let masterGain = null
  let userVolume = 1
  let schedulerTimer = null
  let pendingVisualTimers = []
  let running = false
  let bpm = 120
  let phase = 'idle'
  let countInEvents = []
  let countInDuration = 0
  let countInIdx = 0
  let countInAnchor = 0
  let sequenceEvents = []
  let sequenceDuration = 0
  let sequenceIdx = 0
  let loopAnchor = 0
  let onStep = null

  async function ensureContext() {
    if (!audioContext) {
      audioContext = new AudioContext()
      masterGain = audioContext.createGain()
      masterGain.gain.value = METRONOME_BASE_VOLUME * userVolume
      masterGain.connect(audioContext.destination)
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    return audioContext
  }

  function playTick(when) {
    if (!audioContext) return

    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()

    osc.type = 'sine'
    osc.connect(gain)
    gain.connect(masterGain)

    osc.frequency.setValueAtTime(METRONOME_TICK_FREQUENCY, when)
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(METRONOME_TICK_VOLUME, when + 0.002)
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

  function notifyStep(event, when) {
    if (!onStep || !audioContext) return

    const delayMs = Math.max(0, (when - audioContext.currentTime) * 1000)
    const timerId = window.setTimeout(() => {
      if (!running) return

      if (event.phase === 'count-in') {
        onStep(null, event.beatIndex, 'count-in')
        return
      }

      onStep(event.measureIndex, event.beatIndex, 'sequence')
    }, delayMs)

    pendingVisualTimers.push(timerId)
  }

  function rebuildEvents(score, measureCount, beatsPerBar) {
    countInEvents = buildCountInEvents(beatsPerBar, bpm)
    countInDuration = beatsPerBar * beatDurationSec(bpm)

    const sequence = buildRhythmicTickEvents(
      score,
      measureCount,
      beatsPerBar,
      bpm,
    )
    sequenceEvents = sequence.events
    sequenceDuration = sequence.durationSec
  }

  function scheduleCountIn(now) {
    while (countInIdx < countInEvents.length) {
      const event = countInEvents[countInIdx]
      const when = countInAnchor + event.offsetSec

      if (when > now + SCHEDULE_AHEAD_SEC) break

      if (event.playSound) {
        playTick(when)
      }
      notifyStep(event, when)
      countInIdx += 1
    }

    if (countInIdx >= countInEvents.length) {
      phase = 'sequence'
      loopAnchor = countInAnchor + countInDuration
      sequenceIdx = 0
    }
  }

  function scheduleSequence(now) {
    if (sequenceDuration <= 0) return

    while (sequenceIdx < sequenceEvents.length) {
      const event = sequenceEvents[sequenceIdx]
      const when = loopAnchor + event.offsetSec

      if (when > now + SCHEDULE_AHEAD_SEC) break

      if (event.playSound) {
        playTick(when)
      }
      notifyStep(event, when)
      sequenceIdx += 1
    }

    if (sequenceIdx >= sequenceEvents.length) {
      loopAnchor += sequenceDuration
      sequenceIdx = 0
    }
  }

  function scheduler() {
    if (!running || !audioContext) return

    const now = audioContext.currentTime

    if (phase === 'count-in') {
      scheduleCountIn(now)
      return
    }

    scheduleSequence(now)
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

  function resetPlaybackState() {
    phase = 'idle'
    countInIdx = 0
    countInAnchor = 0
    sequenceIdx = 0
    loopAnchor = 0
  }

  return {
    async start(score, measureCount, beatsPerBar) {
      if (running) return

      await ensureContext()
      rebuildEvents(score, measureCount, beatsPerBar)

      if (sequenceEvents.length === 0 && countInEvents.length === 0) return

      running = true
      phase = 'count-in'
      countInIdx = 0
      sequenceIdx = 0
      countInAnchor = audioContext.currentTime + 0.05
      loopAnchor = 0
      scheduler()
      startSchedulerLoop()
    },

    stop() {
      running = false
      clearVisualTimers()
      stopSchedulerLoop()
      resetPlaybackState()

      if (onStep) {
        onStep(null, null, 'idle')
      }
    },

    setOnStep(callback) {
      onStep = typeof callback === 'function' ? callback : null
    },

    setBpm(value) {
      bpm = Math.max(40, Math.min(240, Math.round(value)))
    },

    isRunning() {
      return running
    },

    setVolume(percent) {
      userVolume = Math.max(0, Math.min(100, Math.round(percent))) / 100

      if (masterGain) {
        masterGain.gain.value = METRONOME_BASE_VOLUME * userVolume
      }
    },

    dispose() {
      this.stop()

      if (audioContext) {
        audioContext.close()
        audioContext = null
        masterGain = null
      }
    },
  }
}
