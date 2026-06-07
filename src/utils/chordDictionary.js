import { midiNumberToNote, noteToMidiNumber } from './midiNotes.js'
import { formatRootNotation } from './harmonicField.js'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const CHORD_DICTIONARY_ROOTS = NOTE_NAMES

export const CHORD_DICT_RANGE_MIN = 'C4'
export const CHORD_DICT_RANGE_MAX = 'C6'

export const CHORD_DICT_BASS_RANGE_MIN = 'F1'
export const CHORD_DICT_BASS_RANGE_MAX = 'F2'

export const CHORD_DICTIONARY_BASS_ROOTS = NOTE_NAMES

const QUALITY_INTERVALS = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  '69': [0, 4, 7, 9, 14],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  mmaj7: [0, 3, 7, 11],
  m7b5: [0, 3, 6, 10],
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],
  '9': [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  mmaj9: [0, 3, 7, 11, 14],
  '7b9': [0, 4, 7, 10, 13],
  '7s9': [0, 4, 7, 10, 15],
  '11': [0, 4, 7, 10, 14, 17],
  maj11: [0, 4, 7, 11, 14, 17],
  '13': [0, 4, 7, 10, 14, 17, 21],
  maj13: [0, 4, 7, 11, 14, 17, 21],
  '5': [0, 7],
}

export const CHORD_DICTIONARY_QUALITIES = [
  { id: 'maj', suffix: '' },
  { id: 'min', suffix: 'm' },
  { id: 'dim', suffix: 'dim', altSuffix: 'º' },
  { id: 'aug', suffix: 'aug' },
  { id: 'sus2', suffix: 'sus2' },
  { id: 'sus4', suffix: 'sus4' },
  { id: '6', suffix: '6' },
  { id: 'm6', suffix: 'm6' },
  { id: '69', suffix: '6/9' },
  { id: '7', suffix: '7' },
  { id: 'maj7', suffix: 'maj7', altSuffix: '7M' },
  { id: 'm7', suffix: 'm7' },
  { id: 'mmaj7', suffix: 'mMaj7', altSuffix: 'm7M' },
  { id: 'm7b5', suffix: 'm7b5' },
  { id: 'add9', suffix: 'add9' },
  { id: 'madd9', suffix: 'm(add9)' },
  { id: '9', suffix: '9' },
  { id: 'maj9', suffix: 'Maj9', altSuffix: '9M' },
  { id: 'm9', suffix: 'm9' },
  { id: 'mmaj9', suffix: 'mMaj9' },
  { id: '7b9', suffix: '7b9' },
  { id: '7s9', suffix: '7#9' },
  { id: '11', suffix: '11' },
  { id: 'maj11', suffix: 'Maj11' },
  { id: '13', suffix: '13' },
  { id: 'maj13', suffix: 'Maj13', altSuffix: '13M' },
  { id: '5', suffix: '5' },
]

function rootToPitchClass(root) {
  const index = NOTE_NAMES.indexOf(root)
  return index === -1 ? 0 : index
}

export function formatChordDictionaryLabel(root, suffix = '') {
  return suffix ? `${root}${suffix}` : root
}

export function formatChordQualityLabel(root, quality, notation = 'sharp') {
  const displayRoot = formatRootNotation(root, notation)
  const primary = formatChordDictionaryLabel(displayRoot, quality.suffix)

  if (!quality.altSuffix) return primary

  const alternate =
    quality.altSuffix === 'º'
      ? `${displayRoot}º`
      : formatChordDictionaryLabel(displayRoot, quality.altSuffix)

  return `${primary} (${alternate})`
}

export function formatChordWithBass(
  chordRoot,
  qualityId,
  bassRootName,
  notation = 'sharp',
) {
  const displayRoot = formatRootNotation(chordRoot, notation)
  const label = formatChordDictionaryLabel(
    displayRoot,
    findChordQualitySuffix(qualityId),
  )

  if (rootToPitchClass(chordRoot) === rootToPitchClass(bassRootName)) {
    return label
  }

  const displayBass = formatRootNotation(bassRootName, notation)

  return `${label}/${displayBass}`
}

export function getChordPitchClasses(root, qualityId) {
  return getOrderedChordPitchClasses(root, qualityId)
}

function getOrderedChordPitchClasses(root, qualityId) {
  const rootPc = rootToPitchClass(root)
  const intervals = QUALITY_INTERVALS[qualityId] ?? QUALITY_INTERVALS.maj
  const pitchClasses = []
  const seen = new Set()

  for (const interval of intervals) {
    const pitchClass = (rootPc + interval) % 12

    if (!seen.has(pitchClass)) {
      seen.add(pitchClass)
      pitchClasses.push(pitchClass)
    }
  }

  return pitchClasses
}

function findMidiInRange(pitchClass, minMidi, maxMidi, afterMidi = null) {
  const start = afterMidi === null ? minMidi : afterMidi + 1

  for (let midi = start; midi <= maxMidi; midi++) {
    if (midi % 12 === pitchClass) return midi
  }

  return null
}

/** Voicing fechado mínimo: uma tecla por classe de altura, entre minNote e maxNote. */
export function getChordNotesInRange(
  root,
  qualityId,
  minNote = CHORD_DICT_RANGE_MIN,
  maxNote = CHORD_DICT_RANGE_MAX,
) {
  const minMidi = noteToMidiNumber(minNote)
  const maxMidi = noteToMidiNumber(maxNote)

  if (minMidi === null || maxMidi === null) return []

  const pitchClasses = getOrderedChordPitchClasses(root, qualityId)
  const notes = []
  let lastMidi = null

  for (const pitchClass of pitchClasses) {
    const midi = findMidiInRange(pitchClass, minMidi, maxMidi, lastMidi)

    if (midi === null) break

    notes.push(midiNumberToNote(midi))
    lastMidi = midi
  }

  return notes
}

function getChordVoicingMidi(
  root,
  qualityId,
  minNote = CHORD_DICT_RANGE_MIN,
  maxNote = CHORD_DICT_RANGE_MAX,
) {
  return getChordNotesInRange(root, qualityId, minNote, maxNote)
    .map((note) => noteToMidiNumber(note))
    .filter((midi) => midi !== null)
}

function invertVoicingRight(midiNotes) {
  if (midiNotes.length < 2) return [...midiNotes]

  const sorted = [...midiNotes].sort((a, b) => a - b)
  const bottom = sorted.shift()
  const rest = sorted
  let raised = bottom + 12
  const top = rest[rest.length - 1]

  while (raised <= top) {
    raised += 12
  }

  rest.push(raised)

  return rest.sort((a, b) => a - b)
}

export function applyVoicingInversion(baseMidiNotes, inversionIndex = 0) {
  if (!baseMidiNotes.length) return []

  const count = baseMidiNotes.length
  const steps = ((inversionIndex % count) + count) % count
  let midiNotes = [...baseMidiNotes].sort((a, b) => a - b)

  for (let step = 0; step < steps; step++) {
    midiNotes = invertVoicingRight(midiNotes)
  }

  return midiNotes.map((midi) => midiNumberToNote(midi))
}

export function getChordVoicingNotes(
  root,
  qualityId,
  inversionIndex = 0,
  minNote = CHORD_DICT_RANGE_MIN,
  maxNote = CHORD_DICT_RANGE_MAX,
) {
  const baseMidi = getChordVoicingMidi(root, qualityId, minNote, maxNote)

  return applyVoicingInversion(baseMidi, inversionIndex)
}

export function findChordQuality(qualityId) {
  return (
    CHORD_DICTIONARY_QUALITIES.find((quality) => quality.id === qualityId) ??
    CHORD_DICTIONARY_QUALITIES[0]
  )
}

export function findChordQualitySuffix(qualityId) {
  return findChordQuality(qualityId).suffix
}

function getBassMidiCandidates(
  bassRoot,
  minNote = CHORD_DICT_BASS_RANGE_MIN,
  maxNote = CHORD_DICT_BASS_RANGE_MAX,
) {
  const pitchClass = rootToPitchClass(bassRoot)
  const minMidi = noteToMidiNumber(minNote)
  const maxMidi = noteToMidiNumber(maxNote)

  if (minMidi === null || maxMidi === null) return []

  const midis = []

  for (let midi = minMidi; midi <= maxMidi; midi++) {
    if (midi % 12 === pitchClass) midis.push(midi)
  }

  return midis
}

export function getBassVoicingNotes(
  bassRoot,
  inversionIndex = 0,
  minNote = CHORD_DICT_BASS_RANGE_MIN,
  maxNote = CHORD_DICT_BASS_RANGE_MAX,
) {
  const midis = getBassMidiCandidates(bassRoot, minNote, maxNote)

  if (!midis.length) return []

  const index = ((inversionIndex % midis.length) + midis.length) % midis.length

  return [midiNumberToNote(midis[index])]
}

export function getBassInversionCount(
  bassRoot,
  minNote = CHORD_DICT_BASS_RANGE_MIN,
  maxNote = CHORD_DICT_BASS_RANGE_MAX,
) {
  return getBassMidiCandidates(bassRoot, minNote, maxNote).length
}

export function findChordBassInversionIndex(chordRoot, qualityId, bassRootName) {
  const pitchClasses = getOrderedChordPitchClasses(chordRoot, qualityId)
  const pitchClass = rootToPitchClass(bassRootName)

  return pitchClasses.indexOf(pitchClass)
}

export function getChordBassInversionCount(chordRoot, qualityId) {
  return getOrderedChordPitchClasses(chordRoot, qualityId).length
}

/** Inversão de baixo: fundamental = tônica, 1ª inv. = 3ª, 2ª inv. = 5ª, etc. */
export function getChordBassInversionNotes(
  chordRoot,
  qualityId,
  inversionIndex = 0,
  minNote = CHORD_DICT_BASS_RANGE_MIN,
  maxNote = CHORD_DICT_BASS_RANGE_MAX,
) {
  const pitchClasses = getOrderedChordPitchClasses(chordRoot, qualityId)

  if (!pitchClasses.length) return []

  const count = pitchClasses.length
  const index = ((inversionIndex % count) + count) % count
  const bassRootName = NOTE_NAMES[pitchClasses[index]]
  const midis = getBassMidiCandidates(bassRootName, minNote, maxNote)

  if (!midis.length) return []

  return [midiNumberToNote(midis[0])]
}

export function formatInversionLabel(inversionIndex, inversionCount) {
  if (inversionCount < 2) return 'Fundamental'

  if (inversionIndex === 0) return 'Fundamental'

  return `${inversionIndex}ª inv.`
}
