export const RHYTHMIC_MAX_MEASURES = 4
export const RHYTHMIC_TIME_SIGNATURES = ['4/4']
export const RHYTHMIC_MIN_BPM = 40
export const RHYTHMIC_MAX_BPM = 240
export const RHYTHMIC_DEFAULT_BPM = 120

const BEATS_PER_BAR = {
  '4/4': 4,
}

export const RHYTHMIC_FIGURES = [
  {
    id: 'seminima',
    label: 'Semínima',
    beats: 1,
    hits: 1,
    image: '/rhythms/seminima.png',
  },
  {
    id: 'colcheia-colcheia',
    label: 'Colcheia + colcheia',
    beats: 1,
    hits: 2,
    image: '/rhythms/2colcheias.png',
  },
  {
    id: 'tercina',
    label: 'Tercina',
    beats: 1,
    hits: 3,
    image: '/rhythms/tercina.png',
  },
]

const figureById = Object.fromEntries(
  RHYTHMIC_FIGURES.map((figure) => [figure.id, figure]),
)

export function getRhythmicBeatsPerBar(timeSignature) {
  return BEATS_PER_BAR[timeSignature] ?? 4
}

export function getRhythmicFigure(id) {
  return figureById[id] ?? null
}

export function createEmptyRhythmicScore(measureCount, beatsPerBar) {
  return Array.from({ length: measureCount }, () =>
    Array.from({ length: beatsPerBar }, () => null),
  )
}

export function trimRhythmicScore(score, measureCount, beatsPerBar) {
  const trimmed = score.slice(0, measureCount)

  while (trimmed.length < measureCount) {
    trimmed.push(Array.from({ length: beatsPerBar }, () => null))
  }

  return trimmed.map((measure) => {
    const nextMeasure = measure.slice(0, beatsPerBar)
    while (nextMeasure.length < beatsPerBar) {
      nextMeasure.push(null)
    }
    return nextMeasure
  })
}

export function getRhythmicPlacementAt(score, measureIndex, beatIndex) {
  const measure = score[measureIndex]
  if (!measure) return null

  const direct = measure[beatIndex]
  if (direct) return direct

  for (let beat = beatIndex - 1; beat >= 0; beat -= 1) {
    const placement = measure[beat]
    if (!placement) continue

    const figure = getRhythmicFigure(placement.figureId)
    if (!figure) continue

    if (beat + figure.beats > beatIndex) {
      return { ...placement, isContinuation: true }
    }
  }

  return null
}

export function canPlaceRhythmicFigure(score, measureIndex, beatIndex, figureId) {
  const figure = getRhythmicFigure(figureId)
  if (!figure) return false

  const measure = score[measureIndex]
  if (!measure) return false

  if (beatIndex + figure.beats > measure.length) return false

  for (let beat = beatIndex; beat < beatIndex + figure.beats; beat += 1) {
    if (getRhythmicPlacementAt(score, measureIndex, beat)) {
      return false
    }
  }

  return true
}

export function placeRhythmicFigure(score, measureIndex, beatIndex, figureId) {
  if (!canPlaceRhythmicFigure(score, measureIndex, beatIndex, figureId)) {
    return score
  }

  const nextScore = score.map((measure, measureIdx) => {
    if (measureIdx !== measureIndex) return [...measure]

    return measure.map((slot, beatIdx) => {
      if (beatIdx === beatIndex) {
        return { figureId, measureIndex, beatIndex }
      }
      return slot
    })
  })

  return nextScore
}

export function removeRhythmicFigure(score, measureIndex, beatIndex) {
  const placement = getRhythmicPlacementAt(score, measureIndex, beatIndex)
  if (!placement || placement.isContinuation) return score

  const figure = getRhythmicFigure(placement.figureId)
  if (!figure) return score

  const startBeat = placement.beatIndex

  return score.map((measure, measureIdx) => {
    if (measureIdx !== measureIndex) return [...measure]

    return measure.map((slot, beatIdx) => {
      if (beatIdx >= startBeat && beatIdx < startBeat + figure.beats) {
        return null
      }
      return slot
    })
  })
}

export function clampRhythmicBpm(value) {
  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed)) return RHYTHMIC_DEFAULT_BPM
  return Math.min(RHYTHMIC_MAX_BPM, Math.max(RHYTHMIC_MIN_BPM, parsed))
}
