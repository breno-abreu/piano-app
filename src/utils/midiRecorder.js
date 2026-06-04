function encodeVarLength(value) {
  if (value <= 0) return [0]

  const bytes = []
  let current = value

  bytes.unshift(current & 0x7f)
  current >>= 7

  while (current > 0) {
    bytes.unshift((current & 0x7f) | 0x80)
    current >>= 7
  }

  return bytes
}

function pushUint32(bytes, value) {
  bytes.push(
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  )
}

function pushUint16(bytes, value) {
  bytes.push((value >> 8) & 0xff, value & 0xff)
}

function buildTrackBytes(events, ticksPerQuarter, tempo) {
  const bytes = []

  bytes.push(
    ...encodeVarLength(0),
    0xff,
    0x51,
    0x03,
    (tempo >> 16) & 0xff,
    (tempo >> 8) & 0xff,
    tempo & 0xff,
  )

  let lastTimeMs = 0

  for (const event of events) {
    const deltaMs = Math.max(0, event.timeMs - lastTimeMs)
    lastTimeMs = event.timeMs
    const deltaTicks = Math.max(
      0,
      Math.round((deltaMs * ticksPerQuarter * 1000) / tempo),
    )

    bytes.push(...encodeVarLength(deltaTicks), ...event.data)
  }

  bytes.push(...encodeVarLength(0), 0xff, 0x2f, 0x00)

  return bytes
}

export function createMidiRecorder() {
  let events = []
  let startTime = 0
  let recording = false

  return {
    start() {
      events = []
      startTime = performance.now()
      recording = true
    },
    recordMessage(data) {
      if (!recording || !data || data.length < 3) return

      events.push({
        timeMs: performance.now() - startTime,
        data: Array.from(data),
      })
    },
    recordNoteOn(midiNumber, velocity = 96) {
      if (!recording || midiNumber < 0 || midiNumber > 127) return

      this.recordMessage([
        0x90,
        midiNumber,
        Math.max(1, Math.min(127, Math.round(velocity))),
      ])
    },
    recordNoteOff(midiNumber) {
      if (!recording || midiNumber < 0 || midiNumber > 127) return

      this.recordMessage([0x80, midiNumber, 0])
    },
    recordControlChange(controller, value) {
      if (!recording || controller < 0 || controller > 127) return

      this.recordMessage([
        0xb0,
        controller,
        Math.max(0, Math.min(127, Math.round(value))),
      ])
    },
    stop() {
      recording = false
      return events
    },
  }
}

export function bpmToTempo(bpm) {
  const rounded = Math.max(1, Math.round(bpm))
  return Math.round(60000000 / rounded)
}

export function createMidiBlob(events, options = {}) {
  const ticksPerQuarter = options.ticksPerQuarter ?? 480
  const tempo = options.tempo ?? bpmToTempo(120)
  const trackBytes = buildTrackBytes(events, ticksPerQuarter, tempo)
  const fileBytes = []

  fileBytes.push(0x4d, 0x54, 0x68, 0x64)
  pushUint32(fileBytes, 6)
  pushUint16(fileBytes, 0)
  pushUint16(fileBytes, 1)
  pushUint16(fileBytes, ticksPerQuarter)

  fileBytes.push(0x4d, 0x54, 0x72, 0x6b)
  pushUint32(fileBytes, trackBytes.length)
  fileBytes.push(...trackBytes)

  return new Blob([new Uint8Array(fileBytes)], { type: 'audio/midi' })
}

export function formatRecordingFilename(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('') + '.mid'
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function saveMidiFile(blob, suggestedFilename) {
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: suggestedFilename,
        types: [
          {
            description: 'Arquivo MIDI',
            accept: {
              'audio/midi': ['.mid'],
              'audio/x-midi': ['.mid'],
            },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return { saved: true, cancelled: false }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { saved: false, cancelled: true }
      }

      throw error
    }
  }

  downloadBlob(blob, suggestedFilename)
  return { saved: true, cancelled: false, fallback: true }
}
