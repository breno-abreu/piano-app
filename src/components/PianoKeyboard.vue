<template>
  <div class="piano-wrapper" :style="viewZoomStyle">
    <section
      class="recorder-section recorder-section--top-nav-layout"
      :class="{
        'recorder-section--rhythmic-tab': controlsTab === 'rhythmicFigures',
        'recorder-section--piano-roll-layout': showPianoRoll,
      }"
      aria-label="Controles da performance"
    >
      <nav class="recorder-section__nav" aria-label="Seções de controles">
        <div class="recorder-section__brand-group">
          <div class="recorder-section__brand" aria-label="Crispy Keys">
            <CookieIcon class="recorder-section__brand-icon" aria-hidden="true" :stroke-width="2" />
            <span>Crispy Keys</span>
          </div>

          <AppTooltip
            v-if="midiConnectionStatus !== 'connected'"
            :text="midiConnectionIndicatorTooltip"
            placement="bottom"
          >
            <span
              class="recorder-section__midi-status"
              role="status"
              aria-label="Controlador MIDI não conectado"
            >
              <UnplugIcon />
            </span>
          </AppTooltip>

          <AppTooltip
            v-if="isRecording"
            text="Gravação MIDI em andamento. Clique em Gravação para parar e salvar."
            placement="bottom"
          >
            <span
              class="recorder-section__recording-status"
              role="status"
              aria-label="Gravação MIDI em andamento"
            >
              <CircleDotIcon />
            </span>
          </AppTooltip>
        </div>

        <div class="recorder-section__tabs">
          <div class="recorder-section__tabs-main" role="tablist">
            <button
              v-for="tab in controlMainTabs"
              :id="tab.idAttr"
              :key="tab.id"
              type="button"
              role="tab"
              class="recorder-section__tab"
              :class="{ 'recorder-section__tab--active': controlsTab === tab.id }"
              :aria-selected="controlsTab === tab.id"
              :aria-controls="tab.panelId"
              :aria-label="tab.label"
              @click="selectControlTab(tab.id)"
            >
              <span class="recorder-section__tab-label">{{ tab.label }}</span>
            </button>
          </div>

          <div class="recorder-section__tabs-footer">
            <div class="recorder-section__nav-separator" aria-hidden="true" />
            <button
              type="button"
              class="recorder-section__tab recorder-section__icon-button"
              :class="{ 'recorder-section__tab--active': metronomePopoverOpen || metronomeRunning }"
              aria-label="Abrir metrônomo"
              :aria-expanded="metronomePopoverOpen"
              aria-haspopup="dialog"
              @click.stop="toggleMetronomePopover"
            >
              <ControlTabIcon name="metronome" />
            </button>
            <button
              :id="controlOptionsTab.idAttr"
              ref="optionsButton"
              type="button"
              class="recorder-section__tab recorder-section__icon-button"
              :class="{ 'recorder-section__tab--active': optionsPopoverOpen }"
              :aria-controls="controlOptionsTab.panelId"
              :aria-label="controlOptionsTab.label"
              :aria-expanded="optionsPopoverOpen"
              aria-haspopup="dialog"
              @click.stop="toggleOptionsPopover"
            >
              <ControlTabIcon :name="controlOptionsTab.icon" />
            </button>
          </div>
        </div>

        <div
          v-if="metronomePopoverOpen"
          class="recorder-section__popover recorder-section__popover--metronome"
          role="dialog"
          aria-label="Metrônomo"
          @click.stop
        >
          <MetronomePopoverPanel
            :metronome-running="metronomeRunning"
            :metronome-bpm="metronomeBpm"
            :metronome-time-signatures="metronomeTimeSignatures"
            :metronome-time-signature="metronomeTimeSignature"
            :metronome-beat-count="metronomeBeatCount"
            :metronome-current-beat="metronomeCurrentBeat"
            @toggle-metronome="toggleMetronome"
            @change-metronome-bpm="changeMetronomeBpm"
            @update:metronome-bpm="applyMetronomeBpm"
            @set-metronome-time-signature="setMetronomeTimeSignature"
          />
        </div>

        <div
          v-if="optionsPopoverOpen"
          class="recorder-section__popover recorder-section__popover--options"
          role="dialog"
          aria-label="Opções rápidas"
          @click.stop
        >
          <OptionsTabPanel
            floating
            :show-key-labels="showKeyLabels"
            :harmonic-display-enabled="harmonicDisplayEnabled"
            :key-label-notation="keyLabelNotation"
            :accidental-notations="accidentalNotations"
            :accidental-notation="accidentalNotation"
            :keyboard-height="keyboardHeight"
            :keyboard-height-step="keyboardHeightStep"
            :can-decrease-keyboard-height="canDecreaseKeyboardHeight"
            :can-increase-keyboard-height="canIncreaseKeyboardHeight"
            :view-zoom="viewZoom"
            :view-zoom-step="viewZoomStep"
            :view-zoom-default="viewZoomDefault"
            :view-zoom-percent="viewZoomPercent"
            :can-decrease-view-zoom="canDecreaseViewZoom"
            :can-increase-view-zoom="canIncreaseViewZoom"
            :piano-volume="pianoVolume"
            :metronome-volume="metronomeVolume"
            :design-themes="designThemes"
            :design-theme="designTheme"
            @toggle-show-key-labels="toggleShowKeyLabels"
            @toggle-harmonic-display="toggleHarmonicDisplay"
            @update:design-theme="setDesignTheme"
            @update:key-label-notation="setKeyLabelNotation"
            @update:accidental-notation="setAccidentalNotation"
            @change-keyboard-height="changeKeyboardHeight"
            @change-view-zoom="changeViewZoom"
            @reset-view-zoom="resetViewZoom"
            @update:piano-volume="onPianoVolumeChange"
            @update:metronome-volume="onMetronomeVolumeChange"
          />
        </div>
      </nav>

      <div class="recorder-section__nav-divider" aria-hidden="true" />

      <div class="recorder-section__main">
      <div class="recorder-section__body">
        <AppTooltip
          v-if="activeTabHelpText"
          class="recorder-section__help"
          :text="activeTabHelpText"
          placement="left"
        >
          <button
            type="button"
            class="recorder-section__help-button"
            :aria-label="`Ajuda: ${activeTabHelpLabel}`"
          >
            <CircleQuestionMarkIcon aria-hidden="true" :stroke-width="2" />
          </button>
        </AppTooltip>

        <HomeTabPanel
          v-show="controlsTab === 'home'"
          :cards="homeTabCards"
          @select-tab="selectControlTab"
        />

        <RecordingTabPanel
          v-show="controlsTab === 'recording'"
          :is-recording="isRecording"
          :is-screen-recording="isScreenRecording"
          :screen-recording-supported="screenRecordingSupported"
          :screen-record-aria-label="screenRecordAriaLabel"
          :screen-recording-hint="screenRecordingHint"
          :screen-recording-idle-hint="screenRecordingIdleHint"
          :metronome-running="metronomeRunning"
          :metronome-bpm="metronomeBpm"
          :metronome-time-signatures="metronomeTimeSignatures"
          :metronome-time-signature="metronomeTimeSignature"
          :metronome-beat-count="metronomeBeatCount"
          :metronome-current-beat="metronomeCurrentBeat"
          @toggle-recording="toggleRecording"
          @toggle-screen-recording="toggleScreenRecording"
          @toggle-metronome="toggleMetronome"
          @change-metronome-bpm="changeMetronomeBpm"
          @update:metronome-bpm="applyMetronomeBpm"
          @set-metronome-time-signature="setMetronomeTimeSignature"
        />

        <PlaybackTabPanel
          v-show="controlsTab === 'playback'"
          :midi-file-name="midiFileName"
          :midi-playback-ready="midiPlaybackReady"
          :playback-status="playbackStatus"
          :midi-playback-can-stop="midiPlaybackCanStop"
          :playback-bpm="playbackBpm"
          :midi-recorded-bpm="midiRecordedBpm"
          :is-playback-at-original-bpm="isPlaybackAtOriginalBpm"
          :playback-bpm-aria-label="playbackBpmAriaLabel"
          :show-progress="midiPlaybackReady"
          :playback-progress-percent="playbackProgressPercent"
          :playback-progress-aria-label="playbackProgressAriaLabel"
          :playback-position-ms="playbackPositionMs"
          :midi-duration-ms="midiDurationMs"
          :demo-loading="midiDemoLoading"
          @file-selected="onMidiFileSelected"
          @load-demo="loadMidiDemo"
          @remove-file="removeMidiFile"
          @toggle-play-pause="togglePlaybackPlayPause"
          @stop="stopPlayback"
          @change-playback-bpm="changePlaybackBpm"
          @update:playback-bpm="applyPlaybackBpm"
          @reset-playback-bpm="resetPlaybackBpm"
          @seek="seekPlaybackFromEvent"
        />

        <HarmonicTabPanel
          v-show="controlsTab === 'harmonic'"
          :accidental-notations="accidentalNotations"
          :accidental-notation="accidentalNotation"
          :harmonic-display-enabled="harmonicDisplayEnabled"
          :harmonic-scale-types="harmonicScaleTypes"
          :harmonic-scale-type="harmonicScaleType"
          :harmonic-tonics="harmonicTonics"
          :harmonic-tonic="harmonicTonic"
          :harmonic-chords="harmonicChords"
          :harmonic-selected-chord-id="harmonicSelectedChordId"
          :show-key-labels="showKeyLabels"
          @update:accidental-notation="setAccidentalNotation"
          @toggle-harmonic-display="toggleHarmonicDisplay"
          @update:harmonic-scale-type="setHarmonicScaleType"
          @update:harmonic-tonic="setHarmonicTonic"
          @toggle-harmonic-chord="toggleHarmonicChord"
          @toggle-show-key-labels="toggleShowKeyLabels"
        />

        <ChordDictionaryTabPanel
          v-show="controlsTab === 'chordDictionary'"
          :accidental-notation="accidentalNotation"
          :chord-dict-roots="chordDictRoots"
          :chord-dict-qualities="chordDictQualities"
          :chord-dict-root="chordDictRoot"
          :chord-dict-quality-id="chordDictQualityId"
          :chord-dict-bass-roots="chordDictBassRoots"
          :chord-dict-active-bass-root="chordDictActiveBassRoot"
          :chord-dict-can-invert="chordDictCanInvert"
          :chord-dict-bass-can-invert="chordDictBassCanInvert"
          :chord-dict-inversion-label="chordDictInversionLabel"
          :chord-dict-bass-inversion-label="chordDictBassInversionLabel"
          :chord-dict-final-label="chordDictFinalLabel"
          :chord-dict-treble-notes="chordDictTrebleNotes"
          :chord-dict-bass-notes="chordDictBassNotes"
          @set-chord-dict-root="setChordDictRoot"
          @set-chord-dict-quality="setChordDictQuality"
          @set-chord-dict-bass-root="setChordDictBassRoot"
          @shift-chord-dict-inversion="shiftChordDictInversion"
          @shift-chord-dict-bass-inversion="shiftChordDictBassInversion"
          @play-chord="playChordDictionaryChord"
        />

        <RhythmicFiguresTabPanel v-show="controlsTab === 'rhythmicFigures'" />
      </div>

    <div
      class="piano-stage"
      :class="{ 'piano-stage--with-roll': showPianoRoll }"
    >
    <div
      class="piano-playfield"
      :class="{ 'piano-playfield--with-roll': showPianoRoll }"
    >
      <PianoRoll
        v-if="showPianoRoll"
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
            'piano-key--harmonic-chord': isHarmonicChordNote(key.note),
            'piano-key--chord-dict': isChordDictTrebleNote(key.note),
            'piano-key--chord-dict-bass': isChordDictBassNote(key.note),
          }"
          :aria-label="key.note"
          :aria-pressed="isKeyActive(key.note)"
          @mousedown.prevent="pressKey(key.note, 'pointer')"
        >
          <span
            v-if="isHarmonicTonicNote(key.note)"
            class="piano-key__harmonic-marker piano-key__harmonic-marker--tonic"
            aria-hidden="true"
          />
          <span
            v-else-if="isHarmonicScaleNote(key.note)"
            class="piano-key__harmonic-marker piano-key__harmonic-marker--scale"
            aria-hidden="true"
          />
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
          'piano-key--harmonic-chord': isHarmonicChordNote(key.note),
          'piano-key--chord-dict': isChordDictTrebleNote(key.note),
          'piano-key--chord-dict-bass': isChordDictBassNote(key.note),
        }"
        :style="blackKeyStyle(key)"
        :aria-label="key.note"
        :aria-pressed="isKeyActive(key.note)"
        @mousedown.prevent="pressKey(key.note, 'pointer')"
        >
          <span
            v-if="isHarmonicTonicNote(key.note)"
            class="piano-key__harmonic-marker piano-key__harmonic-marker--tonic"
            aria-hidden="true"
          />
          <span
            v-else-if="isHarmonicScaleNote(key.note)"
            class="piano-key__harmonic-marker piano-key__harmonic-marker--scale"
            aria-hidden="true"
          />
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
    </section>
  </div>
</template>

<script>
import { buildPianoKeys } from '../utils/pianoKeys.js'
import {
  formatNoteLabels,
  formatSolfege,
  formatWestern,
  parseNote,
} from '../utils/noteNames.js'
import {
  bindMidiInputs,
  isMidiSupported,
  requestMidiAccess,
} from '../utils/midiConnection.js'
import { isPianoMidiNote, midiNumberToNote, noteToMidiNumber, SUSTAIN_PEDAL_CC } from '../utils/midiNotes.js'
import {
  playPianoNote,
  releasePianoNote,
  releaseSustainedPianoNotes,
  resumePianoAudioContext,
  setPianoVolume,
  stopAllPianoNotes,
} from '../utils/pianoAudio.js'
import { showToast } from '../utils/toast.js'
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
import { CircleDot as CircleDotIcon, CircleQuestionMark as CircleQuestionMarkIcon, Cookie as CookieIcon, Unplug as UnplugIcon } from '@lucide/vue'
import {
  ACCIDENTAL_NOTATIONS,
  buildHarmonicField,
  formatHarmonicTonicLabel,
  HARMONIC_SCALE_TYPES,
  HARMONIC_TONICS,
  isNoteInPitchClassSet,
} from '../utils/harmonicField.js'
import {
  CHORD_DICTIONARY_BASS_ROOTS,
  CHORD_DICTIONARY_QUALITIES,
  CHORD_DICTIONARY_ROOTS,
  formatChordDictionaryLabel,
  formatChordQualityLabel,
  formatChordWithBass,
  findChordQualitySuffix,
  findChordBassInversionIndex,
  formatInversionLabel,
  getBassInversionCount,
  getBassVoicingNotes,
  getChordBassInversionCount,
  getChordBassInversionNotes,
  getChordVoicingNotes,
} from '../utils/chordDictionary.js'
import {
  DESIGN_THEMES,
  isValidDesignTheme,
  VIEW_ZOOM_DEFAULT,
  VIEW_ZOOM_MAX,
  VIEW_ZOOM_MIN,
  VIEW_ZOOM_STEP,
  VOLUME_MAX,
  VOLUME_MIN,
} from '../utils/userPreferences.js'
import { useOptionsPreferencesStore } from '../stores/optionsPreferencesStore.js'
import {
  createScreenRecorder,
  formatScreenRecordingFilename,
  getPreferredRecordingContainerLabel,
  getRecordingFormatFromMime,
  isScreenRecordingSupported,
  saveScreenRecording,
} from '../utils/screenRecorder.js'
import AppTooltip from './AppTooltip.vue'
import ControlTabIcon from './ControlTabIcon.vue'
import PianoRoll from './PianoRoll.vue'
import HomeTabPanel from './tabs/HomeTabPanel.vue'
import MetronomePopoverPanel from './tabs/MetronomePopoverPanel.vue'
import RecordingTabPanel from './tabs/RecordingTabPanel.vue'
import PlaybackTabPanel from './tabs/PlaybackTabPanel.vue'
import OptionsTabPanel from './tabs/OptionsTabPanel.vue'
import HarmonicTabPanel from './tabs/HarmonicTabPanel.vue'
import ChordDictionaryTabPanel from './tabs/ChordDictionaryTabPanel.vue'
import RhythmicFiguresTabPanel from './tabs/RhythmicFiguresTabPanel.vue'

const piano = buildPianoKeys()

const KEYBOARD_HEIGHT_DEFAULT = 220
const KEYBOARD_HEIGHT_MIN = 120
const KEYBOARD_HEIGHT_MAX = 360
const KEYBOARD_HEIGHT_STEP = 16

const keyboardHeightBounds = {
  min: KEYBOARD_HEIGHT_MIN,
  max: KEYBOARD_HEIGHT_MAX,
  step: KEYBOARD_HEIGHT_STEP,
  fallback: KEYBOARD_HEIGHT_DEFAULT,
}

const CONTROL_TABS = [
  {
    id: 'home',
    label: 'Início',
    icon: 'home',
    idAttr: 'controls-tab-home',
    panelId: 'controls-panel-home',
  },
  {
    id: 'playback',
    label: 'Reprodução',
    icon: 'playback',
    idAttr: 'controls-tab-playback',
    panelId: 'controls-panel-playback',
    description: 'Carregue arquivos MIDI, reproduza, pause e ajuste a velocidade.',
    helpText:
      'Reproduza arquivos MIDI. Carregue com Arquivo ou Demo, use Play/Pause e ajuste a velocidade se quiser.',
  },
  {
    id: 'recording',
    label: 'Gravação',
    icon: 'recording',
    idAttr: 'controls-tab-recording',
    panelId: 'controls-panel-recording',
    description: 'Grave performances MIDI, capture a tela e controle o metrônomo.',
    helpText:
      'Grave a performance em MIDI ou capture a tela. Toque no teclado e use o metrônomo para manter o andamento.',
  },
  {
    id: 'harmonic',
    label: 'Campos Harmônicos',
    icon: 'harmonic',
    idAttr: 'controls-tab-harmonic',
    panelId: 'controls-panel-harmonic',
    description: 'Visualize escalas, graus e acordes diretamente no teclado.',
    helpText:
      'Veja o campo harmônico no teclado. Escolha tônica e escala; clique em um acorde para destacá-lo.',
  },
  {
    id: 'chordDictionary',
    label: 'Dicionário de Acordes',
    icon: 'chord-dictionary',
    idAttr: 'controls-tab-chord-dictionary',
    panelId: 'controls-panel-chord-dictionary',
    description: 'Monte acordes, inversões e baixos alternativos para estudar voicings.',
    helpText:
      'Monte e estude acordes. Escolha raiz e qualidade, teste inversões e toque o acorde no teclado.',
  },
  {
    id: 'rhythmicFigures',
    label: 'Figuras Rítmicas',
    icon: 'rhythmic-figures',
    idAttr: 'controls-tab-rhythmic-figures',
    panelId: 'controls-panel-rhythmic-figures',
    description: 'Organize células rítmicas e pratique combinações de duração.',
    helpText:
      'Monte sequências rítmicas. Arraste figuras para o painel e pratique as combinações.',
  },
]

const CONTROL_OPTIONS_TAB = {
  id: 'options',
  label: 'Opções',
  icon: 'options',
  idAttr: 'controls-tab-options',
  panelId: 'controls-panel-options',
  description: 'Ajuste visual, altura do teclado, zoom, volume e preferências de notas.',
}

export default {
  name: 'PianoKeyboard',
  components: {
    AppTooltip,
    CircleDotIcon,
    CircleQuestionMarkIcon,
    CookieIcon,
    ControlTabIcon,
    UnplugIcon,
    PianoRoll,
    HomeTabPanel,
    MetronomePopoverPanel,
    RecordingTabPanel,
    PlaybackTabPanel,
    OptionsTabPanel,
    HarmonicTabPanel,
    ChordDictionaryTabPanel,
    RhythmicFiguresTabPanel,
  },
  setup() {
    const optionsPreferencesStore = useOptionsPreferencesStore()
    optionsPreferencesStore.hydrate(keyboardHeightBounds)

    return {
      optionsPreferencesStore,
    }
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
      midiConnectionStatus: 'pending',
      isRecording: false,
      midiRecorder: createMidiRecorder(),
      metronome: createMetronome(),
      metronomeRunning: false,
      metronomeBpm: 120,
      metronomeTimeSignature: '4/4',
      metronomeTimeSignatures: METRONOME_TIME_SIGNATURES,
      metronomeCurrentBeat: -1,
      midiFileName: '',
      midiParsedEvents: [],
      pianoRollNotes: [],
      midiPlayer: null,
      midiDemoLoading: false,
      playbackStatus: 'idle',
      playbackActive: {},
      playbackSustained: {},
      playbackSustainPedalDown: false,
      midiDurationMs: 0,
      playbackPositionMs: 0,
      midiRecordedBpm: 120,
      playbackBpm: 120,
      playbackAudioErrorNotified: false,
      controlsTab: 'home',
      optionsPopoverOpen: false,
      metronomePopoverOpen: false,
      controlOptionsTab: CONTROL_OPTIONS_TAB,
      designThemes: DESIGN_THEMES,
      keyboardHeightStep: KEYBOARD_HEIGHT_STEP,
      viewZoomStep: VIEW_ZOOM_STEP,
      viewZoomDefault: VIEW_ZOOM_DEFAULT,
      volumeMin: VOLUME_MIN,
      volumeMax: VOLUME_MAX,
      accidentalNotations: ACCIDENTAL_NOTATIONS,
      screenRecorder: createScreenRecorder(),
      isScreenRecording: false,
      screenRecordingElapsedMs: 0,
      harmonicScaleTypes: HARMONIC_SCALE_TYPES,
      harmonicTonics: HARMONIC_TONICS,
      harmonicScaleType: 'major',
      harmonicTonic: 'C',
      harmonicSelectedChordId: null,
      chordDictRoots: CHORD_DICTIONARY_ROOTS,
      chordDictQualities: CHORD_DICTIONARY_QUALITIES,
      chordDictRoot: 'C',
      chordDictQualityId: 'maj',
      chordDictInversion: 0,
      chordDictBassRoots: CHORD_DICTIONARY_BASS_ROOTS,
      chordDictBassRoot: 'C',
      chordDictBassInversion: 0,
      chordDictBassManual: false,
      chordDictBassManualRoot: 'C',
      chordPreviewReleaseTimer: null,
      chordPreviewMidiNotes: [],
    }
  },
  computed: {
    showKeyLabels: {
      get() {
        return this.optionsPreferencesStore.showKeyLabels
      },
      set(value) {
        this.optionsPreferencesStore.updatePreference('showKeyLabels', value)
      },
    },
    harmonicDisplayEnabled: {
      get() {
        return this.optionsPreferencesStore.harmonicDisplayEnabled
      },
      set(value) {
        this.optionsPreferencesStore.updatePreference('harmonicDisplayEnabled', value)
      },
    },
    keyLabelNotation: {
      get() {
        return this.optionsPreferencesStore.keyLabelNotation
      },
      set(value) {
        this.optionsPreferencesStore.updatePreference('keyLabelNotation', value)
      },
    },
    keyboardHeight: {
      get() {
        return this.optionsPreferencesStore.keyboardHeight
      },
      set(value) {
        this.optionsPreferencesStore.updatePreference('keyboardHeight', value)
      },
    },
    viewZoom: {
      get() {
        return this.optionsPreferencesStore.viewZoom
      },
      set(value) {
        this.optionsPreferencesStore.updatePreference('viewZoom', value)
      },
    },
    pianoVolume: {
      get() {
        return this.optionsPreferencesStore.pianoVolume
      },
      set(value) {
        this.optionsPreferencesStore.updatePreference('pianoVolume', value)
      },
    },
    metronomeVolume: {
      get() {
        return this.optionsPreferencesStore.metronomeVolume
      },
      set(value) {
        this.optionsPreferencesStore.updatePreference('metronomeVolume', value)
      },
    },
    accidentalNotation: {
      get() {
        return this.optionsPreferencesStore.accidentalNotation
      },
      set(value) {
        this.optionsPreferencesStore.updatePreference('accidentalNotation', value)
      },
    },
    designTheme: {
      get() {
        return this.optionsPreferencesStore.designTheme
      },
      set(value) {
        this.optionsPreferencesStore.updatePreference('designTheme', value)
      },
    },
    controlMainTabs() {
      return CONTROL_TABS
    },
    activeControlTab() {
      return CONTROL_TABS.find((tab) => tab.id === this.controlsTab) ?? null
    },
    activeTabHelpText() {
      if (this.controlsTab === 'home') return ''
      return this.activeControlTab?.helpText ?? ''
    },
    activeTabHelpLabel() {
      return this.activeControlTab?.label ?? ''
    },
    homeTabCards() {
      return CONTROL_TABS.filter((tab) => tab.id !== 'home')
    },
    harmonicField() {
      return buildHarmonicField(this.harmonicTonic, this.harmonicScaleType)
    },
    harmonicChords() {
      return this.harmonicField.chords
    },
    harmonicSelectedChord() {
      if (!this.harmonicSelectedChordId) return null

      return (
        this.harmonicChords.find(
          (chord) => chord.id === this.harmonicSelectedChordId,
        ) ?? null
      )
    },
    chordDictInversionCount() {
      return getChordVoicingNotes(this.chordDictRoot, this.chordDictQualityId, 0).length
    },
    chordDictCanInvert() {
      return this.chordDictInversionCount > 1
    },
    chordDictTrebleNotes() {
      return getChordVoicingNotes(
        this.chordDictRoot,
        this.chordDictQualityId,
        this.chordDictInversion,
      )
    },
    chordDictTrebleNoteSet() {
      return new Set(this.chordDictTrebleNotes)
    },
    chordDictBassInversionCount() {
      if (this.chordDictBassManual) {
        return getBassInversionCount(this.chordDictBassManualRoot)
      }

      return getChordBassInversionCount(
        this.chordDictRoot,
        this.chordDictQualityId,
      )
    },
    chordDictBassCanInvert() {
      return this.chordDictBassInversionCount > 1
    },
    chordDictBassNotes() {
      if (this.chordDictBassManual) {
        return getBassVoicingNotes(
          this.chordDictBassManualRoot,
          this.chordDictBassInversion,
        )
      }

      return getChordBassInversionNotes(
        this.chordDictRoot,
        this.chordDictQualityId,
        this.chordDictBassInversion,
      )
    },
    chordDictActiveBassRoot() {
      const bassNote = this.chordDictBassNotes[0]

      if (!bassNote) return this.chordDictBassRoot

      const parsed = parseNote(bassNote)

      if (!parsed) return this.chordDictBassRoot

      return `${parsed.letter}${parsed.sharp}`
    },
    chordDictBassNoteSet() {
      return new Set(this.chordDictBassNotes)
    },
    chordDictFinalLabel() {
      return formatChordWithBass(
        this.chordDictRoot,
        this.chordDictQualityId,
        this.chordDictActiveBassRoot,
        this.accidentalNotation,
      )
    },
    chordDictInversionLabel() {
      return formatInversionLabel(
        this.chordDictInversion,
        this.chordDictInversionCount,
      )
    },
    chordDictBassInversionLabel() {
      return formatInversionLabel(
        this.chordDictBassInversion,
        this.chordDictBassInversionCount,
      )
    },
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
    viewZoomStyle() {
      return { zoom: this.viewZoom }
    },
    viewZoomPercent() {
      return Math.round(this.viewZoom * 100)
    },
    canDecreaseViewZoom() {
      return this.viewZoom > VIEW_ZOOM_MIN
    },
    canIncreaseViewZoom() {
      return this.viewZoom < VIEW_ZOOM_MAX
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
    showPianoRoll() {
      return this.midiPlaybackReady && this.controlsTab === 'playback'
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
    midiConnectionIndicatorTooltip() {
      if (this.midiConnectionStatus === 'pending') {
        return 'Procurando controladores MIDI conectados.'
      }

      if (this.midiConnectionStatus === 'unsupported') {
        return 'MIDI não é suportado neste navegador. Use Chrome, Edge ou Opera.'
      }

      if (this.midiConnectionStatus === 'unavailable') {
        return 'Não foi possível acessar o MIDI. Verifique as permissões do navegador.'
      }

      return 'Nenhum controlador MIDI conectado. Conecte um teclado ou controlador para tocar pelo dispositivo físico.'
    },
  },
  watch: {
    designTheme() {
      this.applyDesignTheme()
    },
  },
  mounted() {
    this.applyDesignTheme()
    setPianoVolume(this.pianoVolume)
    this.metronome.setVolume(this.metronomeVolume)
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
    window.addEventListener('click', this.closePopovers)
    window.addEventListener('mouseup', this.onWindowMouseUp)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleRecordingKeydown)
    window.removeEventListener('click', this.closePopovers)
    window.removeEventListener('mouseup', this.onWindowMouseUp)
    stopAllPianoNotes()
    this.metronome.dispose()
    this.screenRecorder.dispose()
    this.releaseChordPreview()
    this.disposeMidiPlayer()
    this.teardownMidi()
  },
  methods: {
    formatHarmonicTonicLabel,
    formatChordDictionaryLabel,
    formatChordQualityLabel,
    selectControlTab(tabId) {
      if (tabId === 'options') {
        this.$nextTick(() => {
          this.optionsPopoverOpen = true
          this.metronomePopoverOpen = false
        })
        return
      }

      this.controlsTab = tabId

      this.closePopovers()
    },
    toggleOptionsPopover() {
      this.optionsPopoverOpen = !this.optionsPopoverOpen
      if (this.optionsPopoverOpen) {
        this.metronomePopoverOpen = false
      }
    },
    toggleMetronomePopover() {
      this.metronomePopoverOpen = !this.metronomePopoverOpen
      if (this.metronomePopoverOpen) {
        this.optionsPopoverOpen = false
      }
    },
    closePopovers() {
      this.optionsPopoverOpen = false
      this.metronomePopoverOpen = false
    },
    setAccidentalNotation(notation) {
      this.accidentalNotation = notation
    },
    getChordDictionaryPreviewMidis() {
      const notes = [
        ...this.chordDictBassNotes,
        ...this.chordDictTrebleNotes,
      ]

      return [...new Set(
        notes
          .map((note) => noteToMidiNumber(note))
          .filter((midi) => midi !== null),
      )].sort((a, b) => a - b)
    },
    releaseChordPreview() {
      if (this.chordPreviewReleaseTimer) {
        clearTimeout(this.chordPreviewReleaseTimer)
        this.chordPreviewReleaseTimer = null
      }

      for (const midi of this.chordPreviewMidiNotes) {
        releasePianoNote(midi).catch((error) => {
          console.warn('Erro ao soltar áudio do acorde.', error)
        })
      }

      this.chordPreviewMidiNotes = []
    },
    playChordDictionaryChord() {
      const midiNotes = this.getChordDictionaryPreviewMidis()
      if (!midiNotes.length) return

      this.releaseChordPreview()
      this.chordPreviewMidiNotes = midiNotes

      Promise.all(
        midiNotes.map((midi) => playPianoNote(midi, 92)),
      ).catch((error) => {
        console.warn('Erro ao reproduzir áudio do acorde.', error)
      })

      this.chordPreviewReleaseTimer = window.setTimeout(() => {
        this.releaseChordPreview()
      }, 2800)
    },
    handleRecordingKeydown(event) {
      if (event.key === 'Escape' && this.optionsPopoverOpen) {
        this.closePopovers()
        return
      }

      if (event.key === 'Escape' && this.metronomePopoverOpen) {
        this.closePopovers()
        return
      }

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
    isHarmonicScaleNote(note) {
      if (!this.harmonicDisplayEnabled) return false

      return isNoteInPitchClassSet(note, this.harmonicField.scalePitchClasses)
    },
    isHarmonicChordNote(note) {
      if (!this.harmonicDisplayEnabled || !this.harmonicSelectedChord) {
        return false
      }

      return isNoteInPitchClassSet(
        note,
        this.harmonicSelectedChord.pitchClasses,
      )
    },
    isHarmonicTonicNote(note) {
      if (!this.harmonicDisplayEnabled) return false

      const tonicPitchClass = this.harmonicField.scalePitchClasses[0]

      return isNoteInPitchClassSet(note, [tonicPitchClass])
    },
    isChordDictTrebleNote(note) {
      if (this.controlsTab !== 'chordDictionary') return false

      return this.chordDictTrebleNoteSet.has(note)
    },
    isChordDictBassNote(note) {
      if (this.controlsTab !== 'chordDictionary') return false

      return this.chordDictBassNoteSet.has(note)
    },
    setChordDictRoot(root) {
      this.chordDictRoot = root
      this.chordDictInversion = 0
      this.chordDictBassRoot = root
      this.chordDictBassInversion = 0
      this.chordDictBassManual = false
    },
    setChordDictQuality(qualityId) {
      this.chordDictQualityId = qualityId
      this.chordDictInversion = 0

      if (!this.chordDictBassManual) {
        this.chordDictBassInversion = 0
      } else {
        const index = findChordBassInversionIndex(
          this.chordDictRoot,
          qualityId,
          this.chordDictBassManualRoot,
        )

        if (index >= 0) {
          this.chordDictBassManual = false
          this.chordDictBassInversion = index
          this.chordDictBassRoot = this.chordDictBassManualRoot
        }
      }
    },
    setChordDictBassRoot(bassRoot) {
      this.chordDictBassRoot = bassRoot

      const chordToneIndex = findChordBassInversionIndex(
        this.chordDictRoot,
        this.chordDictQualityId,
        bassRoot,
      )

      if (chordToneIndex >= 0) {
        this.chordDictBassManual = false
        this.chordDictBassInversion = chordToneIndex
        return
      }

      this.chordDictBassManual = true
      this.chordDictBassManualRoot = bassRoot
      this.chordDictBassInversion = 0
    },
    shiftChordDictInversion(delta) {
      const count = this.chordDictInversionCount

      if (count < 2) return

      this.chordDictInversion =
        (this.chordDictInversion + delta + count) % count
    },
    shiftChordDictBassInversion(delta) {
      const count = this.chordDictBassInversionCount

      if (count < 2) return

      this.chordDictBassInversion =
        (this.chordDictBassInversion + delta + count) % count

      if (!this.chordDictBassManual) {
        this.chordDictBassRoot = this.chordDictActiveBassRoot
      }
    },
    toggleHarmonicDisplay() {
      this.harmonicDisplayEnabled = !this.harmonicDisplayEnabled

      if (!this.harmonicDisplayEnabled) {
        this.harmonicSelectedChordId = null
      }
    },
    setHarmonicScaleType(scaleType) {
      this.harmonicScaleType = scaleType
      this.harmonicSelectedChordId = null
    },
    setHarmonicTonic(tonic) {
      this.harmonicTonic = tonic
      this.harmonicSelectedChordId = null
    },
    toggleHarmonicChord(chordId) {
      this.harmonicSelectedChordId =
        this.harmonicSelectedChordId === chordId ? null : chordId
    },
    keyLabel(note) {
      return this.keyLabelNotation === 'western'
        ? formatWestern(note, this.accidentalNotation)
        : formatSolfege(note, this.accidentalNotation)
    },
    applyDesignTheme() {
      if (typeof document === 'undefined') return

      document.documentElement.setAttribute('data-design-theme', this.designTheme)
    },
    setDesignTheme(theme) {
      if (isValidDesignTheme(theme)) {
        this.designTheme = theme
      }
    },
    onPianoVolumeChange(value) {
      this.pianoVolume = value
      setPianoVolume(value)
    },
    onMetronomeVolumeChange(value) {
      this.metronomeVolume = value
      this.metronome.setVolume(value)
    },
    changeViewZoom(delta) {
      const next =
        Math.round((this.viewZoom + delta) * 100) / 100

      this.viewZoom = Math.max(
        VIEW_ZOOM_MIN,
        Math.min(VIEW_ZOOM_MAX, next),
      )
    },
    resetViewZoom() {
      this.viewZoom = VIEW_ZOOM_DEFAULT
    },
    toggleShowKeyLabels() {
      this.showKeyLabels = !this.showKeyLabels
    },
    setKeyLabelNotation(notation) {
      if (notation === 'western' || notation === 'solfege') {
        this.keyLabelNotation = notation
      }
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
    changeMetronomeBpm(delta) {
      this.applyMetronomeBpm(this.metronomeBpm + delta)
    },
    applyMetronomeBpm(value) {
      this.metronomeBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)))
      this.metronome.setBpm(this.metronomeBpm)
    },
    applyLoadedMidiBpm(bpm) {
      const clampedBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(bpm)))
      this.midiRecordedBpm = clampedBpm
      this.playbackBpm = clampedBpm
      this.applyMetronomeBpm(clampedBpm)

      if (this.midiPlayer) {
        this.midiPlayer.setPlaybackRate(1)
      }
    },
    setMetronomeTimeSignature(signature) {
      this.metronomeTimeSignature = signature
      this.metronome.setTimeSignature(signature)
    },
    async loadMidiDemo() {
      if (this.midiDemoLoading) return

      this.midiDemoLoading = true

      try {
        const response = await fetch(`${import.meta.env.BASE_URL}demos/bohemian-rhapsody.mid`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const blob = await response.blob()
        const file = new File([blob], 'Queen - Bohemian Rhapsody.mid', {
          type: 'audio/midi',
        })

        await this.onMidiFileSelected(file)
      } catch (error) {
        console.warn('Não foi possível carregar a demonstração MIDI.', error)
        showToast({
          message: 'Não foi possível carregar a demonstração. Tente novamente.',
          type: 'error',
        })
      } finally {
        this.midiDemoLoading = false
      }
    },
    async onMidiFileSelected(file) {
      if (!file) return

      try {
        const buffer = await file.arrayBuffer()
        const parsed = parseMidiFile(buffer)

        this.stopPlayback()
        this.disposeMidiPlayer()
        this.midiParsedEvents = parsed.events
        this.pianoRollNotes = buildPianoRollNotes(parsed.events)
        this.midiDurationMs = parsed.durationMs
        this.midiFileName = file.name
        this.playbackPositionMs = 0
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
        this.applyLoadedMidiBpm(parsed.initialBpm)
        this.playbackStatus = 'ready'
      } catch (error) {
        console.warn('Não foi possível ler o arquivo MIDI.', error)
        showToast({
          message: 'Não foi possível carregar o arquivo MIDI. Verifique se o arquivo é válido.',
          type: 'error',
        })
        this.clearMidiFile()
      }
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
      this.playbackPositionMs = 0
      this.playbackStatus = 'idle'
    },
    removeMidiFile() {
      this.clearMidiFile()
    },
    disposeMidiPlayer() {
      if (this.midiPlayer) {
        this.midiPlayer.dispose()
        this.midiPlayer = null
      }
    },
    async togglePlaybackPlayPause() {
      if (!this.midiPlayer || !this.midiPlaybackReady) return

      if (this.playbackStatus === 'playing') {
        this.midiPlayer.pause()
        this.playbackStatus = 'paused'
        return
      }

      if (this.playbackStatus === 'paused') {
        try {
          await resumePianoAudioContext()
          this.playbackStatus = 'playing'
          this.midiPlayer.resume()
        } catch (error) {
          console.warn('Não foi possível retomar a reprodução do MIDI.', error)
          showToast({
            message: 'Não foi possível retomar a reprodução do MIDI.',
            type: 'error',
          })
        }
        return
      }

      await this.startPlayback()
    },
    async startPlayback() {
      if (!this.midiPlayer) return

      try {
        await resumePianoAudioContext()
        this.playbackAudioErrorNotified = false
        this.resetPlaybackVisuals()
        stopAllPianoNotes()
        this.playbackStatus = 'playing'
        this.midiPlayer.play(0)
      } catch (error) {
        console.warn('Não foi possível iniciar a reprodução do MIDI.', error)
        this.playbackStatus = 'ready'
        showToast({
          message: 'Não foi possível iniciar a reprodução do MIDI.',
          type: 'error',
        })
      }
    },
    reportPlaybackAudioError() {
      if (this.playbackAudioErrorNotified) return

      this.playbackAudioErrorNotified = true
      showToast({
        message: 'Ocorreu um erro ao reproduzir o áudio do MIDI.',
        type: 'error',
      })
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

        if (this.playbackStatus === 'playing' || this.playbackStatus === 'paused') {
          this.reportPlaybackAudioError()
        }
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

        if (this.playbackStatus === 'playing' || this.playbackStatus === 'paused') {
          this.reportPlaybackAudioError()
        }
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

      this.midiRecorder.start({ bpm: this.metronome.getBpm() })
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

        showToast({
          message: 'Não foi possível iniciar a gravação de tela.',
          type: 'error',
        })
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
          showToast({
            message: 'A gravação de tela ficou vazia e não pôde ser salva.',
            type: 'warning',
          })
          console.warn('Gravação de tela vazia.')
          return
        }

        const filename = formatScreenRecordingFilename(new Date(), blob.type)
        const result = await saveScreenRecording(blob, filename)

        if (result.cancelled) {
          console.warn('Salvamento do vídeo cancelado.')
        }
      } catch (error) {
        showToast({
          message: 'Não foi possível salvar a gravação de tela.',
          type: 'error',
        })
        console.warn('Não foi possível salvar a gravação de tela.', error)
        this.screenRecorder.cancel()
      }
    },
    async stopRecording() {
      this.isRecording = false
      const events = this.midiRecorder.stop()

      if (events.length === 0) {
        showToast({
          message: 'Nenhuma nota ou pedal foi gravado.',
          type: 'warning',
        })
        console.warn('Gravação vazia: nenhuma nota ou pedal foi registrado.')
        return
      }

      const blob = createMidiBlob(events, {
        tempo: bpmToTempo(this.metronome.getBpm()),
      })
      const filename = `pianoapp-${formatRecordingFilename()}`

      try {
        const result = await saveMidiFile(blob, filename)

        if (result.cancelled) {
          console.warn('Salvamento do MIDI cancelado.')
        }
      } catch (error) {
        showToast({
          message: 'Não foi possível salvar a gravação MIDI.',
          type: 'error',
        })
        console.warn('Não foi possível salvar o arquivo MIDI.', error)
      }
    },
    updateMidiConnectionStatus(inputCount) {
      this.midiConnectionStatus = inputCount > 0 ? 'connected' : 'disconnected'
    },
    async initMidi() {
      if (!isMidiSupported()) {
        this.midiConnectionStatus = 'unsupported'
        return
      }

      try {
        const access = await requestMidiAccess()

        if (!access) {
          this.midiConnectionStatus = 'unavailable'
          return
        }

        this.midiBinder = bindMidiInputs(access, {
          onNoteOn: this.handleMidiNoteOn.bind(this),
          onNoteOff: this.handleMidiNoteOff.bind(this),
          onControlChange: this.handleMidiControlChange.bind(this),
          onInputsChange: (inputCount) => {
            this.updateMidiConnectionStatus(inputCount)
          },
        })
      } catch (error) {
        this.midiConnectionStatus = 'unavailable'
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
  padding: 0;
  box-sizing: border-box;
  min-height: 0;
}

.piano-wrapper :deep(.recorder-section--top-nav-layout) {
  border-top: none;
  border-radius: 0 0 20px 20px;
}

.piano-wrapper :deep(.recorder-section--piano-roll-layout .recorder-section__main) {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.piano-wrapper :deep(.recorder-section--piano-roll-layout .recorder-section__body) {
  flex: none;
  min-height: auto;
  overflow: visible;
  padding-bottom: 10px;
}

.piano-wrapper :deep(.recorder-section--piano-roll-layout .recorder-section__progress) {
  margin-top: 10px;
  padding-top: 10px;
}

.piano-stage {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 20px;
  padding: 0 20px 20px;
  box-sizing: border-box;
}

.piano-stage--with-roll {
  flex: none;
  min-height: 0;
  height: 100%;
  gap: 12px;
  justify-content: flex-start;
  padding-top: 0;
  overflow: hidden;
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
  overflow: hidden;
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

.piano-key__harmonic-marker {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 1;
}

.piano-key__harmonic-marker--scale {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4b5563;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.55);
}

.piano-key__harmonic-marker--tonic {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 9px solid #4b5563;
  filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.55));
}

.piano-key--white:has(.piano-key__label) .piano-key__harmonic-marker {
  bottom: 22px;
}

.piano-key--black .piano-key__harmonic-marker {
  bottom: 6px;
}

.piano-key--black .piano-key__harmonic-marker--scale {
  background: #d1d5db;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.piano-key--black .piano-key__harmonic-marker--tonic {
  border-bottom-color: #d1d5db;
}

.piano-key--harmonic-chord .piano-key__harmonic-marker--scale {
  background: #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}

.piano-key--harmonic-chord .piano-key__harmonic-marker--tonic {
  border-bottom-color: #fff;
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.35));
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
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 3px 3px;
  background: linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%);
}

.piano-key--white.piano-key--pressed,
.piano-key--white:active {
  background: #2563eb !important;
  border-color: #1d4ed8 !important;
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
  background: #2563eb !important;
  border-color: #1d4ed8 !important;
}

.piano-key--black.piano-key--sustained:not(:active) {
  background: #60a5fa !important;
  border-color: #93c5fd !important;
}

.piano-key--white.piano-key--harmonic-chord:not(.piano-key--pressed):not(:active) {
  background: #f87171 !important;
  border-color: #ef4444 !important;
}

.piano-key--black.piano-key--harmonic-chord:not(.piano-key--pressed):not(:active) {
  background: #dc2626 !important;
  border-color: #f87171 !important;
}

.piano-key--white.piano-key--harmonic-chord .piano-key__label {
  color: #991b1b;
}

.piano-key--black.piano-key--harmonic-chord .piano-key__label {
  color: #fecaca;
}

.piano-key--white.piano-key--chord-dict:not(.piano-key--pressed):not(:active) {
  background: #fca5a5 !important;
  border-color: #ef4444 !important;
}

.piano-key--black.piano-key--chord-dict:not(.piano-key--pressed):not(:active) {
  background: #dc2626 !important;
  border-color: #f87171 !important;
}

.piano-key--white.piano-key--chord-dict .piano-key__label {
  color: #991b1b;
}

.piano-key--black.piano-key--chord-dict .piano-key__label {
  color: #fecaca;
}

.piano-key--white.piano-key--chord-dict-bass:not(.piano-key--pressed):not(:active) {
  background: #93c5fd !important;
  border-color: #3b82f6 !important;
}

.piano-key--black.piano-key--chord-dict-bass:not(.piano-key--pressed):not(:active) {
  background: #2563eb !important;
  border-color: #60a5fa !important;
}

.piano-key--white.piano-key--chord-dict-bass .piano-key__label {
  color: #1e3a8a;
}

.piano-key--black.piano-key--chord-dict-bass .piano-key__label {
  color: #dbeafe;
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
  color: var(--app-text);
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
  fill: #6fa878;
  stroke: #3f7d4a;
}
</style>
