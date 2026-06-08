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
    label: 'Duas colcheias',
    beats: 1,
    hits: 2,
    image: '/rhythms/2colcheias.png',
  },
  {
    id: 'colcheia-pontuada-semicolcheia',
    label: 'Colcheia pontuada e semicolcheia',
    beats: 1,
    hits: 2,
    hitOffsets: [0, 0.75],
    image: '/rhythms/1colcheia_pontuada_1semicolcheia.png',
  },
  {
    id: 'semicolcheia-colcheia-pontuada',
    label: 'Semicolcheia e colcheia pontuada',
    beats: 1,
    hits: 2,
    hitOffsets: [0, 0.25],
    image: '/rhythms/1semicolcheia_1colcheia_pontuada.png',
  },
  {
    id: 'tercina',
    label: 'Tercina de colcheias',
    beats: 1,
    hits: 3,
    image: '/rhythms/tercina.png',
  },
  {
    id: 'colcheia-2semicolcheias',
    label: 'Colcheia e duas semicolcheias',
    beats: 1,
    hits: 3,
    hitOffsets: [0, 0.5, 0.75],
    image: '/rhythms/1colcheia_2semicolcheias.png',
  },
  {
    id: '2semicolcheias-colcheia',
    label: 'Duas semicolcheias e colcheia',
    beats: 1,
    hits: 3,
    hitOffsets: [0, 0.25, 0.5],
    image: '/rhythms/2semicolcheias_1colcheia.png',
  },
  {
    id: 'semicolcheia-colcheia-semicolcheia',
    label: 'Semicolcheia, colcheia e semicolcheia',
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

export function createEmptyRhythmicTies(measureCount, beatsPerBar) {
  const gapCount = Math.max(0, beatsPerBar - 1)

  return Array.from({ length: measureCount }, () =>
    Array.from({ length: gapCount }, () => false),
  )
}

export function trimRhythmicTies(ties, measureCount, beatsPerBar) {
  const gapCount = Math.max(0, beatsPerBar - 1)
  const trimmed = ties.slice(0, measureCount)

  while (trimmed.length < measureCount) {
    trimmed.push(Array.from({ length: gapCount }, () => false))
  }

  return trimmed.map((measureTies) => {
    const next = measureTies.slice(0, gapCount)

    while (next.length < gapCount) {
      next.push(false)
    }

    return next
  })
}

export function getRhythmicFigureStartAt(score, measureIndex, beatIndex) {
  const placement = score[measureIndex]?.[beatIndex]
  if (!placement) return null

  const figure = getRhythmicFigure(placement.figureId)
  if (!figure || figure.hits === 0) return null

  return { placement, figure, startBeat: beatIndex }
}

export function getRhythmicFigureEndingAt(score, measureIndex, beatIndex) {
  const measure = score[measureIndex]
  if (!measure) return null

  for (let startBeat = beatIndex; startBeat >= 0; startBeat -= 1) {
    const placement = measure[startBeat]
    if (!placement) continue

    const figure = getRhythmicFigure(placement.figureId)
    if (!figure || figure.hits === 0) continue

    const endBeat = startBeat + figure.beats - 1
    if (endBeat === beatIndex) {
      return { placement, figure, startBeat, endBeat }
    }

    if (startBeat + figure.beats <= beatIndex) break
  }

  return null
}

export function canAddRhythmicTie(score, measureIndex, betweenBeatIndex) {
  const fromBeat = betweenBeatIndex
  const toBeat = betweenBeatIndex + 1
  const ending = getRhythmicFigureEndingAt(score, measureIndex, fromBeat)
  const starting = getRhythmicFigureStartAt(score, measureIndex, toBeat)

  if (!ending || !starting) return false

  return ending.startBeat !== starting.startBeat
}

export function isRhythmicBeatTiedFromPrevious(ties, measureIndex, beatIndex) {
  if (beatIndex <= 0) return false

  return Boolean(ties[measureIndex]?.[beatIndex - 1])
}

export function hasRhythmicTie(ties, measureIndex, betweenBeatIndex) {
  return Boolean(ties[measureIndex]?.[betweenBeatIndex])
}

export function toggleRhythmicTie(ties, score, measureIndex, betweenBeatIndex) {
  const next = ties.map((measureTies, measureIdx) =>
    measureIdx === measureIndex ? [...measureTies] : [...measureTies],
  )

  if (next[measureIndex][betweenBeatIndex]) {
    next[measureIndex][betweenBeatIndex] = false
    return next
  }

  if (!canAddRhythmicTie(score, measureIndex, betweenBeatIndex)) {
    return ties
  }

  next[measureIndex][betweenBeatIndex] = true
  return next
}

export function sanitizeRhythmicTies(score, ties, measureCount, beatsPerBar) {
  const next = trimRhythmicTies(ties, measureCount, beatsPerBar)

  for (let measureIndex = 0; measureIndex < measureCount; measureIndex += 1) {
    for (
      let betweenBeatIndex = 0;
      betweenBeatIndex < beatsPerBar - 1;
      betweenBeatIndex += 1
    ) {
      if (
        next[measureIndex][betweenBeatIndex]
        && !canAddRhythmicTie(score, measureIndex, betweenBeatIndex)
      ) {
        next[measureIndex][betweenBeatIndex] = false
      }
    }
  }

  return next
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
