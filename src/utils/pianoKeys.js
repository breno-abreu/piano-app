const OCTAVE_PATTERN = [
  { note: 'C', black: false },
  { note: 'C#', black: true },
  { note: 'D', black: false },
  { note: 'D#', black: true },
  { note: 'E', black: false },
  { note: 'F', black: false },
  { note: 'F#', black: true },
  { note: 'G', black: false },
  { note: 'G#', black: true },
  { note: 'A', black: false },
  { note: 'A#', black: true },
  { note: 'B', black: false },
]

export function buildPianoKeys() {
  const sequence = [
    { note: 'A0', black: false },
    { note: 'A#0', black: true },
    { note: 'B0', black: false },
  ]

  for (let octave = 1; octave <= 7; octave++) {
    for (const { note, black } of OCTAVE_PATTERN) {
      sequence.push({ note: `${note}${octave}`, black })
    }
  }

  sequence.push({ note: 'C8', black: false })

  const pitchIndexByNote = {}
  sequence.forEach((key, index) => {
    pitchIndexByNote[key.note] = index
  })

  const whiteKeys = []
  const blackKeys = []
  let whiteIndex = -1

  for (const key of sequence) {
    const entry = { id: key.note, note: key.note }

    if (!key.black) {
      whiteIndex++
      entry.whiteIndex = whiteIndex
      whiteKeys.push(entry)
    } else {
      entry.anchorWhiteIndex = whiteIndex
      blackKeys.push(entry)
    }
  }

  return { whiteKeys, blackKeys, whiteKeyCount: whiteKeys.length, pitchIndexByNote }
}
