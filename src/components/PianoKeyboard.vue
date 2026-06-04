<template>
  <div class="piano-wrapper">
    <div
      class="pressed-notes"
      :class="{ 'pressed-notes--empty': pressedNotes.length === 0 }"
      aria-live="polite"
      aria-label="Notas pressionadas"
    >
      <div
        v-for="entry in pressedNotes"
        :key="entry.note"
        class="pressed-note"
      >
        <span class="pressed-note__western">{{ entry.western }}</span>
        <span class="pressed-note__separator">·</span>
        <span class="pressed-note__solfege">{{ entry.solfege }}</span>
      </div>
    </div>

    <div
      class="piano-keyboard"
      role="application"
      aria-label="Teclado de piano de 88 teclas"
    >
      <div class="piano-keyboard__white-keys">
        <button
          v-for="key in whiteKeys"
          :key="key.id"
          type="button"
          class="piano-key piano-key--white"
          :class="{
            'piano-key--pressed': isKeyPressed(key.note),
            'piano-key--sustained': isKeySustained(key.note),
          }"
          :aria-label="key.note"
          :aria-pressed="isKeyActive(key.note)"
          @mousedown.prevent="pressKey(key.note, 'pointer')"
        />
    </div>

    <div class="piano-keyboard__black-keys">
      <button
        v-for="key in blackKeys"
        :key="key.id"
        type="button"
        class="piano-key piano-key--black"
        :class="{
          'piano-key--pressed': isKeyPressed(key.note),
          'piano-key--sustained': isKeySustained(key.note),
        }"
        :style="blackKeyStyle(key)"
        :aria-label="key.note"
        :aria-pressed="isKeyActive(key.note)"
        @mousedown.prevent="pressKey(key.note, 'pointer')"
      />
    </div>
    </div>

    <div class="midi-recorder">
      <button
        type="button"
        class="midi-recorder__button"
        :class="{ 'midi-recorder__button--recording': isRecording }"
        :aria-label="isRecording ? 'Parar gravação MIDI' : 'Gravar performance MIDI'"
        @click="toggleRecording"
      >
        <span
          v-if="!isRecording"
          class="midi-recorder__icon midi-recorder__icon--record"
        />
        <span
          v-else
          class="midi-recorder__icon midi-recorder__icon--stop"
        />
      </button>
    </div>

    <div class="sustain-pedal">
      <div
        class="sustain-pedal__control"
        role="status"
        :aria-label="sustainPedalDown ? 'Pedal pressionado' : 'Pedal solto'"
      >
        <span class="sustain-pedal__label">PEDAL</span>
        <div
          class="sustain-pedal__indicator"
          :class="{ 'sustain-pedal__indicator--pressed': sustainPedalDown }"
        />
      </div>

      <svg
        class="pedal-visual"
        viewBox="0 0 80 56"
        aria-hidden="true"
      >
        <line
          class="pedal-visual__ground"
          x1="6"
          y1="53"
          x2="74"
          y2="53"
        />
        <rect
          class="pedal-visual__base"
          x="14"
          y="45"
          width="52"
          height="8"
          rx="2"
        />
        <rect
          class="pedal-visual__post"
          x="16"
          y="31"
          width="8"
          height="14"
          rx="1"
        />
        <g
          class="pedal-visual__lever"
          :class="{ 'pedal-visual__lever--pressed': sustainPedalDown }"
        >
          <rect
            class="pedal-visual__pad"
            x="18"
            y="17"
            width="46"
            height="14"
            rx="4"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import { buildPianoKeys } from '../utils/pianoKeys.js'
import { formatNoteLabels } from '../utils/noteNames.js'
import { bindMidiInputs, isMidiSupported, requestMidiAccess } from '../utils/midiConnection.js'
import { isPianoMidiNote, midiNumberToNote, noteToMidiNumber, SUSTAIN_PEDAL_CC } from '../utils/midiNotes.js'
import {
  playPianoNote,
  releasePianoNote,
  releaseSustainedPianoNotes,
  stopAllPianoNotes,
} from '../utils/pianoAudio.js'
import {
  createMidiBlob,
  createMidiRecorder,
  formatRecordingFilename,
  saveMidiFile,
} from '../utils/midiRecorder.js'

const piano = buildPianoKeys()

export default {
  name: 'PianoKeyboard',
  data() {
    return {
      whiteKeys: piano.whiteKeys,
      blackKeys: piano.blackKeys,
      whiteKeyCount: piano.whiteKeyCount,
      pitchIndexByNote: piano.pitchIndexByNote,
      pointerActive: {},
      pointerHeld: {},
      midiActive: {},
      sustainedActive: {},
      sustainPedalDown: false,
      midiBinder: null,
      isRecording: false,
      midiRecorder: createMidiRecorder(),
    }
  },
  computed: {
    blackKeyWidthPercent() {
      return (100 / this.whiteKeyCount) * 0.58
    },
    activeKeys() {
      return {
        ...this.pointerActive,
        ...this.midiActive,
        ...this.sustainedActive,
      }
    },
    pressedNotes() {
      return Object.keys(this.activeKeys)
        .sort(
          (a, b) => this.pitchIndexByNote[a] - this.pitchIndexByNote[b],
        )
        .map((note) => ({
          note,
          ...formatNoteLabels(note),
        }))
    },
  },
  mounted() {
    this.initMidi()
    window.addEventListener('keydown', this.handleRecordingKeydown)
    window.addEventListener('mouseup', this.onWindowMouseUp)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleRecordingKeydown)
    window.removeEventListener('mouseup', this.onWindowMouseUp)
    stopAllPianoNotes()
    this.teardownMidi()
  },
  methods: {
    handleRecordingKeydown(event) {
      if (event.key !== 'r' && event.key !== 'R') return
      if (event.repeat) return
      if (event.ctrlKey || event.metaKey || event.altKey) return

      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }

      event.preventDefault()
      this.toggleRecording()
    },
    isKeyPressed(note) {
      return Boolean(this.pointerActive[note] || this.midiActive[note])
    },
    isKeySustained(note) {
      return Boolean(
        this.sustainedActive[note] && !this.isKeyPressed(note),
      )
    },
    isKeyActive(note) {
      return this.isKeyPressed(note) || this.isKeySustained(note)
    },
    playKeyAudio(midiNumber, velocity = 96) {
      playPianoNote(midiNumber, velocity).catch((error) => {
        console.warn('Erro ao reproduzir áudio da nota.', error)
      })
    },
    releaseKeyAudio(midiNumber) {
      releasePianoNote(midiNumber, { sustainPedalDown: this.sustainPedalDown }).catch(
        (error) => {
          console.warn('Erro ao soltar áudio da nota.', error)
        },
      )
    },
    pressKey(note, source, velocity = 96) {
      if (this.sustainedActive[note]) {
        const sustained = { ...this.sustainedActive }
        delete sustained[note]
        this.sustainedActive = sustained
      }

      if (source === 'pointer') {
        this.pointerHeld = { ...this.pointerHeld, [note]: true }
        this.pointerActive = { ...this.pointerActive, [note]: true }
      } else {
        this.midiActive = { ...this.midiActive, [note]: true }
      }

      const midiNumber = noteToMidiNumber(note)
      if (midiNumber !== null) {
        this.playKeyAudio(midiNumber, velocity)
      }
    },
    releaseKey(note, source) {
      if (source === 'pointer') {
        if (!this.pointerHeld[note]) return

        const held = { ...this.pointerHeld }
        delete held[note]
        this.pointerHeld = held
      }

      const active = source === 'pointer' ? this.pointerActive : this.midiActive
      if (!active[note]) return

      const next = { ...active }
      delete next[note]

      if (source === 'pointer') {
        this.pointerActive = next
      } else {
        this.midiActive = next
      }

      if (this.sustainPedalDown) {
        this.sustainedActive = { ...this.sustainedActive, [note]: true }
      }

      const midiNumber = noteToMidiNumber(note)
      if (midiNumber !== null) {
        this.releaseKeyAudio(midiNumber)
      }
    },
    onWindowMouseUp(event) {
      if (event.button !== 0) return

      for (const note of Object.keys(this.pointerHeld)) {
        this.releaseKey(note, 'pointer')
      }
    },
    handleSustainPedal(value) {
      const isDown = value >= 64
      this.sustainPedalDown = isDown

      if (!isDown) {
        this.sustainedActive = {}
        releaseSustainedPianoNotes()
      }
    },
    handleMidiControlChange(controller, value) {
      if (controller !== SUSTAIN_PEDAL_CC) return
      this.handleSustainPedal(value)
    },
    handleMidiNoteOn(midiNumber, velocity = 100) {
      if (!isPianoMidiNote(midiNumber)) return
      this.pressKey(midiNumberToNote(midiNumber), 'midi', velocity)
    },
    handleMidiNoteOff(midiNumber) {
      if (!isPianoMidiNote(midiNumber)) return
      this.releaseKey(midiNumberToNote(midiNumber), 'midi')
    },
    handleRawMidiMessage(data) {
      if (!this.isRecording) return

      this.midiRecorder.record(data)
    },
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording()
        return
      }

      this.midiRecorder.start()
      this.isRecording = true
    },
    stopRecording() {
      this.isRecording = false
      const events = this.midiRecorder.stop()

      if (events.length === 0) return

      const blob = createMidiBlob(events)
      const filename = `pianoapp-${formatRecordingFilename()}`

      saveMidiFile(blob, filename).catch((error) => {
        console.warn('Não foi possível salvar o arquivo MIDI.', error)
      })
    },
    async initMidi() {
      if (!isMidiSupported()) return

      try {
        const access = await requestMidiAccess()
        if (!access) return

        this.midiBinder = bindMidiInputs(access, {
          onNoteOn: this.handleMidiNoteOn.bind(this),
          onNoteOff: this.handleMidiNoteOff.bind(this),
          onControlChange: this.handleMidiControlChange.bind(this),
          onMidiMessage: this.handleRawMidiMessage.bind(this),
        })
      } catch (error) {
        console.warn('Não foi possível acessar dispositivos MIDI.', error)
      }
    },
    teardownMidi() {
      if (this.midiBinder) {
        this.midiBinder.detach()
        this.midiBinder = null
      }

      this.midiActive = {}
      this.pointerActive = {}
      this.pointerHeld = {}
      this.sustainedActive = {}
      this.sustainPedalDown = false
      this.isRecording = false
      this.midiRecorder.stop()
    },
    blackKeyStyle(key) {
      const whiteWidth = 100 / this.whiteKeyCount
      const left =
        (key.anchorWhiteIndex + 1) * whiteWidth - this.blackKeyWidthPercent / 2

      return {
        left: `${left}%`,
        width: `${this.blackKeyWidthPercent}%`,
      }
    },
  },
}
</script>

<style scoped>
.piano-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pressed-notes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 0 16px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.pressed-notes--empty {
  visibility: hidden;
}

.pressed-note {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f3f4f6;
  white-space: nowrap;
}

.pressed-note__western {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.pressed-note__separator {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(243, 244, 246, 0.45);
}

.pressed-note__solfege {
  font-size: 1.125rem;
  font-weight: 500;
  color: #93c5fd;
  letter-spacing: 0.01em;
}

.piano-keyboard {
  position: relative;
  width: 100%;
  height: 220px;
  user-select: none;
  touch-action: manipulation;
}

.piano-keyboard__white-keys {
  display: flex;
  width: 100%;
  height: 100%;
}

.piano-key {
  margin: 0;
  padding: 0;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  transition: background-color 0.1s ease;
}

.piano-key:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}

.piano-key--white {
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
  border: 1px solid #c4c4c4;
  border-top: none;
  border-radius: 0 0 3px 3px;
  background: linear-gradient(180deg, #ffffff 0%, #ececec 100%);
}

.piano-key--white.piano-key--pressed {
  background: #1d4ed8 !important;
  border-color: #1e3a8a !important;
}

.piano-key--white.piano-key--sustained {
  background: #dbeafe !important;
  border-color: #bfdbfe !important;
}

.piano-keyboard__black-keys {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 62%;
  pointer-events: none;
}

.piano-key--black {
  position: absolute;
  top: 0;
  height: 100%;
  pointer-events: auto;
  z-index: 1;
  border: 1px solid #000;
  border-radius: 0 0 2px 2px;
  background: linear-gradient(180deg, #3a3a3a 0%, #111111 100%);
}

.piano-key--black.piano-key--pressed {
  background: #1d4ed8 !important;
  border-color: #1e3a8a !important;
}

.piano-key--black.piano-key--sustained {
  background: #60a5fa !important;
  border-color: #93c5fd !important;
}

.midi-recorder {
  display: flex;
  justify-content: center;
  align-items: center;
}

.midi-recorder__button {
  width: 44px;
  height: 44px;
  margin: 0;
  padding: 0;
  border: 2px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.midi-recorder__button:hover {
  border-color: rgba(255, 255, 255, 0.28);
}

.midi-recorder__button:focus-visible {
  outline: 2px solid #ef4444;
  outline-offset: 3px;
}

.midi-recorder__button--recording {
  border-color: rgba(239, 68, 68, 0.65);
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.45);
}

.midi-recorder__icon {
  display: block;
}

.midi-recorder__icon--record {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.55);
}

.midi-recorder__icon--stop {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  background: #f3f4f6;
}

.sustain-pedal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 14px;
}

.sustain-pedal__control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sustain-pedal__label {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: #f3f4f6;
}

.sustain-pedal__indicator {
  width: 52px;
  height: 18px;
  border-radius: 999px;
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.45);
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.sustain-pedal__indicator--pressed {
  background: #22c55e;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.55);
}

.pedal-visual {
  width: 80px;
  height: 56px;
  display: block;
  overflow: visible;
}

.pedal-visual__ground {
  stroke: #374151;
  stroke-width: 1;
}

.pedal-visual__base {
  fill: #4b5563;
}

.pedal-visual__post {
  fill: #6b7280;
}

.pedal-visual__lever {
  transform-box: view-box;
  transform-origin: 25% 79%;
  transform: rotate(-18deg);
  transition: transform 0.14s ease-out;
}

.pedal-visual__lever--pressed {
  transform: rotate(14deg);
}

.pedal-visual__pad {
  fill: #9ca3af;
  stroke: #d1d5db;
  stroke-width: 1;
  transition: fill 0.14s ease-out, stroke 0.14s ease-out;
}

.pedal-visual__lever--pressed .pedal-visual__pad {
  fill: #86efac;
  stroke: #4ade80;
}
</style>
