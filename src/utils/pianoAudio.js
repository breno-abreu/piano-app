import Soundfont from 'soundfont-player'
import { isPianoMidiNote, midiNumberToNote } from './midiNotes.js'

let audioContext = null
let pianoInstrument = null
let masterGain = null
let initPromise = null
const activeNotes = new Map()
const sustainedNotes = new Set()

const MASTER_VOLUME = 4

function velocityToGain(velocity) {
  const normalized = Math.max(0, Math.min(127, velocity)) / 127
  return 0.45 + normalized * 0.55
}

export async function ensurePianoAudio() {
  if (initPromise) return initPromise

  initPromise = (async () => {
    audioContext = new AudioContext()
    masterGain = audioContext.createGain()
    masterGain.gain.value = MASTER_VOLUME
    masterGain.connect(audioContext.destination)

    pianoInstrument = await Soundfont.instrument(
      audioContext,
      'acoustic_grand_piano',
      { destination: masterGain },
    )
    return pianoInstrument
  })()

  return initPromise
}

async function resumeAudioContext() {
  await ensurePianoAudio()

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }
}

function stopNoteImmediately(midiNumber) {
  const node = activeNotes.get(midiNumber)
  if (!node) return

  if (typeof node.stop === 'function') {
    node.stop(audioContext.currentTime + 0.03)
  }

  activeNotes.delete(midiNumber)
  sustainedNotes.delete(midiNumber)
}

export async function playPianoNote(midiNumber, velocity = 100) {
  if (!isPianoMidiNote(midiNumber)) return

  await resumeAudioContext()

  sustainedNotes.delete(midiNumber)
  stopNoteImmediately(midiNumber)

  const noteName = midiNumberToNote(midiNumber)
  const node = pianoInstrument.play(noteName, audioContext.currentTime, {
    gain: velocityToGain(velocity),
  })

  activeNotes.set(midiNumber, node)
}

export async function releasePianoNote(midiNumber, options = {}) {
  if (!isPianoMidiNote(midiNumber)) return

  if (options.sustainPedalDown) {
    if (activeNotes.has(midiNumber)) {
      sustainedNotes.add(midiNumber)
    }
    return
  }

  stopNoteImmediately(midiNumber)
}

export function releaseSustainedPianoNotes() {
  for (const midiNumber of sustainedNotes) {
    stopNoteImmediately(midiNumber)
  }

  sustainedNotes.clear()
}

export function stopAllPianoNotes() {
  for (const midiNumber of activeNotes.keys()) {
    stopNoteImmediately(midiNumber)
  }

  sustainedNotes.clear()
}
