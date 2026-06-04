const NOTE_LETTERS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const PIANO_MIDI_MIN = 21
export const PIANO_MIDI_MAX = 108
export const SUSTAIN_PEDAL_CC = 64

export function midiNumberToNote(midiNumber) {
  const octave = Math.floor(midiNumber / 12) - 1
  const letter = NOTE_LETTERS[midiNumber % 12]
  return `${letter}${octave}`
}

export function isPianoMidiNote(midiNumber) {
  return midiNumber >= PIANO_MIDI_MIN && midiNumber <= PIANO_MIDI_MAX
}

export function noteToMidiNumber(note) {
  const match = note.match(/^([A-G])(#?)(\d+)$/)
  if (!match) return null

  const [, letter, sharp, octaveStr] = match
  const name = `${letter}${sharp}`
  const index = NOTE_LETTERS.indexOf(name)

  if (index === -1) return null

  return (Number(octaveStr) + 1) * 12 + index
}
