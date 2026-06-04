import { midiNumberToNote } from './midiNotes.js'

export const PIANO_ROLL_FALL_MS = 3500

export function buildPianoRollNotes(events) {
  const active = new Map()
  const notes = []
  let lastTimeMs = 0

  for (const event of events) {
    if (event.timeMs > lastTimeMs) {
      lastTimeMs = event.timeMs
    }

    if (event.kind !== 'noteOn' && event.kind !== 'noteOff') continue

    if (event.kind === 'noteOn') {
      active.set(event.midiNumber, {
        startMs: event.timeMs,
        velocity: event.velocity ?? 96,
      })
      continue
    }

    const started = active.get(event.midiNumber)
    if (!started) continue

    const durationMs = Math.max(40, event.timeMs - started.startMs)
    notes.push({
      id: `${event.midiNumber}-${started.startMs}`,
      midiNumber: event.midiNumber,
      startMs: started.startMs,
      endMs: event.timeMs,
      durationMs,
      velocity: started.velocity,
    })
    active.delete(event.midiNumber)
  }

  for (const [midiNumber, started] of active) {
    const durationMs = Math.max(120, lastTimeMs - started.startMs)
    notes.push({
      id: `${midiNumber}-${started.startMs}`,
      midiNumber,
      startMs: started.startMs,
      endMs: started.startMs + durationMs,
      durationMs,
      velocity: started.velocity,
    })
  }

  return notes.sort((a, b) => a.startMs - b.startMs)
}

export function buildKeyLayoutMap(whiteKeys, blackKeys, whiteKeyCount, blackKeyWidthPercent) {
  const map = new Map()
  const whiteWidth = 100 / whiteKeyCount

  for (const key of whiteKeys) {
    map.set(key.note, {
      left: key.whiteIndex * whiteWidth,
      width: whiteWidth,
      isBlack: false,
    })
  }

  for (const key of blackKeys) {
    map.set(key.note, {
      left: (key.anchorWhiteIndex + 1) * whiteWidth - blackKeyWidthPercent / 2,
      width: blackKeyWidthPercent,
      isBlack: true,
    })
  }

  return map
}

export function getVisiblePianoRollNotes(notes, positionMs, keyLayout, fallTimeMs = PIANO_ROLL_FALL_MS) {
  const windowStart = positionMs - fallTimeMs * 0.15
  const windowEnd = positionMs + fallTimeMs

  return notes
    .filter((note) => note.endMs > windowStart && note.startMs < windowEnd)
    .map((note) => {
      const noteName = midiNumberToNote(note.midiNumber)
      const layout = keyLayout.get(noteName)
      if (!layout) return null

      const timeUntilHit = note.startMs - positionMs
      const bottomPercent = 100 - (timeUntilHit / fallTimeMs) * 100
      const heightPercent = Math.max(
        1.2,
        (note.durationMs / fallTimeMs) * 100,
      )
      const topPercent = bottomPercent - heightPercent

      if (bottomPercent < -8 || topPercent > 108) return null

      const velocityAlpha = 0.55 + (note.velocity / 127) * 0.45

      return {
        id: note.id,
        isBlack: layout.isBlack,
        velocityAlpha,
        style: {
          left: `${layout.left}%`,
          width: `${layout.width}%`,
          top: `${topPercent}%`,
          height: `${heightPercent}%`,
        },
      }
    })
    .filter(Boolean)
}
