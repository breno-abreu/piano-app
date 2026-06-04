import { noteToMidiNumber } from './midiNotes.js'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
}

const ROMAN_NUMERALS_7 = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const ROMAN_NUMERALS_5 = ['I', 'II', 'III', 'IV', 'V']

export const HARMONIC_SCALE_TYPES = [
  { id: 'major', label: 'Maior' },
  { id: 'minor', label: 'Menor' },
  { id: 'pentatonic', label: 'Pentatônica' },
]

export const HARMONIC_TONICS = NOTE_NAMES

const TONIC_FLAT_NAMES = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
}

export function formatHarmonicTonicLabel(tonic) {
  const flatName = TONIC_FLAT_NAMES[tonic]

  return flatName ? `${tonic} / ${flatName}` : tonic
}

function tonicToPitchClass(tonic) {
  const index = NOTE_NAMES.indexOf(tonic)
  return index === -1 ? 0 : index
}

export function getScalePitchClasses(tonic, scaleType) {
  const root = tonicToPitchClass(tonic)
  const intervals = SCALE_INTERVALS[scaleType] ?? SCALE_INTERVALS.major

  return intervals.map((interval) => (root + interval) % 12)
}

function pitchClassToName(pitchClass) {
  return NOTE_NAMES[pitchClass]
}

function getTriadQuality(rootPc, thirdPc, fifthPc) {
  const thirdInterval = (thirdPc - rootPc + 12) % 12
  const fifthInterval = (fifthPc - rootPc + 12) % 12

  if (thirdInterval === 4 && fifthInterval === 7) return 'major'
  if (thirdInterval === 3 && fifthInterval === 7) return 'minor'
  if (thirdInterval === 3 && fifthInterval === 6) return 'dim'
  if (thirdInterval === 5 && fifthInterval === 7) return 'sus4'
  if (thirdInterval === 2 && fifthInterval === 7) return 'sus2'

  return 'other'
}

function buildChordSymbol(rootPc, thirdPc, fifthPc) {
  const rootName = pitchClassToName(rootPc)
  const quality = getTriadQuality(rootPc, thirdPc, fifthPc)

  if (quality === 'major') return rootName
  if (quality === 'minor') return `${rootName}m`
  if (quality === 'dim') return `${rootName}°`
  if (quality === 'sus4') return `${rootName}sus4`
  if (quality === 'sus2') return `${rootName}sus2`

  return `${rootName}(${pitchClassToName(thirdPc)}-${pitchClassToName(fifthPc)})`
}

function formatRomanNumeral(index, quality, scaleType) {
  const numerals =
    scaleType === 'pentatonic' ? ROMAN_NUMERALS_5 : ROMAN_NUMERALS_7
  let numeral = numerals[index]

  if (scaleType === 'major') {
    if (quality === 'minor' || quality === 'dim') {
      numeral = numeral.toLowerCase()
    }

    if (quality === 'dim') {
      numeral += '°'
    }

    return numeral
  }

  if (scaleType === 'minor') {
    if (quality !== 'major') {
      numeral = numeral.toLowerCase()
    }

    if (quality === 'dim') {
      numeral += '°'
    }

    return numeral
  }

  if (quality === 'minor' || quality === 'dim') {
    numeral = numeral.toLowerCase()
  }

  if (quality === 'dim') {
    numeral += '°'
  }

  return numeral
}

function buildTriadsFromScale(scalePitchClasses, scaleType) {
  const length = scalePitchClasses.length

  return scalePitchClasses.map((rootPc, index) => {
    const thirdPc = scalePitchClasses[(index + 2) % length]
    const fifthPc = scalePitchClasses[(index + 4) % length]
    const quality = getTriadQuality(rootPc, thirdPc, fifthPc)

    return {
      id: `${scaleType}-${rootPc}-${index}`,
      degree: formatRomanNumeral(index, quality, scaleType),
      symbol: buildChordSymbol(rootPc, thirdPc, fifthPc),
      pitchClasses: [rootPc, thirdPc, fifthPc],
      quality,
    }
  })
}

export function buildHarmonicField(tonic, scaleType) {
  const scalePitchClasses = getScalePitchClasses(tonic, scaleType)
  const chords = buildTriadsFromScale(scalePitchClasses, scaleType)

  return {
    tonic,
    scaleType,
    scalePitchClasses,
    chords,
  }
}

export function notePitchClass(note) {
  const midi = noteToMidiNumber(note)

  if (midi === null) return null

  return midi % 12
}

export function isNoteInPitchClassSet(note, pitchClasses) {
  const pitchClass = notePitchClass(note)

  if (pitchClass === null) return false

  return pitchClasses.includes(pitchClass)
}
