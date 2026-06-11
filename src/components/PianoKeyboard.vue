<template>
  <div class="piano-wrapper" :style="viewZoomStyle">
    <section
      class="recorder-section recorder-section--sidebar-layout"
      :class="{
        'recorder-section--rhythmic-tab': controlsTab === 'rhythmicFigures',
        'recorder-section--nav-compact': sidebarNavCompact,
        'recorder-section--piano-roll-layout': midiPlaybackReady,
      }"
      aria-label="Controles da performance"
    >
      <nav class="recorder-section__nav" aria-label="Seções de controles">
        <AppTooltip :text="sidebarNavToggleTooltip" placement="right">
          <button
            type="button"
            class="recorder-section__nav-toggle"
            :aria-label="sidebarNavToggleTooltip"
            :aria-pressed="sidebarNavCompact"
            @click="toggleSidebarNavCompact"
          >
            <svg
              class="recorder-section__nav-toggle-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <template v-if="sidebarNavCompact">
                <path d="M16 6l-3.5 6 3.5 6" />
                <path d="M11 6l-3.5 6 3.5 6" />
              </template>
              <template v-else>
                <path d="M8 6l3.5 6L8 18" />
                <path d="M13 6l3.5 6L13 18" />
              </template>
            </svg>
          </button>
        </AppTooltip>

        <div class="recorder-section__tabs" role="tablist">
          <div class="recorder-section__tabs-main">
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
              @click="controlsTab = tab.id"
            >
              <ControlTabIcon :name="tab.icon" />
              <span class="recorder-section__tab-label">{{ tab.label }}</span>
            </button>
          </div>

          <div class="recorder-section__tabs-footer">
            <div class="recorder-section__nav-separator" aria-hidden="true" />
            <button
              :id="controlOptionsTab.idAttr"
              type="button"
              role="tab"
              class="recorder-section__tab"
              :class="{ 'recorder-section__tab--active': controlsTab === controlOptionsTab.id }"
              :aria-selected="controlsTab === controlOptionsTab.id"
              :aria-controls="controlOptionsTab.panelId"
              :aria-label="controlOptionsTab.label"
              @click="controlsTab = controlOptionsTab.id"
            >
              <ControlTabIcon :name="controlOptionsTab.icon" />
              <span class="recorder-section__tab-label">{{ controlOptionsTab.label }}</span>
            </button>
          </div>
        </div>
      </nav>

      <div class="recorder-section__nav-divider" aria-hidden="true" />

      <div class="recorder-section__main">
      <div class="recorder-section__body">
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
          @file-selected="onMidiFileSelected"
          @remove-file="removeMidiFile"
          @toggle-play-pause="togglePlaybackPlayPause"
          @stop="stopPlayback"
          @change-playback-bpm="changePlaybackBpm"
          @update:playback-bpm="applyPlaybackBpm"
          @reset-playback-bpm="resetPlaybackBpm"
          @seek="seekPlaybackFromEvent"
        />

        <OptionsTabPanel
          v-show="controlsTab === 'options'"
          :show-key-labels="showKeyLabels"
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
          @update:design-theme="setDesignTheme"
          @update:key-label-notation="setKeyLabelNotation"
          @update:accidental-notation="setAccidentalNotation"
          @change-keyboard-height="changeKeyboardHeight"
          @change-view-zoom="changeViewZoom"
          @reset-view-zoom="resetViewZoom"
          @update:piano-volume="onPianoVolumeChange"
          @update:metronome-volume="onMetronomeVolumeChange"
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
          :accidental-notations="accidentalNotations"
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
          :show-key-labels="showKeyLabels"
          @update:accidental-notation="setAccidentalNotation"
          @toggle-show-key-labels="toggleShowKeyLabels"
          @set-chord-dict-root="setChordDictRoot"
          @set-chord-dict-quality="setChordDictQuality"
          @set-chord-dict-bass-root="setChordDictBassRoot"
          @shift-chord-dict-inversion="shiftChordDictInversion"
          @shift-chord-dict-bass-inversion="shiftChordDictBassInversion"
        />

        <RhythmicFiguresTabPanel v-show="controlsTab === 'rhythmicFigures'" />
      </div>

      <div
        v-if="showMidiDisconnectedAlert"
        class="midi-alert"
        role="alert"
      >
        <button
          type="button"
          class="midi-alert__close"
          aria-label="Fechar aviso de MIDI"
          @click="dismissMidiAlert"
        >
          <svg
            class="midi-alert__close-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div class="midi-alert__content">
          <div class="midi-alert__icon" aria-hidden="true">
            <svg
              class="midi-alert__icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <h3 class="midi-alert__title">{{ midiAlertTitle }}</h3>
          <p class="midi-alert__message">{{ midiAlertMessage }}</p>
        </div>
      </div>

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
  loadOptionsPreferences,
  saveOptionsPreferences,
  VIEW_ZOOM_DEFAULT,
  VIEW_ZOOM_MAX,
  VIEW_ZOOM_MIN,
  VIEW_ZOOM_STEP,
  VOLUME_MAX,
  VOLUME_MIN,
} from '../utils/userPreferences.js'
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

const storedOptionsPreferences = loadOptionsPreferences(keyboardHeightBounds)

const CONTROL_TABS = [
  {
    id: 'recording',
    label: 'Gravação',
    icon: 'recording',
    idAttr: 'controls-tab-recording',
    panelId: 'controls-panel-recording',
  },
  {
    id: 'playback',
    label: 'Reprodução',
    icon: 'playback',
    idAttr: 'controls-tab-playback',
    panelId: 'controls-panel-playback',
  },
  {
    id: 'harmonic',
    label: 'Campos harmônicos',
    icon: 'harmonic',
    idAttr: 'controls-tab-harmonic',
    panelId: 'controls-panel-harmonic',
  },
  {
    id: 'chordDictionary',
    label: 'Dicionário de acordes',
    icon: 'chord-dictionary',
    idAttr: 'controls-tab-chord-dictionary',
    panelId: 'controls-panel-chord-dictionary',
  },
  {
    id: 'rhythmicFigures',
    label: 'Figuras rítmicas',
    icon: 'rhythmic-figures',
    idAttr: 'controls-tab-rhythmic-figures',
    panelId: 'controls-panel-rhythmic-figures',
  },
]

const CONTROL_OPTIONS_TAB = {
  id: 'options',
  label: 'Opções',
  icon: 'options',
  idAttr: 'controls-tab-options',
  panelId: 'controls-panel-options',
}

export default {
  name: 'PianoKeyboard',
  components: {
    AppTooltip,
    ControlTabIcon,
    PianoRoll,
    RecordingTabPanel,
    PlaybackTabPanel,
    OptionsTabPanel,
    HarmonicTabPanel,
    ChordDictionaryTabPanel,
    RhythmicFiguresTabPanel,
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
      midiAlertDismissed: false,
      isRecording: false,
      midiRecorder: createMidiRecorder(),
      showKeyLabels: storedOptionsPreferences.showKeyLabels,
      keyLabelNotation: storedOptionsPreferences.keyLabelNotation,
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
      playbackStatus: 'idle',
      playbackActive: {},
      playbackSustained: {},
      playbackSustainPedalDown: false,
      midiDurationMs: 0,
      playbackPositionMs: 0,
      midiRecordedBpm: 120,
      playbackBpm: 120,
      playbackAudioErrorNotified: false,
      controlsTab: 'recording',
      controlOptionsTab: CONTROL_OPTIONS_TAB,
      sidebarNavCompact: storedOptionsPreferences.sidebarNavCompact,
      designThemes: DESIGN_THEMES,
      designTheme: storedOptionsPreferences.designTheme,
      keyboardHeight: storedOptionsPreferences.keyboardHeight,
      keyboardHeightStep: KEYBOARD_HEIGHT_STEP,
      viewZoom: storedOptionsPreferences.viewZoom,
      viewZoomStep: VIEW_ZOOM_STEP,
      viewZoomDefault: VIEW_ZOOM_DEFAULT,
      pianoVolume: storedOptionsPreferences.pianoVolume,
      metronomeVolume: storedOptionsPreferences.metronomeVolume,
      volumeMin: VOLUME_MIN,
      volumeMax: VOLUME_MAX,
      accidentalNotations: ACCIDENTAL_NOTATIONS,
      accidentalNotation: storedOptionsPreferences.accidentalNotation,
      screenRecorder: createScreenRecorder(),
      isScreenRecording: false,
      screenRecordingElapsedMs: 0,
      harmonicScaleTypes: HARMONIC_SCALE_TYPES,
      harmonicTonics: HARMONIC_TONICS,
      harmonicDisplayEnabled: false,
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
    }
  },
  computed: {
    controlMainTabs() {
      return CONTROL_TABS
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
    sidebarNavToggleTooltip() {
      return this.sidebarNavCompact
        ? 'Mostrar ícones e textos nas abas'
        : 'Mostrar apenas ícones nas abas'
    },
    showMidiDisconnectedAlert() {
      return (
        !this.midiAlertDismissed &&
        this.midiConnectionStatus !== 'connected' &&
        this.midiConnectionStatus !== 'pending'
      )
    },
    midiAlertTitle() {
      if (this.midiConnectionStatus === 'unsupported') {
        return 'MIDI não suportado'
      }

      if (this.midiConnectionStatus === 'unavailable') {
        return 'MIDI indisponível'
      }

      return 'MIDI não conectado'
    },
    midiAlertMessage() {
      if (this.midiConnectionStatus === 'unsupported') {
        return 'Use Chrome, Edge ou Opera para conectar um teclado MIDI ao aplicativo.'
      }

      if (this.midiConnectionStatus === 'unavailable') {
        return 'Não foi possível acessar o MIDI. Verifique as permissões do navegador.'
      }

      return 'Conecte um teclado ou controlador MIDI ao computador para tocar pelo dispositivo físico.'
    },
  },
  watch: {
    showKeyLabels() {
      this.persistOptionsPreferences()
    },
    keyLabelNotation() {
      this.persistOptionsPreferences()
    },
    keyboardHeight() {
      this.persistOptionsPreferences()
    },
    viewZoom() {
      this.persistOptionsPreferences()
    },
    pianoVolume() {
      this.persistOptionsPreferences()
    },
    metronomeVolume() {
      this.persistOptionsPreferences()
    },
    accidentalNotation() {
      this.persistOptionsPreferences()
    },
    sidebarNavCompact() {
      this.persistOptionsPreferences()
    },
    designTheme() {
      this.applyDesignTheme()
      this.persistOptionsPreferences()
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
    formatHarmonicTonicLabel,
    formatChordDictionaryLabel,
    formatChordQualityLabel,
    setAccidentalNotation(notation) {
      this.accidentalNotation = notation
    },
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
    persistOptionsPreferences() {
      saveOptionsPreferences({
        showKeyLabels: this.showKeyLabels,
        keyLabelNotation: this.keyLabelNotation,
        keyboardHeight: this.keyboardHeight,
        viewZoom: this.viewZoom,
        pianoVolume: this.pianoVolume,
        metronomeVolume: this.metronomeVolume,
        accidentalNotation: this.accidentalNotation,
        sidebarNavCompact: this.sidebarNavCompact,
        designTheme: this.designTheme,
      })
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
    toggleSidebarNavCompact() {
      this.sidebarNavCompact = !this.sidebarNavCompact
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
    dismissMidiAlert() {
      this.midiAlertDismissed = true
    },
    updateMidiConnectionStatus(inputCount) {
      const nextStatus = inputCount > 0 ? 'connected' : 'disconnected'

      if (this.midiConnectionStatus === 'connected' && nextStatus === 'disconnected') {
        this.midiAlertDismissed = false
      }

      this.midiConnectionStatus = nextStatus
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

.midi-alert {
  position: relative;
  margin: 0 22px 14px;
  padding: 22px 20px 20px;
  border-radius: 16px;
  border: 1px solid rgba(251, 191, 36, 0.28);
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
}

.midi-alert__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 26rem;
  margin: 0 auto;
  text-align: center;
}

.midi-alert__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 2px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.12);
  color: var(--app-accent);
  box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.18);
}

.midi-alert__icon-svg {
  width: 1.75rem;
  height: 1.75rem;
}

.midi-alert__title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--app-heading);
}

.midi-alert__message {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--app-subtitle);
}

.midi-alert__close {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--app-text-muted);
  cursor: pointer;
  transition:
    color 0.12s ease,
    background-color 0.12s ease,
    box-shadow 0.12s ease;
}

.midi-alert__close-icon {
  width: 1rem;
  height: 1rem;
}

.midi-alert__close:hover {
  color: var(--app-accent);
  background: var(--app-hover-bg);
  box-shadow: var(--neu-raised-sm);
}

.midi-alert__close:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.piano-wrapper :deep(.recorder-section--sidebar-layout) {
  border-radius: 0 0 20px 0;
  border-left: none;
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
  background: #ea580c;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.55);
}

.piano-key__harmonic-marker--tonic {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 9px solid #ea580c;
  filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.55));
}

.piano-key--white:has(.piano-key__label) .piano-key__harmonic-marker {
  bottom: 22px;
}

.piano-key--black .piano-key__harmonic-marker {
  bottom: 6px;
}

.piano-key--black .piano-key__harmonic-marker--scale {
  background: #fb923c;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.piano-key--black .piano-key__harmonic-marker--tonic {
  border-bottom-color: #fb923c;
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
  fill: #86efac;
  stroke: #4ade80;
}
</style>
