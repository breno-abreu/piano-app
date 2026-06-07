import { formatRootNotation } from './harmonicField.js'

const SOLFEGE_NAMES = {
  C: 'Dó',
  D: 'Ré',
  E: 'Mi',
  F: 'Fá',
  G: 'Sol',
  A: 'Lá',
  B: 'Si',
}

const SOLFEGE_FLAT_NAMES = {
  Db: 'Réb',
  Eb: 'Mib',
  Gb: 'Solb',
  Ab: 'Láb',
  Bb: 'Sib',
}

export function parseNote(note) {
  const match = note.match(/^([A-G])(#?)(\d+)$/)
  if (!match) return null

  const [, letter, sharp, octave] = match
  return { letter, sharp, octave: Number(octave) }
}

export function formatWestern(note, accidentalNotation = 'sharp') {
  const parsed = parseNote(note)
  if (!parsed) return note

  const root = `${parsed.letter}${parsed.sharp}`
  const displayRoot = formatRootNotation(root, accidentalNotation)

  return `${displayRoot}${parsed.octave}`
}

export function formatSolfege(note, accidentalNotation = 'sharp') {
  const parsed = parseNote(note)
  if (!parsed) return note

  const root = `${parsed.letter}${parsed.sharp}`
  const displayRoot = formatRootNotation(root, accidentalNotation)

  if (SOLFEGE_FLAT_NAMES[displayRoot]) {
    return `${SOLFEGE_FLAT_NAMES[displayRoot]}${parsed.octave}`
  }

  const letter = displayRoot.replace('#', '')
  const sharp = displayRoot.includes('#') ? '#' : ''

  return `${SOLFEGE_NAMES[letter]}${sharp}${parsed.octave}`
}

export function formatNoteLabels(note, accidentalNotation = 'sharp') {
  return {
    western: formatWestern(note, accidentalNotation),
    solfege: formatSolfege(note, accidentalNotation),
  }
}
