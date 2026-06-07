import { isPianoMidiNote, SUSTAIN_PEDAL_CC } from './midiNotes.js'

function readUint32(data, offset) {
  return (
    ((data[offset] << 24) |
      (data[offset + 1] << 16) |
      (data[offset + 2] << 8) |
      data[offset + 3]) >>>
    0
  )
}

function readUint16(data, offset) {
  return (data[offset] << 8) | data[offset + 1]
}

function readVarLength(data, startOffset) {
  let offset = startOffset
  let value = 0

  while (offset < data.length) {
    const byte = data[offset++]
    value = (value << 7) | (byte & 0x7f)

    if ((byte & 0x80) === 0) break
  }

  return { value, offset }
}

function readChunkType(data, offset) {
  return String.fromCharCode(
    data[offset],
    data[offset + 1],
    data[offset + 2],
    data[offset + 3],
  )
}

function parseTrackEvents(data, start, end) {
  const rawEvents = []
  let offset = start
  let runningStatus = null
  let tick = 0

  while (offset < end) {
    const delta = readVarLength(data, offset)
    offset = delta.offset
    tick += delta.value

    if (offset >= end) break

    let status = data[offset]

    if (status === 0xff) {
      offset++
      if (offset >= end) break

      const metaType = data[offset++]
      if (offset >= end) break

      const length = readVarLength(data, offset)
      offset = length.offset
      const metaEnd = offset + length.value

      if (metaType === 0x51 && length.value === 3) {
        const tempo =
          (data[offset] << 16) | (data[offset + 1] << 8) | data[offset + 2]
        rawEvents.push({ kind: 'tempo', tick, tempo })
      }

      offset = metaEnd
      continue
    }

    if (status >= 0xf8) {
      offset++
      continue
    }

    if (status === 0xf0 || status === 0xf7) {
      break
    }

    if (status >= 0x80) {
      runningStatus = status
      offset++
    } else if (runningStatus) {
      status = runningStatus
    } else {
      offset++
      continue
    }

    const command = status & 0xf0

    if (command === 0xc0 || command === 0xd0) {
      if (offset >= end) break
      offset++
      continue
    }

    if (command === 0xe0) {
      if (offset + 1 >= end) break
      offset += 2
      continue
    }

    if (offset + 1 >= end) break

    const data1 = data[offset]
    const data2 = data[offset + 1]
    offset += 2

    if (command === 0x90) {
      if (data2 > 0) {
        rawEvents.push({ kind: 'noteOn', tick, midiNumber: data1, velocity: data2 })
      } else {
        rawEvents.push({ kind: 'noteOff', tick, midiNumber: data1 })
      }
      continue
    }

    if (command === 0x80) {
      rawEvents.push({ kind: 'noteOff', tick, midiNumber: data1 })
      continue
    }

    if (command === 0xb0 && data1 === SUSTAIN_PEDAL_CC) {
      rawEvents.push({ kind: 'sustain', tick, value: data2 })
    }
  }

  return rawEvents
}

function ticksToMs(tickEvents, division) {
  const tempoChanges = tickEvents
    .filter((event) => event.kind === 'tempo')
    .sort((a, b) => a.tick - b.tick)

  if (tempoChanges.length === 0) {
    tempoChanges.push({ tick: 0, tempo: 500000 })
  } else if (tempoChanges[0].tick > 0) {
    tempoChanges.unshift({ tick: 0, tempo: 500000 })
  }

  const msPerTick = (tempo) => tempo / division / 1000

  function tickToMs(targetTick) {
    let ms = 0
    let previousTick = 0

    for (let index = 0; index < tempoChanges.length; index++) {
      const change = tempoChanges[index]
      const nextTick = tempoChanges[index + 1]?.tick ?? targetTick
      const segmentEnd = Math.min(targetTick, nextTick)

      if (segmentEnd <= change.tick) continue

      const start = Math.max(previousTick, change.tick)
      ms += (segmentEnd - start) * msPerTick(change.tempo)
      previousTick = segmentEnd

      if (segmentEnd >= targetTick) break
    }

    return ms
  }

  return tickToMs
}

export function tempoToBpm(tempo) {
  if (!tempo || tempo <= 0) return 120
  return Math.round(60000000 / tempo)
}

export function parseMidiFile(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer)

  if (data.length < 14 || readChunkType(data, 0) !== 'MThd') {
    throw new Error('Arquivo MIDI inválido.')
  }

  const headerLength = readUint32(data, 4)
  const format = readUint16(data, 8)
  const trackCount = readUint16(data, 10)
  const division = readUint16(data, 12)

  if ((division & 0x8000) !== 0) {
    throw new Error('Formato MIDI SMPTE não suportado.')
  }

  if (division === 0) {
    throw new Error('Divisão MIDI inválida.')
  }

  let offset = 8 + headerLength
  const tickEvents = []

  for (let trackIndex = 0; trackIndex < trackCount; trackIndex++) {
    if (offset + 8 > data.length) break

    const type = readChunkType(data, offset)
    if (type !== 'MTrk') break

    const length = readUint32(data, offset + 4)
    const start = offset + 8
    const end = start + length

    tickEvents.push(...parseTrackEvents(data, start, end))
    offset = end
  }

  const toMs = ticksToMs(tickEvents, division)
  const playbackEvents = []

  for (const event of tickEvents) {
    if (event.kind === 'tempo') continue

    const timeMs = toMs(event.tick)

    if (event.kind === 'noteOn' && isPianoMidiNote(event.midiNumber)) {
      playbackEvents.push({
        kind: 'noteOn',
        timeMs,
        midiNumber: event.midiNumber,
        velocity: event.velocity,
      })
    } else if (event.kind === 'noteOff' && isPianoMidiNote(event.midiNumber)) {
      playbackEvents.push({
        kind: 'noteOff',
        timeMs,
        midiNumber: event.midiNumber,
      })
    } else if (event.kind === 'sustain') {
      playbackEvents.push({
        kind: 'sustain',
        timeMs,
        value: event.value,
      })
    }
  }

  playbackEvents.sort((a, b) => a.timeMs - b.timeMs)

  const durationMs = playbackEvents.length
    ? playbackEvents[playbackEvents.length - 1].timeMs
    : 0

  const tempoChanges = tickEvents
    .filter((event) => event.kind === 'tempo')
    .sort((a, b) => a.tick - b.tick)
  const initialTempo = tempoChanges[0]?.tempo ?? 500000

  return {
    format,
    division,
    events: playbackEvents,
    durationMs,
    initialBpm: tempoToBpm(initialTempo),
  }
}
