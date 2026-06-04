const SOLFEGE_NAMES = {
  C: 'Dó',
  D: 'Ré',
  E: 'Mi',
  F: 'Fá',
  G: 'Sol',
  A: 'Lá',
  B: 'Si',
}

export function parseNote(note) {
  const match = note.match(/^([A-G])(#?)(\d+)$/)
  if (!match) return null

  const [, letter, sharp, octave] = match
  return { letter, sharp, octave: Number(octave) }
}

export function formatWestern(note) {
  return note
}

export function formatSolfege(note) {
  const parsed = parseNote(note)
  if (!parsed) return note

  const { letter, sharp, octave } = parsed
  return `${SOLFEGE_NAMES[letter]}${sharp}${octave}`
}

export function formatNoteLabels(note) {
  return {
    western: formatWestern(note),
    solfege: formatSolfege(note),
  }
}
