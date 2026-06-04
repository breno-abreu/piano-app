<template>
  <div class="piano-wrapper">
    <section class="recorder-section" aria-label="Controles da performance">
      <div
        class="recorder-section__tabs"
        role="tablist"
        aria-label="Seções de controles"
      >
        <button
          id="controls-tab-playback"
          type="button"
          role="tab"
          class="recorder-section__tab"
          :class="{ 'recorder-section__tab--active': controlsTab === 'playback' }"
          :aria-selected="controlsTab === 'playback'"
          aria-controls="controls-panel-playback"
          @click="controlsTab = 'playback'"
        >
          Gravação e reprodução
        </button>
        <button
          id="controls-tab-options"
          type="button"
          role="tab"
          class="recorder-section__tab"
          :class="{ 'recorder-section__tab--active': controlsTab === 'options' }"
          :aria-selected="controlsTab === 'options'"
          aria-controls="controls-panel-options"
          @click="controlsTab = 'options'"
        >
          Opções
        </button>
        <button
          id="controls-tab-metronome"
          type="button"
          role="tab"
          class="recorder-section__tab"
          :class="{ 'recorder-section__tab--active': controlsTab === 'metronome' }"
          :aria-selected="controlsTab === 'metronome'"
          aria-controls="controls-panel-metronome"
          @click="controlsTab = 'metronome'"
        >
          Metrônomo
        </button>
        <button
          id="controls-tab-screen"
          type="button"
          role="tab"
          class="recorder-section__tab"
          :class="{ 'recorder-section__tab--active': controlsTab === 'screen' }"
          :aria-selected="controlsTab === 'screen'"
          aria-controls="controls-panel-screen"
          @click="controlsTab = 'screen'"
        >
          Vídeo da tela
        </button>
      </div>

      <div
        v-show="controlsTab === 'playback'"
        id="controls-panel-playback"
        role="tabpanel"
        class="recorder-section__panel"
        aria-labelledby="controls-tab-playback"
      >
        <div class="recorder-section__inner">
          <span class="recorder-section__label">Gravação</span>
          <button
            type="button"
            class="recorder-section__button"
            :class="{ 'recorder-section__button--recording': isRecording }"
            :aria-label="isRecording ? 'Parar gravação MIDI' : 'Gravar performance MIDI'"
            @click="toggleRecording"
          >
            <span
              v-if="!isRecording"
              class="recorder-section__icon recorder-section__icon--record"
            />
            <span
              v-else
              class="recorder-section__icon recorder-section__icon--stop"
            />
          </button>
          <span
            class="recorder-section__hint"
            :class="{ 'recorder-section__hint--active': isRecording }"
          >
            {{ isRecording ? 'Gravando…' : 'Tecla R' }}
          </span>

          <span class="recorder-section__divider" aria-hidden="true" />

          <span class="recorder-section__label">Reprodução</span>
          <input
            ref="midiFileInput"
            type="file"
            accept=".mid,audio/midi,audio/x-midi"
            class="recorder-section__file-input"
            @change="onMidiFileSelected"
          />
          <button
            type="button"
            class="recorder-section__pill recorder-section__pill--file"
            @click="openMidiFilePicker"
          >
            Arquivo
          </button>
          <span
            v-if="midiFileName"
            class="recorder-section__file-name"
            :title="midiFileName"
          >
            {{ midiFileName }}
          </span>
          <button
            v-if="midiPlaybackReady"
            type="button"
            class="recorder-section__pill recorder-section__pill--remove-file"
            aria-label="Remover arquivo MIDI carregado"
            @click="removeMidiFile"
          >
            Remover
          </button>
          <button
            type="button"
            class="recorder-section__button recorder-section__button--play"
            :class="{ 'recorder-section__button--pause-mode': playbackStatus === 'playing' }"
            :disabled="!midiPlaybackReady"
            :aria-label="playbackStatus === 'playing' ? 'Pausar reprodução MIDI' : 'Reproduzir arquivo MIDI'"
            @click="togglePlaybackPlayPause"
          >
            <span
              v-if="playbackStatus !== 'playing'"
              class="recorder-section__icon recorder-section__icon--play"
            />
            <span
              v-else
              class="recorder-section__icon recorder-section__icon--pause"
            />
          </button>
          <button
            type="button"
            class="recorder-section__button recorder-section__button--stop-playback"
            :disabled="!midiPlaybackCanStop"
            aria-label="Parar reprodução MIDI"
            @click="stopPlayback"
          >
            <span class="recorder-section__icon recorder-section__icon--stop" />
          </button>
          <template v-if="midiPlaybackReady">
            <span class="recorder-section__label">Velocidade</span>
            <div class="recorder-section__bpm">
              <button
                type="button"
                class="recorder-section__bpm-step"
                aria-label="Diminuir velocidade da reprodução"
                @click="changePlaybackBpm(-1)"
              >
                <span class="recorder-section__bpm-step-glyph" aria-hidden="true">−</span>
              </button>
              <button
                v-if="!playbackBpmEditing"
                type="button"
                class="recorder-section__bpm-value"
                :aria-label="playbackBpmAriaLabel"
                @click="startPlaybackBpmEdit"
              >
                {{ playbackBpm }} BPM
              </button>
              <span v-else class="recorder-section__bpm-edit">
                <input
                  ref="playbackBpmInput"
                  v-model="playbackBpmDraft"
                  type="text"
                  inputmode="numeric"
                  class="recorder-section__bpm-input"
                  aria-label="Velocidade da reprodução em BPM"
                  @keydown.enter.prevent="commitPlaybackBpm"
                  @keydown.esc.prevent="cancelPlaybackBpmEdit"
                  @blur="commitPlaybackBpm"
                />
                <span class="recorder-section__bpm-suffix">BPM</span>
              </span>
              <button
                type="button"
                class="recorder-section__bpm-step"
                aria-label="Aumentar velocidade da reprodução"
                @click="changePlaybackBpm(1)"
              >
                <span class="recorder-section__bpm-step-glyph" aria-hidden="true">+</span>
              </button>
              <button
                type="button"
                class="recorder-section__pill recorder-section__pill--bpm-reset"
                :disabled="isPlaybackAtOriginalBpm"
                :aria-label="`Restaurar velocidade original (${midiRecordedBpm} BPM)`"
                :title="`Voltar para ${midiRecordedBpm} BPM`"
                @click="resetPlaybackBpm"
              >
                Original
              </button>
            </div>
          </template>
        </div>
      </div>

      <div
        v-show="controlsTab === 'options'"
        id="controls-panel-options"
        role="tabpanel"
        class="recorder-section__panel"
        aria-labelledby="controls-tab-options"
      >
        <div class="recorder-section__inner">
          <span class="recorder-section__label">Notas</span>
          <button
            type="button"
            class="recorder-section__pill"
            :class="{ 'recorder-section__pill--active': showKeyLabels }"
            :aria-pressed="showKeyLabels"
            :aria-label="showKeyLabels ? 'Ocultar nomes nas teclas' : 'Mostrar nomes nas teclas'"
            @click="toggleShowKeyLabels"
          >
            {{ showKeyLabels ? 'Visível' : 'Oculto' }}
          </button>
          <button
            type="button"
            class="recorder-section__pill recorder-section__pill--notation"
            :aria-label="keyLabelNotation === 'western' ? 'Notação ocidental. Alternar para solfejo.' : 'Solfejo. Alternar para notação ocidental.'"
            @click="toggleKeyLabelNotation"
          >
            {{ keyLabelNotation === 'western' ? 'C4' : 'Dó4' }}
          </button>

          <span class="recorder-section__divider" aria-hidden="true" />

          <span class="recorder-section__label">Altura das teclas</span>
          <div class="recorder-section__bpm">
            <button
              type="button"
              class="recorder-section__bpm-step"
              aria-label="Diminuir altura do teclado"
              :disabled="!canDecreaseKeyboardHeight"
              @click="changeKeyboardHeight(-keyboardHeightStep)"
            >
              <span class="recorder-section__bpm-step-glyph" aria-hidden="true">−</span>
            </button>
            <span
              class="recorder-section__bpm-value recorder-section__bpm-value--readonly"
              aria-live="polite"
            >
              {{ keyboardHeight }} px
            </span>
            <button
              type="button"
              class="recorder-section__bpm-step"
              aria-label="Aumentar altura do teclado"
              :disabled="!canIncreaseKeyboardHeight"
              @click="changeKeyboardHeight(keyboardHeightStep)"
            >
              <span class="recorder-section__bpm-step-glyph" aria-hidden="true">+</span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-show="controlsTab === 'screen'"
        id="controls-panel-screen"
        role="tabpanel"
        class="recorder-section__panel"
        aria-labelledby="controls-tab-screen"
      >
        <div class="recorder-section__inner">
          <span class="recorder-section__label">Gravação de tela</span>
          <button
            type="button"
            class="recorder-section__button"
            :class="{ 'recorder-section__button--recording': isScreenRecording }"
            :disabled="!screenRecordingSupported"
            :aria-label="isScreenRecording ? 'Parar gravação de tela' : screenRecordAriaLabel"
            @click="toggleScreenRecording"
          >
            <span
              v-if="!isScreenRecording"
              class="recorder-section__icon recorder-section__icon--record"
            />
            <span
              v-else
              class="recorder-section__icon recorder-section__icon--stop"
            />
          </button>
          <span
            class="recorder-section__hint"
            :class="{ 'recorder-section__hint--active': isScreenRecording }"
          >
            <template v-if="isScreenRecording">
              {{ screenRecordingHint }}
            </template>
            <template v-else-if="screenRecordingSupported">
              {{ screenRecordingIdleHint }}
            </template>
            <template v-else>
              Não suportado neste navegador
            </template>
          </span>
        </div>
      </div>

      <div
        v-show="controlsTab === 'metronome'"
        id="controls-panel-metronome"
        role="tabpanel"
        class="recorder-section__panel recorder-section__panel--metronome"
        aria-labelledby="controls-tab-metronome"
      >
        <div class="recorder-section__metronome">
          <div class="recorder-section__inner recorder-section__metronome-controls">
            <button
              type="button"
              class="recorder-section__button recorder-section__button--metronome"
              :class="{ 'recorder-section__button--metronome-active': metronomeRunning }"
              :aria-label="metronomeRunning ? 'Parar metrônomo' : 'Iniciar metrônomo'"
              @click="toggleMetronome"
            >
              <span
                v-if="!metronomeRunning"
                class="recorder-section__icon recorder-section__icon--metronome-play"
              />
              <span
                v-else
                class="recorder-section__icon recorder-section__icon--metronome-stop"
              />
            </button>
            <div class="recorder-section__bpm">
              <button
                type="button"
                class="recorder-section__bpm-step"
                aria-label="Diminuir andamento"
                @click="changeMetronomeBpm(-1)"
              >
                <span class="recorder-section__bpm-step-glyph" aria-hidden="true">−</span>
              </button>
              <button
                v-if="!metronomeBpmEditing"
                type="button"
                class="recorder-section__bpm-value"
                aria-label="Editar andamento em BPM"
                @click="startMetronomeBpmEdit"
              >
                {{ metronomeBpm }} BPM
              </button>
              <span v-else class="recorder-section__bpm-edit">
                <input
                  ref="metronomeBpmInput"
                  v-model="metronomeBpmDraft"
                  type="text"
                  inputmode="numeric"
                  class="recorder-section__bpm-input"
                  aria-label="Andamento em BPM"
                  @keydown.enter.prevent="commitMetronomeBpm"
                  @keydown.esc.prevent="cancelMetronomeBpmEdit"
                  @blur="commitMetronomeBpm"
                />
                <span class="recorder-section__bpm-suffix">BPM</span>
              </span>
              <button
                type="button"
                class="recorder-section__bpm-step"
                aria-label="Aumentar andamento"
                @click="changeMetronomeBpm(1)"
              >
                <span class="recorder-section__bpm-step-glyph" aria-hidden="true">+</span>
              </button>
            </div>
            <button
              v-for="signature in metronomeTimeSignatures"
              :key="signature"
              type="button"
              class="recorder-section__pill recorder-section__pill--time"
              :class="{ 'recorder-section__pill--active': metronomeTimeSignature === signature }"
              :aria-pressed="metronomeTimeSignature === signature"
              @click="setMetronomeTimeSignature(signature)"
            >
              {{ signature }}
            </button>
          </div>
          <div
            v-if="metronomeRunning"
            class="recorder-section__beat-dots"
            aria-hidden="true"
          >
            <span
              v-for="beatIndex in metronomeBeatCount"
              :key="beatIndex"
              class="recorder-section__beat-dot"
              :class="metronomeBeatDotClass(beatIndex - 1)"
            />
          </div>
        </div>
      </div>

      <div
        v-if="midiPlaybackReady"
        class="recorder-section__progress"
      >
        <button
          type="button"
          class="recorder-section__progress-track"
          :aria-label="playbackProgressAriaLabel"
          :aria-valuenow="Math.round(playbackPositionMs)"
          aria-valuemin="0"
          :aria-valuemax="Math.round(midiDurationMs)"
          @click="seekPlaybackFromEvent"
        >
          <span
            class="recorder-section__progress-fill"
            :style="{ width: `${playbackProgressPercent}%` }"
          />
        </button>
      </div>
    </section>

    <div
      class="piano-stage"
      :class="{ 'piano-stage--with-roll': midiPlaybackReady }"
    >
    <div
      class="piano-playfield"
      :class="{ 'piano-playfield--with-roll': midiPlaybackReady }"
    >
      <PianoRoll
        v-if="midiPlaybackReady"
        :notes="pianoRollNotes"
        :position-ms="playbackPositionMs"
        :white-keys="whiteKeys"
        :black-keys="blackKeys"
        :white-key-count="whiteKeyCount"
        :black-key-width-percent="blackKeyWidthPercent"
      />

      <div
        class="piano-keyboard"
        role="application"
        aria-label="Teclado de piano de 88 teclas"
        :style="keyboardHeightStyle"
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
        >
          <span v-if="showKeyLabels" class="piano-key__label">{{ keyLabel(key.note) }}</span>
        </button>
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
        >
          <span v-if="showKeyLabels" class="piano-key__label">{{ keyLabel(key.note) }}</span>
        </button>
    </div>
      </div>
    </div>

    <div class="sustain-pedal">
      <div
        class="sustain-pedal__control"
        role="status"
        :aria-label="visualSustainPedalDown ? 'Pedal pressionado' : 'Pedal solto'"
      >
        <span class="sustain-pedal__label">PEDAL</span>
        <div
          class="sustain-pedal__indicator"
          :class="{ 'sustain-pedal__indicator--pressed': visualSustainPedalDown }"
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
          :class="{ 'pedal-visual__lever--pressed': visualSustainPedalDown }"
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
  </div>
</template>

<script>
import { buildPianoKeys } from '../utils/pianoKeys.js'
import { formatNoteLabels, formatSolfege, formatWestern } from '../utils/noteNames.js'
import { bindMidiInputs, isMidiSupported, requestMidiAccess } from '../utils/midiConnection.js'
import { isPianoMidiNote, midiNumberToNote, noteToMidiNumber, SUSTAIN_PEDAL_CC } from '../utils/midiNotes.js'
import {
  playPianoNote,
  releasePianoNote,
  releaseSustainedPianoNotes,
  stopAllPianoNotes,
} from '../utils/pianoAudio.js'
import {
  bpmToTempo,
  createMidiBlob,
  createMidiRecorder,
  formatRecordingFilename,
  saveMidiFile,
} from '../utils/midiRecorder.js'
import {
  createMetronome,
  getMetronomeBeatsPerBar,
  MAX_BPM,
  METRONOME_TIME_SIGNATURES,
  MIN_BPM,
} from '../utils/metronome.js'
import { parseMidiFile } from '../utils/midiParser.js'
import { createMidiPlayer } from '../utils/midiPlayer.js'
import { buildPianoRollNotes } from '../utils/midiPianoRoll.js'
import {
  createScreenRecorder,
  formatScreenRecordingFilename,
  getPreferredRecordingContainerLabel,
  getRecordingFormatFromMime,
  isScreenRecordingSupported,
  saveScreenRecording,
} from '../utils/screenRecorder.js'
import PianoRoll from './PianoRoll.vue'

const piano = buildPianoKeys()

const KEYBOARD_HEIGHT_DEFAULT = 220
const KEYBOARD_HEIGHT_MIN = 120
const KEYBOARD_HEIGHT_MAX = 360
const KEYBOARD_HEIGHT_STEP = 16

export default {
  name: 'PianoKeyboard',
  components: {
    PianoRoll,
  },
  data() {
    return {
      whiteKeys: piano.whiteKeys,
      blackKeys: piano.blackKeys,
      whiteKeyCount: piano.whiteKeyCount,
      pointerActive: {},
      pointerHeld: {},
      midiActive: {},
      sustainedActive: {},
      sustainPedalDown: false,
      midiBinder: null,
      isRecording: false,
      midiRecorder: createMidiRecorder(),
      showKeyLabels: false,
      keyLabelNotation: 'western',
      metronome: createMetronome(),
      metronomeRunning: false,
      metronomeBpm: 120,
      metronomeBpmEditing: false,
      metronomeBpmDraft: '',
      metronomeTimeSignature: '4/4',
      metronomeTimeSignatures: METRONOME_TIME_SIGNATURES,
      metronomeCurrentBeat: -1,
      midiFileName: '',
      midiParsedEvents: [],
      pianoRollNotes: [],
      midiPlayer: null,
      playbackStatus: 'idle',
      playbackActive: {},
      playbackSustained: {},
      playbackSustainPedalDown: false,
      midiDurationMs: 0,
      playbackPositionMs: 0,
      midiRecordedBpm: 120,
      playbackBpm: 120,
      playbackBpmEditing: false,
      playbackBpmDraft: '',
      controlsTab: 'playback',
      keyboardHeight: KEYBOARD_HEIGHT_DEFAULT,
      keyboardHeightStep: KEYBOARD_HEIGHT_STEP,
      screenRecorder: createScreenRecorder(),
      isScreenRecording: false,
      screenRecordingElapsedMs: 0,
    }
  },
  computed: {
    screenRecordingSupported() {
      return isScreenRecordingSupported()
    },
    screenRecordFormatLabel() {
      const mimeType = this.screenRecorder.getRecordingMimeType()

      return mimeType
        ? getRecordingFormatFromMime(mimeType).containerLabel
        : getPreferredRecordingContainerLabel(true)
    },
    screenRecordAriaLabel() {
      return `Gravar tela em ${this.screenRecordFormatLabel}`
    },
    screenRecordingIdleHint() {
      const format = this.screenRecordFormatLabel

      return `Salva em ${format} (H.264 quando disponível). Tela inteira + áudio do sistema; o piano é incluído`
    },
    screenRecordingHint() {
      const audioLabel = this.screenRecorder.hasAudioTrack()
        ? 'com áudio'
        : 'sem áudio do sistema'

      return `Gravando ${this.formatPlaybackTime(this.screenRecordingElapsedMs)} · ${this.screenRecordFormatLabel} ${audioLabel}`
    },
    keyboardHeightStyle() {
      return { height: `${this.keyboardHeight}px` }
    },
    canDecreaseKeyboardHeight() {
      return this.keyboardHeight > KEYBOARD_HEIGHT_MIN
    },
    canIncreaseKeyboardHeight() {
      return this.keyboardHeight < KEYBOARD_HEIGHT_MAX
    },
    blackKeyWidthPercent() {
      return (100 / this.whiteKeyCount) * 0.58
    },
    activeKeys() {
      if (this.playbackStatus === 'playing') {
        return {
          ...this.playbackActive,
          ...this.playbackSustained,
        }
      }

      return {
        ...this.pointerActive,
        ...this.midiActive,
        ...this.sustainedActive,
      }
    },
    metronomeBeatCount() {
      return getMetronomeBeatsPerBar(this.metronomeTimeSignature)
    },
    isPlaybackBlockingLive() {
      return this.playbackStatus === 'playing'
    },
    visualSustainPedalDown() {
      if (this.playbackStatus === 'playing') {
        return this.playbackSustainPedalDown
      }

      return this.sustainPedalDown
    },
    midiPlaybackReady() {
      return this.midiParsedEvents.length > 0
    },
    midiPlaybackCanStop() {
      return (
        this.midiPlaybackReady &&
        (this.playbackStatus === 'playing' || this.playbackStatus === 'paused')
      )
    },
    playbackProgressPercent() {
      if (!this.midiDurationMs) return 0

      return Math.min(
        100,
        (this.playbackPositionMs / this.midiDurationMs) * 100,
      )
    },
    playbackProgressAriaLabel() {
      return `Posição da reprodução: ${this.formatPlaybackTime(this.playbackPositionMs)} de ${this.formatPlaybackTime(this.midiDurationMs)}`
    },
    playbackBpmAriaLabel() {
      const percent = Math.round((this.playbackBpm / this.midiRecordedBpm) * 100)

      return `Velocidade da reprodução: ${this.playbackBpm} BPM (${percent}% do original ${this.midiRecordedBpm} BPM). Clique para editar.`
    },
    isPlaybackAtOriginalBpm() {
      return this.playbackBpm === this.midiRecordedBpm
    },
  },
  mounted() {
    this.metronome.setOnTick((beatIndex) => {
      this.metronomeCurrentBeat = beatIndex
    })
    this.screenRecorder.setOnElapsed((elapsedMs) => {
      this.screenRecordingElapsedMs = elapsedMs
    })
    this.screenRecorder.setOnShareEnded(() => {
      if (this.isScreenRecording) {
        this.stopScreenRecording()
      }
    })
    this.initMidi()
    window.addEventListener('keydown', this.handleRecordingKeydown)
    window.addEventListener('mouseup', this.onWindowMouseUp)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleRecordingKeydown)
    window.removeEventListener('mouseup', this.onWindowMouseUp)
    stopAllPianoNotes()
    this.metronome.dispose()
    this.screenRecorder.dispose()
    this.disposeMidiPlayer()
    this.teardownMidi()
  },
  methods: {
    handleRecordingKeydown(event) {
      if (this.isPlaybackBlockingLive) return
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
      if (this.playbackStatus === 'playing') {
        return Boolean(this.playbackActive[note])
      }

      return Boolean(this.pointerActive[note] || this.midiActive[note])
    },
    isKeySustained(note) {
      if (this.playbackStatus === 'playing') {
        return Boolean(this.playbackSustained[note] && !this.playbackActive[note])
      }

      return Boolean(
        this.sustainedActive[note] && !this.isKeyPressed(note),
      )
    },
    isKeyActive(note) {
      return this.isKeyPressed(note) || this.isKeySustained(note)
    },
    keyLabel(note) {
      return this.keyLabelNotation === 'western'
        ? formatWestern(note)
        : formatSolfege(note)
    },
    toggleShowKeyLabels() {
      this.showKeyLabels = !this.showKeyLabels
    },
    toggleKeyLabelNotation() {
      this.keyLabelNotation = this.keyLabelNotation === 'western' ? 'solfege' : 'western'
    },
    changeKeyboardHeight(delta) {
      const next = this.keyboardHeight + delta
      this.keyboardHeight = Math.max(
        KEYBOARD_HEIGHT_MIN,
        Math.min(KEYBOARD_HEIGHT_MAX, next),
      )
    },
    async toggleMetronome() {
      if (this.metronome.isRunning()) {
        this.stopMetronomeAudio()
        return
      }

      this.metronome.setBpm(this.metronomeBpm)
      this.metronome.setTimeSignature(this.metronomeTimeSignature)
      await this.metronome.start()
      this.metronomeRunning = true
    },
    stopMetronomeAudio() {
      this.metronome.stop()
      this.metronomeRunning = false
      this.metronomeCurrentBeat = -1
    },
    changePlaybackBpm(delta) {
      this.applyPlaybackBpm(this.playbackBpm + delta)
    },
    resetPlaybackBpm() {
      this.applyPlaybackBpm(this.midiRecordedBpm)
    },
    applyPlaybackBpm(value) {
      const bpm = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)))
      this.playbackBpm = bpm

      if (!this.midiPlayer || !this.midiRecordedBpm) return

      const rate = bpm / this.midiRecordedBpm
      this.midiPlayer.setPlaybackRate(rate)
    },
    startPlaybackBpmEdit() {
      this.playbackBpmDraft = String(this.playbackBpm)
      this.playbackBpmEditing = true

      this.$nextTick(() => {
        const input = this.$refs.playbackBpmInput
        if (input instanceof HTMLInputElement) {
          input.focus()
          input.select()
        }
      })
    },
    commitPlaybackBpm() {
      if (!this.playbackBpmEditing) return

      const parsed = Number.parseInt(this.playbackBpmDraft, 10)
      if (Number.isFinite(parsed)) {
        this.applyPlaybackBpm(parsed)
      }

      this.playbackBpmEditing = false
    },
    cancelPlaybackBpmEdit() {
      this.playbackBpmEditing = false
    },
    metronomeBeatDotClass(beatIndex) {
      const isCurrent = this.metronomeCurrentBeat === beatIndex

      return {
        'recorder-section__beat-dot--current': isCurrent,
        'recorder-section__beat-dot--strong': beatIndex === 0 && !isCurrent,
      }
    },
    changeMetronomeBpm(delta) {
      this.applyMetronomeBpm(this.metronomeBpm + delta)
    },
    applyMetronomeBpm(value) {
      this.metronomeBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)))
      this.metronome.setBpm(this.metronomeBpm)
    },
    startMetronomeBpmEdit() {
      this.metronomeBpmDraft = String(this.metronomeBpm)
      this.metronomeBpmEditing = true

      this.$nextTick(() => {
        const input = this.$refs.metronomeBpmInput
        if (!input) return

        input.focus()
        input.select()
      })
    },
    commitMetronomeBpm() {
      if (!this.metronomeBpmEditing) return

      const parsed = Number.parseInt(this.metronomeBpmDraft, 10)
      if (Number.isFinite(parsed)) {
        this.applyMetronomeBpm(parsed)
      }

      this.metronomeBpmEditing = false
    },
    cancelMetronomeBpmEdit() {
      this.metronomeBpmEditing = false
    },
    setMetronomeTimeSignature(signature) {
      this.metronomeTimeSignature = signature
      this.metronome.setTimeSignature(signature)
    },
    openMidiFilePicker() {
      this.$refs.midiFileInput?.click()
    },
    async onMidiFileSelected(event) {
      const input = event.target
      const file = input?.files?.[0]
      if (!file) return

      try {
        const buffer = await file.arrayBuffer()
        const parsed = parseMidiFile(buffer)

        this.stopPlayback()
        this.disposeMidiPlayer()
        this.midiParsedEvents = parsed.events
        this.pianoRollNotes = buildPianoRollNotes(parsed.events)
        this.midiDurationMs = parsed.durationMs
        this.midiRecordedBpm = parsed.initialBpm
        this.playbackBpm = parsed.initialBpm
        this.playbackPositionMs = 0
        this.midiFileName = file.name
        this.playbackStatus = 'ready'
        this.midiPlayer = createMidiPlayer(parsed.events, {
          onNoteOn: (midiNumber, velocity) => {
            this.handlePlaybackNoteOn(midiNumber, velocity)
          },
          onNoteOff: (midiNumber) => {
            this.handlePlaybackNoteOff(midiNumber)
          },
          onSustainPedal: (value) => {
            this.handlePlaybackSustainPedal(value)
          },
          onProgress: (positionMs, durationMs) => {
            this.playbackPositionMs = positionMs
            this.midiDurationMs = durationMs
          },
          onSeek: () => {
            this.resetPlaybackVisuals()
            stopAllPianoNotes()
          },
          onFinish: () => {
            this.finishPlayback()
          },
          onPause: (positionMs) => {
            this.playbackPositionMs = positionMs
            this.pausePlaybackVisuals()
          },
          onStop: () => {
            this.playbackPositionMs = 0
            this.resetPlaybackVisuals()
          },
        })
        this.midiPlayer.setPlaybackRate(1)
      } catch (error) {
        console.warn('Não foi possível ler o arquivo MIDI.', error)
        this.clearMidiFile()
      }

      input.value = ''
    },
    clearMidiFile() {
      this.stopPlayback()
      this.disposeMidiPlayer()
      this.midiFileName = ''
      this.midiParsedEvents = []
      this.pianoRollNotes = []
      this.midiDurationMs = 0
      this.midiRecordedBpm = 120
      this.playbackBpm = 120
      this.playbackBpmEditing = false
      this.playbackPositionMs = 0
      this.playbackStatus = 'idle'
    },
    removeMidiFile() {
      this.clearMidiFile()

      const input = this.$refs.midiFileInput
      if (input) {
        input.value = ''
      }
    },
    disposeMidiPlayer() {
      if (this.midiPlayer) {
        this.midiPlayer.dispose()
        this.midiPlayer = null
      }
    },
    togglePlaybackPlayPause() {
      if (!this.midiPlayer || !this.midiPlaybackReady) return

      if (this.playbackStatus === 'playing') {
        this.midiPlayer.pause()
        this.playbackStatus = 'paused'
        return
      }

      if (this.playbackStatus === 'paused') {
        this.playbackStatus = 'playing'
        this.midiPlayer.resume()
        return
      }

      this.startPlayback()
    },
    startPlayback() {
      if (!this.midiPlayer) return

      this.resetPlaybackVisuals()
      stopAllPianoNotes()
      this.playbackStatus = 'playing'
      this.midiPlayer.play(0)
    },
    stopPlayback() {
      if (!this.midiPlayer) {
        this.playbackStatus = this.midiPlaybackReady ? 'ready' : 'idle'
        this.playbackPositionMs = 0
        this.resetPlaybackVisuals()
        return
      }

      this.midiPlayer.stop()
      this.playbackStatus = this.midiPlaybackReady ? 'ready' : 'idle'
      this.resetPlaybackVisuals()
    },
    finishPlayback() {
      this.playbackStatus = this.midiPlaybackReady ? 'ready' : 'idle'
      this.playbackPositionMs = 0
      this.resetPlaybackVisuals()
    },
    formatPlaybackTime(ms) {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000))
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      return `${minutes}:${String(seconds).padStart(2, '0')}`
    },
    seekPlaybackFromEvent(event) {
      if (!this.midiPlayer || !this.midiDurationMs) return

      const track = event.currentTarget
      const rect = track.getBoundingClientRect()
      const ratio = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width),
      )
      const targetMs = ratio * this.midiDurationMs

      this.seekPlaybackTo(targetMs)
    },
    seekPlaybackTo(targetMs) {
      if (!this.midiPlayer) return

      this.midiPlayer.seek(targetMs)
      this.playbackPositionMs = targetMs
    },
    pausePlaybackVisuals() {
      this.resetPlaybackVisuals()
    },
    resetPlaybackVisuals() {
      this.playbackActive = {}
      this.playbackSustained = {}
      this.playbackSustainPedalDown = false
      stopAllPianoNotes()
    },
    handlePlaybackNoteOn(midiNumber, velocity = 100) {
      const note = midiNumberToNote(midiNumber)
      if (!note) return

      if (this.playbackSustained[note]) {
        const sustained = { ...this.playbackSustained }
        delete sustained[note]
        this.playbackSustained = sustained
      }

      this.playbackActive = { ...this.playbackActive, [note]: true }
      this.playKeyAudio(midiNumber, velocity)
    },
    handlePlaybackNoteOff(midiNumber) {
      const note = midiNumberToNote(midiNumber)
      if (!note || !this.playbackActive[note]) return

      const next = { ...this.playbackActive }
      delete next[note]
      this.playbackActive = next

      if (this.playbackSustainPedalDown) {
        this.playbackSustained = { ...this.playbackSustained, [note]: true }
      }

      releasePianoNote(midiNumber, {
        sustainPedalDown: this.playbackSustainPedalDown,
      }).catch((error) => {
        console.warn('Erro ao soltar áudio da nota.', error)
      })
    },
    handlePlaybackSustainPedal(value) {
      const isDown = value >= 64
      this.playbackSustainPedalDown = isDown

      if (!isDown) {
        this.playbackSustained = {}
        releaseSustainedPianoNotes()
      }
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
      if (this.isPlaybackBlockingLive) return

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
        this.recordLiveNoteOn(midiNumber, velocity)
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
        this.recordLiveNoteOff(midiNumber)
      }
    },
    recordLiveNoteOn(midiNumber, velocity) {
      if (!this.isRecording) return

      this.midiRecorder.recordNoteOn(midiNumber, velocity)
    },
    recordLiveNoteOff(midiNumber) {
      if (!this.isRecording) return

      this.midiRecorder.recordNoteOff(midiNumber)
    },
    recordLiveSustainPedal(value) {
      if (!this.isRecording) return

      this.midiRecorder.recordControlChange(SUSTAIN_PEDAL_CC, value)
    },
    onWindowMouseUp(event) {
      if (event.button !== 0 || this.isPlaybackBlockingLive) return

      for (const note of Object.keys(this.pointerHeld)) {
        this.releaseKey(note, 'pointer')
      }
    },
    handleSustainPedal(value) {
      if (this.isPlaybackBlockingLive) return

      const isDown = value >= 64
      this.sustainPedalDown = isDown
      this.recordLiveSustainPedal(value)

      if (!isDown) {
        this.sustainedActive = {}
        releaseSustainedPianoNotes()
      }
    },
    handleMidiControlChange(controller, value) {
      if (this.isPlaybackBlockingLive) return
      if (controller !== SUSTAIN_PEDAL_CC) return
      this.handleSustainPedal(value)
    },
    handleMidiNoteOn(midiNumber, velocity = 100) {
      if (this.isPlaybackBlockingLive) return
      if (!isPianoMidiNote(midiNumber)) return
      this.pressKey(midiNumberToNote(midiNumber), 'midi', velocity)
    },
    handleMidiNoteOff(midiNumber) {
      if (this.isPlaybackBlockingLive) return
      if (!isPianoMidiNote(midiNumber)) return
      this.releaseKey(midiNumberToNote(midiNumber), 'midi')
    },
    toggleRecording() {
      if (this.isPlaybackBlockingLive) return

      if (this.isRecording) {
        this.stopRecording()
        return
      }

      this.midiRecorder.start()
      this.isRecording = true
    },
    async toggleScreenRecording() {
      if (!this.screenRecordingSupported) return

      if (this.isScreenRecording) {
        await this.stopScreenRecording()
        return
      }

      await this.startScreenRecording()
    },
    async startScreenRecording() {
      try {
        await this.screenRecorder.start()
        this.isScreenRecording = true
        this.screenRecordingElapsedMs = 0
      } catch (error) {
        if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
          return
        }

        console.warn('Não foi possível iniciar a gravação de tela.', error)
      }
    },
    async stopScreenRecording() {
      if (!this.screenRecorder.isRecording()) {
        this.isScreenRecording = false
        this.screenRecordingElapsedMs = 0
        return
      }

      this.isScreenRecording = false
      this.screenRecordingElapsedMs = 0

      try {
        const blob = await this.screenRecorder.stop()

        if (!blob || blob.size === 0) {
          console.warn('Gravação de tela vazia.')
          return
        }

        const filename = formatScreenRecordingFilename(new Date(), blob.type)
        const result = await saveScreenRecording(blob, filename)

        if (result.cancelled) {
          console.warn('Salvamento do vídeo cancelado.')
        }
      } catch (error) {
        console.warn('Não foi possível salvar a gravação de tela.', error)
        this.screenRecorder.cancel()
      }
    },
    async stopRecording() {
      this.isRecording = false
      const events = this.midiRecorder.stop()

      if (events.length === 0) {
        console.warn('Gravação vazia: nenhuma nota ou pedal foi registrado.')
        return
      }

      const blob = createMidiBlob(events, {
        tempo: bpmToTempo(this.metronomeBpm),
      })
      const filename = `pianoapp-${formatRecordingFilename()}`

      try {
        const result = await saveMidiFile(blob, filename)

        if (result.cancelled) {
          console.warn('Salvamento do MIDI cancelado.')
        }
      } catch (error) {
        console.warn('Não foi possível salvar o arquivo MIDI.', error)
      }
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.piano-stage {
  margin-top: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
}

.piano-stage--with-roll {
  flex: 1;
  min-height: 0;
  margin-top: 16px;
  gap: 20px;
}

.piano-playfield {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.piano-playfield--with-roll {
  flex: 1;
  min-height: 0;
  gap: 0;
}

.piano-playfield--with-roll .piano-keyboard {
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.piano-keyboard {
  position: relative;
  width: 100%;
  height: 220px;
  min-height: 120px;
  max-height: 360px;
  user-select: none;
  touch-action: manipulation;
  overflow: visible;
}

.piano-keyboard__white-keys {
  display: flex;
  width: 100%;
  height: 100%;
}

.piano-key {
  position: relative;
  margin: 0;
  padding: 0;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  appearance: none;
  transition: border-color 0.1s ease;
}

.piano-key__label {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 92%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(0.45rem, 0.85vw, 0.625rem);
  font-weight: 600;
  line-height: 1;
  pointer-events: none;
}

.piano-key--white .piano-key__label {
  color: #6b7280;
}

.piano-key--white.piano-key--pressed .piano-key__label,
.piano-key--white:active .piano-key__label {
  color: #ffffff;
}

.piano-key--white.piano-key--sustained:not(:active) .piano-key__label {
  color: #1e40af;
}

.piano-key--black .piano-key__label {
  top: calc(100% + 10px);
  bottom: auto;
  width: max-content;
  max-width: none;
  overflow: visible;
  text-overflow: unset;
  font-size: clamp(0.42rem, 0.62vw, 0.55rem);
  color: #374151;
  z-index: 2;
}

.piano-key--black.piano-key--pressed .piano-key__label,
.piano-key--black:active .piano-key__label {
  color: #1e3a8a;
}

.piano-key--black.piano-key--sustained:not(:active) .piano-key__label {
  color: #1e40af;
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

.piano-key--white.piano-key--pressed,
.piano-key--white:active {
  background: #1d4ed8 !important;
  border-color: #1e3a8a !important;
}

.piano-key--white.piano-key--sustained:not(:active) {
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
  overflow: visible;
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

.piano-key--black.piano-key--pressed,
.piano-key--black:active {
  background: #1d4ed8 !important;
  border-color: #1e3a8a !important;
}

.piano-key--black.piano-key--sustained:not(:active) {
  background: #60a5fa !important;
  border-color: #93c5fd !important;
}

.recorder-section {
  --neu-surface: #25252d;
  --neu-light: rgba(255, 255, 255, 0.07);
  --neu-dark: rgba(0, 0, 0, 0.5);
  --neu-raised:
    6px 6px 12px var(--neu-dark),
    -6px -6px 12px var(--neu-light);
  --neu-raised-sm:
    4px 4px 8px var(--neu-dark),
    -4px -4px 8px var(--neu-light);
  --neu-pressed:
    inset 4px 4px 8px var(--neu-dark),
    inset -4px -4px 8px var(--neu-light);
  --neu-pressed-deep:
    inset 6px 6px 12px var(--neu-dark),
    inset -6px -6px 12px var(--neu-light);

  width: 100%;
  padding: 18px 22px 16px;
  border-radius: 20px;
  border: none;
  background: #1e1e24;
  box-shadow: var(--neu-pressed-deep);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.recorder-section__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.recorder-section__tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.recorder-section__tab {
  margin: 0;
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(243, 244, 246, 0.55);
  cursor: pointer;
  transition:
    color 0.12s ease,
    box-shadow 0.12s ease;
}

.recorder-section__tab:hover {
  color: rgba(243, 244, 246, 0.85);
}

.recorder-section__tab:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 3px;
}

.recorder-section__tab--active {
  color: #fbbf24;
  box-shadow: var(--neu-pressed);
}

.recorder-section__panel {
  width: 100%;
}

.recorder-section__panel--metronome .recorder-section__metronome {
  width: 100%;
}

.recorder-section__progress {
  width: 100%;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.recorder-section__progress-track {
  display: block;
  width: 100%;
  height: 10px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: var(--neu-surface);
  box-shadow: var(--neu-pressed-deep);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.recorder-section__progress-track:hover {
  box-shadow:
    var(--neu-pressed-deep),
    inset 0 0 0 1px rgba(251, 191, 36, 0.2);
}

.recorder-section__progress-track:focus-visible {
  outline: 2px solid #fbbf24;
  outline-offset: 3px;
}

.recorder-section__progress-fill {
  display: block;
  height: 100%;
  min-width: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #ca8a04 0%, #fbbf24 100%);
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.35);
  pointer-events: none;
}

.recorder-section__divider {
  width: 2px;
  height: 36px;
  border-radius: 1px;
  background: var(--neu-surface);
  box-shadow:
    inset 1px 0 2px var(--neu-dark),
    inset -1px 0 1px var(--neu-light);
}

.recorder-section__label {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(243, 244, 246, 0.65);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.recorder-section__button {
  width: 44px;
  height: 44px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.12s ease;
}

.recorder-section__button:hover {
  box-shadow:
    5px 5px 10px var(--neu-dark),
    -5px -5px 10px var(--neu-light);
}

.recorder-section__button:active {
  box-shadow: var(--neu-pressed);
  transform: scale(0.97);
}

.recorder-section__button:focus-visible {
  outline: 2px solid #ef4444;
  outline-offset: 3px;
}

.recorder-section__button--recording {
  box-shadow:
    var(--neu-pressed-deep),
    0 0 14px rgba(239, 68, 68, 0.35);
}

.recorder-section__button--play:focus-visible {
  outline: 2px solid #22c55e;
  outline-offset: 3px;
}

.recorder-section__button--pause-mode {
  box-shadow:
    var(--neu-pressed-deep),
    inset 0 0 0 1px rgba(251, 191, 36, 0.35);
}

.recorder-section__button--pause-mode:focus-visible {
  outline: 2px solid #fbbf24;
  outline-offset: 3px;
}

.recorder-section__icon--pause {
  position: relative;
  width: 14px;
  height: 14px;
}

.recorder-section__icon--pause::before,
.recorder-section__icon--pause::after {
  content: '';
  position: absolute;
  top: 0;
  width: 4px;
  height: 14px;
  border-radius: 1px;
  background: #fbbf24;
  box-shadow: 0 0 5px rgba(251, 191, 36, 0.55);
}

.recorder-section__icon--pause::before {
  left: 1px;
}

.recorder-section__icon--pause::after {
  right: 1px;
}

.recorder-section__button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--neu-pressed);
}

.recorder-section__button:disabled:hover {
  box-shadow: var(--neu-pressed);
}

.recorder-section__file-input {
  display: none;
}

.recorder-section__pill--file {
  min-width: 72px;
}

.recorder-section__pill--bpm-reset {
  min-width: 72px;
  margin-left: 4px;
}

.recorder-section__pill--remove-file {
  min-width: 72px;
  color: rgba(252, 165, 165, 0.9);
}

.recorder-section__pill--remove-file:hover {
  color: #fecaca;
}

.recorder-section__file-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(243, 244, 246, 0.5);
}

.recorder-section__button--stop-playback:focus-visible {
  outline: 2px solid rgba(243, 244, 246, 0.55);
  outline-offset: 3px;
}

.recorder-section__icon {
  display: block;
}

.recorder-section__icon--record {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow:
    0 0 8px rgba(239, 68, 68, 0.55),
    inset 1px 1px 2px rgba(255, 255, 255, 0.25),
    inset -1px -1px 2px rgba(0, 0, 0, 0.35);
}

.recorder-section__icon--stop {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  background: #f3f4f6;
}

.recorder-section__icon--play {
  width: 0;
  height: 0;
  margin-left: 3px;
  border-style: solid;
  border-width: 8px 0 8px 14px;
  border-color: transparent transparent transparent #22c55e;
  filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.45));
}

.recorder-section__hint {
  min-width: 72px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(243, 244, 246, 0.45);
}

.recorder-section__hint--active {
  color: #fca5a5;
}

.recorder-section__pill {
  height: 36px;
  margin: 0;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(243, 244, 246, 0.72);
  cursor: pointer;
  transition: box-shadow 0.15s ease, color 0.15s ease, transform 0.12s ease;
}

.recorder-section__pill:hover {
  box-shadow:
    5px 5px 10px var(--neu-dark),
    -5px -5px 10px var(--neu-light);
}

.recorder-section__pill:active {
  box-shadow: var(--neu-pressed);
  transform: scale(0.98);
}

.recorder-section__pill:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 3px;
}

.recorder-section__pill--active {
  box-shadow:
    var(--neu-pressed-deep),
    inset 0 0 12px rgba(59, 130, 246, 0.12);
  color: #93c5fd;
}

.recorder-section__pill--notation {
  min-width: 52px;
}

.recorder-section__pill--time {
  min-width: 46px;
  padding: 0 12px;
}

.recorder-section__metronome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.recorder-section__metronome-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.recorder-section__beat-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 10px;
}

.recorder-section__beat-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
  transition:
    background-color 0.08s ease,
    box-shadow 0.08s ease,
    transform 0.08s ease;
}

.recorder-section__beat-dot--strong {
  background: #a16207;
  box-shadow:
    var(--neu-raised-sm),
    0 0 6px rgba(202, 138, 4, 0.35);
}

.recorder-section__beat-dot--current {
  background: #f59e0b;
  box-shadow:
    var(--neu-pressed),
    0 0 10px rgba(245, 158, 11, 0.65);
  transform: scale(1.2);
}

.recorder-section__button--metronome:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 3px;
}

.recorder-section__button--metronome-active {
  box-shadow:
    var(--neu-pressed-deep),
    0 0 14px rgba(245, 158, 11, 0.35);
}

.recorder-section__icon--metronome-play {
  width: 0;
  height: 0;
  margin-left: 3px;
  border-style: solid;
  border-width: 9px 0 9px 16px;
  border-color: transparent transparent transparent #f59e0b;
  filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.45));
}

.recorder-section__icon--metronome-stop {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  background: #f3f4f6;
}

.recorder-section__bpm {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.recorder-section__bpm-step {
  width: 32px;
  height: 32px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: rgba(243, 244, 246, 0.85);
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.12s ease;
}

.recorder-section__bpm-step-glyph {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1;
  transform: translateY(-2px);
}

.recorder-section__bpm-step:hover {
  box-shadow:
    5px 5px 10px var(--neu-dark),
    -5px -5px 10px var(--neu-light);
}

.recorder-section__bpm-step:active {
  box-shadow: var(--neu-pressed);
  transform: scale(0.96);
}

.recorder-section__bpm-step:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.recorder-section__bpm-value {
  min-width: 72px;
  margin: 0;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: var(--neu-surface);
  box-shadow: var(--neu-pressed);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(243, 244, 246, 0.85);
  text-align: center;
  cursor: text;
  transition: box-shadow 0.15s ease;
}

.recorder-section__bpm-value--readonly {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.recorder-section__bpm-value:hover {
  box-shadow:
    inset 5px 5px 10px var(--neu-dark),
    inset -5px -5px 10px var(--neu-light);
}

.recorder-section__bpm-value:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.recorder-section__bpm-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 72px;
  padding: 4px 8px;
  border-radius: 10px;
  background: var(--neu-surface);
  box-shadow: var(--neu-pressed);
}

.recorder-section__bpm-input {
  width: 44px;
  margin: 0;
  padding: 6px 8px;
  border: none;
  border-radius: 8px;
  background: var(--neu-surface);
  box-shadow: var(--neu-pressed-deep);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f3f4f6;
  text-align: center;
}

.recorder-section__bpm-input:focus {
  outline: none;
  box-shadow:
    var(--neu-pressed-deep),
    0 0 0 2px rgba(245, 158, 11, 0.35);
}

.recorder-section__bpm-suffix {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(243, 244, 246, 0.85);
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
