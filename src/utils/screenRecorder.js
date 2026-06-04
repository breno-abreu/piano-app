import {
  ensurePianoAudio,
  getPianoAudioMediaStream,
  resumePianoAudioContext,
} from './pianoAudio.js'

/** MP4 (H.264 + AAC) — melhor compatibilidade com players do Windows, celulares, etc. */
const MP4_MIME_CANDIDATES = [
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4;codecs=avc1.64003E,mp4a.40.2',
  'video/mp4;codecs=avc1,opus',
  'video/mp4;codecs=avc1',
  'video/mp4',
]

const WEBM_MIME_CANDIDATES = [
  'video/webm;codecs=h264,opus',
  'video/webm;codecs=h264',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
]

const RECORDING_MIME_CANDIDATES = [...MP4_MIME_CANDIDATES, ...WEBM_MIME_CANDIDATES]

export function isScreenRecordingSupported() {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getDisplayMedia) &&
    typeof MediaRecorder !== 'undefined'
  )
}

export function getPreferredRecordingMimeType(includeAudio = true) {
  if (typeof MediaRecorder === 'undefined') return ''

  const candidates = includeAudio
    ? RECORDING_MIME_CANDIDATES
    : RECORDING_MIME_CANDIDATES.filter(
        (type) => !type.includes('opus') && !type.includes('mp4a')
      )

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

/** @deprecated Use getPreferredRecordingMimeType */
export function getPreferredWebmMimeType(includeAudio = true) {
  return getPreferredRecordingMimeType(includeAudio)
}

export function getRecordingFormatFromMime(mimeType = '') {
  const normalized = (mimeType || '').split(';')[0].trim().toLowerCase()

  if (normalized === 'video/mp4') {
    return {
      extension: '.mp4',
      mimeBase: 'video/mp4',
      containerLabel: 'MP4',
      pickerDescription: 'Vídeo MP4',
    }
  }

  return {
    extension: '.webm',
    mimeBase: 'video/webm',
    containerLabel: 'WebM',
    pickerDescription: 'Vídeo WebM',
  }
}

export function getPreferredRecordingContainerLabel(includeAudio = true) {
  const mimeType = getPreferredRecordingMimeType(includeAudio)

  return mimeType
    ? getRecordingFormatFromMime(mimeType).containerLabel
    : 'vídeo'
}

function buildRecordingFilenameBase(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')

  return [
    'pianoapp-tela-',
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('')
}

export function formatScreenRecordingFilename(date = new Date(), mimeType = '') {
  const { extension } = getRecordingFormatFromMime(
    mimeType || getPreferredRecordingMimeType(true)
  )

  return buildRecordingFilenameBase(date) + extension
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function saveScreenRecording(blob, suggestedFilename) {
  const format = getRecordingFormatFromMime(blob?.type)

  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: suggestedFilename,
        types: [
          {
            description: format.pickerDescription,
            accept: {
              [format.mimeBase]: [format.extension],
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

async function acquireDisplayStream() {
  const attempts = [
    {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      preferCurrentTab: false,
      systemAudio: 'include',
    },
    {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: true,
      preferCurrentTab: false,
    },
    {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: false,
    },
  ]

  let lastError = null

  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getDisplayMedia(constraints)
    } catch (error) {
      lastError = error

      if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
        throw error
      }
    }
  }

  throw lastError ?? new Error('Não foi possível capturar a tela.')
}

function buildRecordingStream(displayStream, pianoStream) {
  const videoTracks = displayStream.getVideoTracks()
  const displayAudioTracks = displayStream.getAudioTracks()
  const pianoAudioTracks = pianoStream?.getAudioTracks() ?? []
  const needsMix = displayAudioTracks.length > 0 || pianoAudioTracks.length > 0

  if (!needsMix) {
    return {
      stream: new MediaStream(videoTracks),
      mixContext: null,
      hasAudio: false,
    }
  }

  const mixContext = new AudioContext()
  const mixDestination = mixContext.createMediaStreamDestination()

  if (displayAudioTracks.length > 0) {
    mixContext
      .createMediaStreamSource(new MediaStream(displayAudioTracks))
      .connect(mixDestination)
  }

  if (pianoAudioTracks.length > 0) {
    mixContext
      .createMediaStreamSource(new MediaStream(pianoAudioTracks))
      .connect(mixDestination)
  }

  return {
    stream: new MediaStream([
      ...videoTracks,
      ...mixDestination.stream.getAudioTracks(),
    ]),
    mixContext,
    hasAudio: true,
  }
}

export function createScreenRecorder() {
  let displayStream = null
  let recordingStream = null
  let mixContext = null
  let recorder = null
  let chunks = []
  let recording = false
  let hasAudio = false
  let startTime = 0
  let elapsedTimer = null
  let onElapsed = null
  let onShareEnded = null

  function clearElapsedTimer() {
    if (elapsedTimer !== null) {
      window.clearInterval(elapsedTimer)
      elapsedTimer = null
    }
  }

  function releaseStream() {
    if (displayStream) {
      for (const track of displayStream.getTracks()) {
        track.stop()
      }

      displayStream = null
    }

    recordingStream = null

    if (mixContext) {
      mixContext.close().catch(() => {})
      mixContext = null
    }
  }

  function notifyElapsed() {
    if (!recording || !onElapsed) return

    onElapsed(Math.max(0, performance.now() - startTime))
  }

  function handleShareEnded() {
    if (!recording) return

    onShareEnded?.()
  }

  function attachTrackEndedHandlers() {
    if (!displayStream) return

    for (const track of displayStream.getTracks()) {
      track.onended = handleShareEnded
    }
  }

  return {
    setOnElapsed(callback) {
      onElapsed = typeof callback === 'function' ? callback : null
    },

    setOnShareEnded(callback) {
      onShareEnded = typeof callback === 'function' ? callback : null
    },

    isRecording() {
      return recording
    },

    hasAudioTrack() {
      return hasAudio
    },

    getRecordingMimeType() {
      return (
        recorder?.mimeType ||
        (recording ? getPreferredRecordingMimeType(hasAudio) : '') ||
        ''
      )
    },

    getElapsedMs() {
      if (!recording) return 0

      return Math.max(0, performance.now() - startTime)
    },

    async start() {
      if (!isScreenRecordingSupported()) {
        throw new Error('Gravação de tela não suportada neste navegador.')
      }

      if (recording) return

      await ensurePianoAudio()
      await resumePianoAudioContext()

      displayStream = await acquireDisplayStream()
      attachTrackEndedHandlers()

      const pianoStream = getPianoAudioMediaStream()
      const built = buildRecordingStream(displayStream, pianoStream)
      recordingStream = built.stream
      mixContext = built.mixContext
      hasAudio = built.hasAudio

      const mimeType = getPreferredRecordingMimeType(hasAudio)
      chunks = []

      const options = {
        videoBitsPerSecond: 2_500_000,
      }

      if (hasAudio) {
        options.audioBitsPerSecond = 128_000
      }

      if (mimeType) {
        options.mimeType = mimeType
      }

      recorder = new MediaRecorder(recordingStream, options)

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.start(1000)
      recording = true
      startTime = performance.now()
      notifyElapsed()
      clearElapsedTimer()
      elapsedTimer = window.setInterval(notifyElapsed, 250)
    },

    async stop() {
      if (!recording || !recorder) {
        releaseStream()
        recording = false
        clearElapsedTimer()
        return null
      }

      return new Promise((resolve, reject) => {
        const finalize = () => {
          const mimeType =
            recorder?.mimeType ||
            getPreferredRecordingMimeType(hasAudio) ||
            'video/webm'
          const blob = chunks.length
            ? new Blob(chunks, { type: mimeType })
            : null

          chunks = []
          recorder = null
          recording = false
          hasAudio = false
          clearElapsedTimer()
          releaseStream()
          resolve(blob)
        }

        recorder.onstop = finalize

        recorder.onerror = () => {
          reject(new Error('Falha ao finalizar a gravação de tela.'))
        }

        try {
          if (recorder.state === 'recording') {
            recorder.requestData()
          }

          recorder.stop()
        } catch (error) {
          reject(error)
        }
      })
    },

    cancel() {
      recording = false
      hasAudio = false
      clearElapsedTimer()
      chunks = []

      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null

        try {
          recorder.stop()
        } catch {
          // ignore
        }
      }

      recorder = null
      releaseStream()
    },

    dispose() {
      this.cancel()
      onElapsed = null
      onShareEnded = null
    },
  }
}
