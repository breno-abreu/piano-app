export const RHYTHMIC_MAX_MEASURES = 4
export const RHYTHMIC_TIME_SIGNATURES = ['3/4', '4/4']
export const RHYTHMIC_MIN_BPM = 40
export const RHYTHMIC_MAX_BPM = 240
export const RHYTHMIC_DEFAULT_BPM = 120

const BEATS_PER_BAR = {
  '3/4': 3,
  '4/4': 4,
}

export const RHYTHMIC_FIGURES = [
  {
    id: 'pausa-sembreve',
    label: 'Pausa de semibreve',
    beats: 4,
    hits: 0,
    image: '/rhythms/pausa_semibreve.png',
  },
  {
    id: 'pausa-minima',
    label: 'Pausa de mínima',
    beats: 2,
    hits: 0,
    image: '/rhythms/pausa_minima.png',
  },
  {
    id: 'pausa-seminima',
    label: 'Pausa de semínima',
    beats: 1,
    hits: 0,
    image: '/rhythms/pausa_seminima.png',
  },
  {
    id: 'sembreve',
    label: 'Semibreve',
    beats: 4,
    hits: 1,
    image: '/rhythms/semibreve.png',
  },
  {
    id: 'minima-pontuada',
    label: 'Mínima pontuada',
    beats: 3,
    hits: 1,
    image: '/rhythms/minima_pontuada.png',
  },
  {
    id: 'minima',
    label: 'Mínima',
    beats: 2,
    hits: 1,
    image: '/rhythms/minima.png',
  },
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
    id: 'colcheia-pontuada-semicolcheia',
    label: 'Colcheia pontuada + semicolcheia',
    beats: 1,
    hits: 2,
    hitOffsets: [0, 0.75],
    image: '/rhythms/1colcheia_pontuada_1semicolcheia.png',
  },
  {
    id: 'semicolcheia-colcheia-pontuada',
    label: 'Semicolcheia + colcheia pontuada',
    beats: 1,
    hits: 2,
    hitOffsets: [0, 0.25],
    image: '/rhythms/1semicolcheia_1colcheia_pontuada.png',
  },
  {
    id: 'tercina',
    label: 'Tercina',
    beats: 1,
    hits: 3,
    image: '/rhythms/tercina.png',
  },
  {
    id: 'colcheia-2semicolcheias',
    label: 'Colcheia + duas semicolcheias',
    beats: 1,
    hits: 3,
    hitOffsets: [0, 0.5, 0.75],
    image: '/rhythms/1colcheia_2semicolcheias.png',
  },
  {
    id: '2semicolcheias-colcheia',
    label: 'Duas semicolcheias + colcheia',
    beats: 1,
    hits: 3,
    hitOffsets: [0, 0.25, 0.5],
    image: '/rhythms/2semicolcheias_1colcheia.png',
  },
  {
    id: 'semicolcheia-colcheia-semicolcheia',
    label: 'Semicolcheia + colcheia + semicolcheia',
    beats: 1,
    hits: 3,
    hitOffsets: [0, 0.25, 0.75],
    image: '/rhythms/1semicolcheia_1colcheia_1semicolcheia.png',
  },
  {
    id: '4semicolcheias',
    label: 'Quatro semicolcheias',
    beats: 1,
    hits: 4,
    image: '/rhythms/4semicolcheias.png',
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

export function getRhythmicHitOffsets(figure) {
  if (!figure || figure.hits <= 0) return []

  if (figure.hitOffsets?.length) {
    return figure.hitOffsets
  }

  return Array.from({ length: figure.hits }, (_, index) => index / figure.hits)
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

const RHYTHMIC_REST_FIGURES = RHYTHMIC_FIGURES
  .filter((figure) => figure.hits === 0)
  .sort((a, b) => b.beats - a.beats)

export function fillEmptyRhythmicSlotsWithRests(score, measureCount, beatsPerBar) {
  let nextScore = score.map((measure) => [...measure])

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
    let beatIndex = 0

    while (beatIndex < beatsPerBar) {
      const placement = getRhythmicPlacementAt(nextScore, measureIndex, beatIndex)

      if (placement) {
        const figure = getRhythmicFigure(placement.figureId)
        beatIndex = placement.beatIndex + (figure?.beats ?? 1)
        continue
      }

      let emptyCount = 0
      while (
        beatIndex + emptyCount < beatsPerBar
        && !getRhythmicPlacementAt(nextScore, measureIndex, beatIndex + emptyCount)
      ) {
        emptyCount += 1
      }

      let offset = 0
      while (offset < emptyCount) {
        const remaining = emptyCount - offset
        const restFigure = RHYTHMIC_REST_FIGURES.find(
          (figure) => figure.beats <= remaining,
        )

        if (!restFigure) break

        nextScore = placeRhythmicFigure(
          nextScore,
          measureIndex,
          beatIndex + offset,
          restFigure.id,
        )
        offset += restFigure.beats
      }

      beatIndex += emptyCount
    }
  }

  return nextScore
}
