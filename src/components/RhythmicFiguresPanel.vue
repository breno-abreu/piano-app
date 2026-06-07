<template>
  <div class="rhythmic-figures">
    <div class="rhythmic-figures__toolbar">
      <div class="rhythmic-figures__toolbar-group">
        <span class="rhythmic-figures__label">Compassos</span>
        <button
          type="button"
          class="rhythmic-figures__step"
          aria-label="Diminuir quantidade de compassos"
          :disabled="measureCount <= 1"
          @click="changeMeasureCount(-1)"
        >
          <span aria-hidden="true">−</span>
        </button>
        <span class="rhythmic-figures__value">{{ measureCount }}</span>
        <button
          type="button"
          class="rhythmic-figures__step"
          aria-label="Aumentar quantidade de compassos"
          :disabled="measureCount >= maxMeasures"
          @click="changeMeasureCount(1)"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <div class="rhythmic-figures__toolbar-group">
        <span class="rhythmic-figures__label">Andamento</span>
        <button
          type="button"
          class="rhythmic-figures__step"
          aria-label="Diminuir andamento"
          @click="changeBpm(-1)"
        >
          <span aria-hidden="true">−</span>
        </button>
        <button
          v-if="!bpmEditing"
          type="button"
          class="rhythmic-figures__value rhythmic-figures__value--button"
          aria-label="Editar andamento em BPM"
          @click="startBpmEdit"
        >
          {{ bpm }} BPM
        </button>
        <span v-else class="rhythmic-figures__bpm-edit">
          <input
            ref="bpmInput"
            v-model="bpmDraft"
            type="text"
            inputmode="numeric"
            class="rhythmic-figures__bpm-input"
            aria-label="Andamento em BPM"
            @keydown.enter.prevent="commitBpm"
            @keydown.esc.prevent="cancelBpmEdit"
            @blur="commitBpm"
          />
          <span class="rhythmic-figures__bpm-suffix">BPM</span>
        </span>
        <button
          type="button"
          class="rhythmic-figures__step"
          aria-label="Aumentar andamento"
          @click="changeBpm(1)"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <div class="rhythmic-figures__toolbar-group">
        <span class="rhythmic-figures__label">Compasso</span>
        <button
          v-for="signature in timeSignatures"
          :key="signature"
          type="button"
          class="rhythmic-figures__pill"
          :class="{ 'rhythmic-figures__pill--active': timeSignature === signature }"
          :aria-pressed="timeSignature === signature"
        >
          {{ signature }}
        </button>
      </div>

      <div class="rhythmic-figures__toolbar-group rhythmic-figures__toolbar-group--playback">
        <button
          type="button"
          class="rhythmic-figures__playback-btn"
          :class="{ 'rhythmic-figures__playback-btn--active': playbackRunning }"
          :aria-label="playbackRunning ? 'Parar sequência rítmica' : 'Reproduzir sequência rítmica'"
          @click="togglePlayback"
        >
          <span
            v-if="!playbackRunning"
            class="rhythmic-figures__play-icon"
            aria-hidden="true"
          />
          <span
            v-else
            class="rhythmic-figures__stop-icon"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <div class="rhythmic-figures__staff" role="region" aria-label="Pauta rítmica">
      <div
        class="rhythmic-figures__measures"
        :class="`rhythmic-figures__measures--count-${measureCount}`"
      >
        <div
          v-for="(measure, measureIndex) in score"
          :key="`measure-${measureIndex}`"
          class="rhythmic-figures__measure"
        >
          <span class="rhythmic-figures__measure-number">{{ measureIndex + 1 }}</span>
          <div class="rhythmic-figures__beats">
            <div
              v-for="(slot, beatIndex) in measure"
              v-if="!isBeatContinuation(measureIndex, beatIndex)"
              :key="`beat-${measureIndex}-${beatIndex}`"
              class="rhythmic-figures__beat"
              :class="beatCellClass(measureIndex, beatIndex)"
              :style="beatCellStyle(measureIndex, beatIndex)"
              :aria-label="beatAriaLabel(measureIndex, beatIndex)"
              @dragover.prevent="onBeatDragOver(measureIndex, beatIndex)"
              @dragleave="onBeatDragLeave"
              @drop.prevent="onBeatDrop(measureIndex, beatIndex, $event)"
            >
              <button
                v-if="isBeatStart(measureIndex, beatIndex)"
                type="button"
                class="rhythmic-figures__placed"
                :aria-label="`Remover ${placedFigureLabel(measureIndex, beatIndex)}`"
                @click="removeAt(measureIndex, beatIndex)"
              >
                <img
                  class="rhythmic-figures__figure-img rhythmic-figures__figure-img--placed"
                  :src="placedFigureImage(measureIndex, beatIndex)"
                  alt=""
                  draggable="false"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rhythmic-figures__palette" role="list" aria-label="Figuras rítmicas">
      <button
        v-for="figure in figures"
        :key="figure.id"
        type="button"
        class="rhythmic-figures__palette-item"
        role="listitem"
        draggable="true"
        :aria-label="`Arrastar ${figure.label}`"
        @dragstart="onPaletteDragStart(figure.id, $event)"
        @dragend="onPaletteDragEnd"
      >
        <span class="rhythmic-figures__palette-surface">
          <span class="rhythmic-figures__palette-icon">
            <img
              class="rhythmic-figures__figure-img"
              :src="figure.image"
              :alt="figure.label"
              draggable="false"
            />
          </span>
          <span class="rhythmic-figures__palette-label">{{ figure.label }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import {
  RHYTHMIC_FIGURES,
  RHYTHMIC_MAX_MEASURES,
  RHYTHMIC_TIME_SIGNATURES,
  RHYTHMIC_DEFAULT_BPM,
  clampRhythmicBpm,
  createEmptyRhythmicScore,
  getRhythmicBeatsPerBar,
  getRhythmicFigure,
  getRhythmicPlacementAt,
  placeRhythmicFigure,
  removeRhythmicFigure,
  trimRhythmicScore,
} from '../utils/rhythmicFigures.js'
import { createRhythmicPlayer } from '../utils/rhythmicPlayer.js'

export default {
  name: 'RhythmicFiguresPanel',
  data() {
    return {
      figures: RHYTHMIC_FIGURES,
      maxMeasures: RHYTHMIC_MAX_MEASURES,
      timeSignatures: RHYTHMIC_TIME_SIGNATURES,
      measureCount: 4,
      timeSignature: '4/4',
      bpm: RHYTHMIC_DEFAULT_BPM,
      bpmEditing: false,
      bpmDraft: '',
      score: createEmptyRhythmicScore(4, 4),
      draggedFigureId: null,
      dragOverTarget: null,
      rhythmicPlayer: createRhythmicPlayer(),
      playbackRunning: false,
      playbackPhase: 'idle',
      activeMeasureIndex: null,
      activeBeatIndex: null,
    }
  },
  computed: {
    beatsPerBar() {
      return getRhythmicBeatsPerBar(this.timeSignature)
    },
  },
  beforeUnmount() {
    this.rhythmicPlayer.dispose()
  },
  methods: {
    stopPlayback() {
      this.rhythmicPlayer.stop()
      this.playbackRunning = false
      this.playbackPhase = 'idle'
      this.activeMeasureIndex = null
      this.activeBeatIndex = null
    },
    async togglePlayback() {
      if (this.playbackRunning) {
        this.stopPlayback()
        return
      }

      this.rhythmicPlayer.setBpm(this.bpm)
      this.rhythmicPlayer.setOnStep((measureIndex, beatIndex, phase) => {
        this.playbackPhase = phase ?? 'sequence'

        if (phase === 'count-in') {
          this.activeMeasureIndex = 0
          this.activeBeatIndex = beatIndex
          return
        }

        if (phase === 'sequence') {
          this.activeMeasureIndex = measureIndex
          this.activeBeatIndex = beatIndex
          return
        }

        this.activeMeasureIndex = null
        this.activeBeatIndex = null
      })

      await this.rhythmicPlayer.start(
        this.score,
        this.measureCount,
        this.beatsPerBar,
      )

      if (this.rhythmicPlayer.isRunning()) {
        this.playbackRunning = true
      }
    },
    changeMeasureCount(delta) {
      this.stopPlayback()
      const nextCount = Math.min(
        this.maxMeasures,
        Math.max(1, this.measureCount + delta),
      )
      this.measureCount = nextCount
      this.score = trimRhythmicScore(this.score, nextCount, this.beatsPerBar)
    },
    changeBpm(delta) {
      this.bpm = clampRhythmicBpm(this.bpm + delta)
      if (this.playbackRunning) {
        this.stopPlayback()
      }
    },
    startBpmEdit() {
      this.bpmEditing = true
      this.bpmDraft = String(this.bpm)
      this.$nextTick(() => {
        this.$refs.bpmInput?.focus()
        this.$refs.bpmInput?.select()
      })
    },
    commitBpm() {
      if (!this.bpmEditing) return
      this.bpm = clampRhythmicBpm(this.bpmDraft)
      this.bpmEditing = false
      this.bpmDraft = ''
      if (this.playbackRunning) {
        this.stopPlayback()
      }
    },
    cancelBpmEdit() {
      this.bpmEditing = false
      this.bpmDraft = ''
    },
    onPaletteDragStart(figureId, event) {
      this.draggedFigureId = figureId
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setData('text/plain', figureId)
    },
    onPaletteDragEnd() {
      this.draggedFigureId = null
      this.dragOverTarget = null
    },
    onBeatDragOver(measureIndex, beatIndex) {
      this.dragOverTarget = { measureIndex, beatIndex }
    },
    onBeatDragLeave() {
      this.dragOverTarget = null
    },
    onBeatDrop(measureIndex, beatIndex, event) {
      const figureId = event.dataTransfer.getData('text/plain') || this.draggedFigureId
      this.draggedFigureId = null
      this.dragOverTarget = null
      if (!figureId) return

      this.stopPlayback()
      this.score = placeRhythmicFigure(
        this.score,
        measureIndex,
        beatIndex,
        figureId,
      )
    },
    removeAt(measureIndex, beatIndex) {
      this.stopPlayback()
      this.score = removeRhythmicFigure(this.score, measureIndex, beatIndex)
    },
    placementAt(measureIndex, beatIndex) {
      return getRhythmicPlacementAt(this.score, measureIndex, beatIndex)
    },
    isBeatStart(measureIndex, beatIndex) {
      const placement = this.placementAt(measureIndex, beatIndex)
      return Boolean(placement && !placement.isContinuation)
    },
    isBeatContinuation(measureIndex, beatIndex) {
      const placement = this.placementAt(measureIndex, beatIndex)
      return Boolean(placement?.isContinuation)
    },
    beatCellClass(measureIndex, beatIndex) {
      const placement = this.placementAt(measureIndex, beatIndex)
      const isDragOver =
        this.dragOverTarget?.measureIndex === measureIndex
        && this.dragOverTarget?.beatIndex === beatIndex

      const isCountInPlaying =
        this.playbackPhase === 'count-in'
        && measureIndex === 0
        && this.activeBeatIndex === beatIndex

      const isPlaying =
        this.playbackPhase === 'sequence'
        && this.activeMeasureIndex === measureIndex
        && this.activeBeatIndex === beatIndex

      return {
        'rhythmic-figures__beat--occupied': Boolean(placement),
        'rhythmic-figures__beat--drag-over': isDragOver,
        'rhythmic-figures__beat--count-in': isCountInPlaying,
        'rhythmic-figures__beat--playing': isPlaying,
      }
    },
    beatCellStyle(measureIndex, beatIndex) {
      const placement = this.placementAt(measureIndex, beatIndex)
      if (!placement || placement.isContinuation) return null

      const figure = getRhythmicFigure(placement.figureId)
      if (!figure || figure.beats <= 1) return null

      return {
        gridColumn: `span ${figure.beats}`,
      }
    },
    placedFigureImage(measureIndex, beatIndex) {
      const placement = this.placementAt(measureIndex, beatIndex)
      if (!placement) return null
      return getRhythmicFigure(placement.figureId)?.image ?? null
    },
    placedFigureLabel(measureIndex, beatIndex) {
      const placement = this.placementAt(measureIndex, beatIndex)
      if (!placement) return 'figura'
      return getRhythmicFigure(placement.figureId)?.label ?? 'figura'
    },
    beatAriaLabel(measureIndex, beatIndex) {
      const placement = this.placementAt(measureIndex, beatIndex)
      if (!placement) {
        return `Compasso ${measureIndex + 1}, tempo ${beatIndex + 1}, vazio`
      }
      const figure = getRhythmicFigure(placement.figureId)
      if (placement.isContinuation) {
        return `Compasso ${measureIndex + 1}, tempo ${beatIndex + 1}, ocupado`
      }
      return `Compasso ${measureIndex + 1}, tempo ${beatIndex + 1}, ${figure?.label ?? 'figura'}`
    },
  },
}
</script>

<style scoped>
.rhythmic-figures {
  --rhythm-surface: #25252d;
  --rhythm-paper-border: rgba(255, 255, 255, 0.06);
  --rhythm-paper-shadow:
    0 1px 2px rgba(0, 0, 0, 0.24),
    0 4px 10px rgba(0, 0, 0, 0.18);
  --rhythm-paper-shadow-hover:
    0 2px 4px rgba(0, 0, 0, 0.26),
    0 6px 14px rgba(0, 0, 0, 0.2);
  --rhythm-paper-shadow-pressed:
    0 1px 2px rgba(0, 0, 0, 0.3);
  --rhythm-paper-shadow-lifted:
    0 6px 14px rgba(0, 0, 0, 0.28),
    0 16px 32px rgba(0, 0, 0, 0.34);

  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  overflow: visible;
}

.rhythmic-figures__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
}

.rhythmic-figures__toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rhythmic-figures__toolbar-group--playback {
  gap: 10px;
}

.rhythmic-figures__label {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(243, 244, 246, 0.65);
}

.rhythmic-figures__step,
.rhythmic-figures__pill,
.rhythmic-figures__playback-btn {
  margin: 0;
  border: none;
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
  cursor: pointer;
  transition: box-shadow 0.12s ease, transform 0.12s ease;
}

.rhythmic-figures__step {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: rgba(243, 244, 246, 0.9);
  font-size: 1.1rem;
  line-height: 1;
}

.rhythmic-figures__step:hover:not(:disabled),
.rhythmic-figures__pill:hover,
.rhythmic-figures__playback-btn:hover {
  box-shadow: var(--neu-raised);
}

.rhythmic-figures__step:active:not(:disabled),
.rhythmic-figures__pill:active,
.rhythmic-figures__playback-btn:active {
  box-shadow: var(--neu-pressed);
  transform: scale(0.97);
}

.rhythmic-figures__step:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.rhythmic-figures__value {
  min-width: 3rem;
  text-align: center;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(243, 244, 246, 0.92);
}

.rhythmic-figures__value--button {
  margin: 0;
  padding: 6px 12px;
  border: none;
  border-radius: 10px;
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
  cursor: pointer;
}

.rhythmic-figures__bpm-edit {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rhythmic-figures__bpm-input {
  width: 3.5rem;
  padding: 6px 8px;
  border: none;
  border-radius: 10px;
  background: var(--neu-surface);
  box-shadow: var(--neu-pressed);
  color: rgba(243, 244, 246, 0.92);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
}

.rhythmic-figures__bpm-suffix {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(243, 244, 246, 0.65);
}

.rhythmic-figures__pill {
  min-width: 52px;
  padding: 8px 14px;
  border-radius: 12px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(243, 244, 246, 0.75);
}

.rhythmic-figures__pill--active {
  color: #fbbf24;
  box-shadow: var(--neu-pressed-deep);
}

.rhythmic-figures__playback-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rhythmic-figures__playback-btn--active {
  box-shadow:
    var(--neu-pressed-deep),
    0 0 14px rgba(34, 197, 94, 0.25);
}

.rhythmic-figures__play-icon {
  width: 0;
  height: 0;
  margin-left: 3px;
  border-style: solid;
  border-width: 8px 0 8px 14px;
  border-color: transparent transparent transparent #22c55e;
  filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.45));
}

.rhythmic-figures__stop-icon {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  background: #f3f4f6;
}

.rhythmic-figures__staff {
  width: 100%;
  padding: 8px 4px;
}

.rhythmic-figures__measures {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  width: 100%;
}

.rhythmic-figures__measure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
  width: 100%;
}

.rhythmic-figures__measures--count-1 {
  justify-content: center;
}

.rhythmic-figures__measures--count-1 .rhythmic-figures__measure {
  flex: 0 1 280px;
  max-width: 320px;
}

.rhythmic-figures__measures--count-2 .rhythmic-figures__measure,
.rhythmic-figures__measures--count-3 .rhythmic-figures__measure,
.rhythmic-figures__measures--count-4 .rhythmic-figures__measure {
  flex: 1 1 0;
}

.rhythmic-figures__measure-number {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(243, 244, 246, 0.45);
}

.rhythmic-figures__beats {
  display: grid;
  grid-template-columns: repeat(4, minmax(42px, 1fr));
  align-items: stretch;
  gap: 6px;
  width: 100%;
  padding: 12px 10px;
  border-radius: 14px;
  background: var(--rhythm-surface);
  border: 1px solid var(--rhythm-paper-border);
  box-shadow: var(--rhythm-paper-shadow);
}

.rhythmic-figures__beat {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  border-radius: 10px;
  border: 1px dashed rgba(243, 244, 246, 0.14);
  background: rgba(0, 0, 0, 0.12);
  box-shadow: var(--rhythm-paper-shadow);
  transition:
    border-color 0.12s ease,
    background 0.12s ease,
    box-shadow 0.12s ease;
}

.rhythmic-figures__beat--drag-over {
  border-color: rgba(251, 191, 36, 0.75);
  background: rgba(251, 191, 36, 0.08);
}

.rhythmic-figures__beat--occupied {
  border-style: solid;
  border-color: rgba(243, 244, 246, 0.12);
}

.rhythmic-figures__beat--count-in {
  border-color: rgba(96, 165, 250, 0.9);
  background: rgba(96, 165, 250, 0.16);
  box-shadow:
    var(--rhythm-paper-shadow-hover),
    0 0 0 1px rgba(96, 165, 250, 0.28);
}

.rhythmic-figures__beat--playing {
  border-color: rgba(251, 191, 36, 0.9);
  background: rgba(251, 191, 36, 0.18);
  box-shadow:
    var(--rhythm-paper-shadow-hover),
    0 0 0 1px rgba(251, 191, 36, 0.28);
}

.rhythmic-figures__placed {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 4px;
  border: none;
  border-radius: 10px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.rhythmic-figures__placed:hover {
  background: rgba(239, 68, 68, 0.08);
}

.rhythmic-figures__placed:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.rhythmic-figures__figure-img {
  display: block;
  max-height: 36px;
  width: auto;
  margin: 0 auto;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
  user-select: none;
  filter: invert(1);
  mix-blend-mode: screen;
}

.rhythmic-figures__figure-img--placed {
  max-height: 40px;
}

.rhythmic-figures__palette {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 20px 4px 8px;
  border-top: 1px solid rgba(243, 244, 246, 0.08);
  overflow: visible;
}

.rhythmic-figures__palette-item {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: grab;
}

.rhythmic-figures__palette-surface {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 72px;
  min-height: 72px;
  padding: 10px 8px;
  border: 1px solid var(--rhythm-paper-border);
  border-radius: 12px;
  background: var(--rhythm-surface);
  box-shadow: var(--rhythm-paper-shadow);
  transform: translateX(-50%);
  transform-origin: bottom center;
  transition:
    width 0.22s ease,
    min-height 0.22s ease,
    padding 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

.rhythmic-figures__palette-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 44px;
}

.rhythmic-figures__palette-item:hover,
.rhythmic-figures__palette-item:focus-visible {
  z-index: 30;
}

.rhythmic-figures__palette-item:hover .rhythmic-figures__palette-surface,
.rhythmic-figures__palette-item:focus-visible .rhythmic-figures__palette-surface {
  transform: translateX(-50%) translateY(-16px);
  width: 132px;
  min-height: 100px;
  padding: 10px 10px 8px;
  box-shadow: var(--rhythm-paper-shadow-lifted);
}

.rhythmic-figures__palette-item:active {
  cursor: grabbing;
}

.rhythmic-figures__palette-item:active .rhythmic-figures__palette-surface {
  transform: translateX(-50%) translateY(-12px);
  box-shadow: var(--rhythm-paper-shadow-hover);
}

.rhythmic-figures__palette-item:focus-visible {
  outline: none;
}

.rhythmic-figures__palette-item:focus-visible .rhythmic-figures__palette-surface {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.rhythmic-figures__palette-label {
  max-height: 0;
  margin-top: 0;
  opacity: 0;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.25;
  text-align: center;
  color: rgba(243, 244, 246, 0.62);
  transition:
    max-height 0.22s ease,
    opacity 0.18s ease,
    margin-top 0.22s ease;
}

.rhythmic-figures__palette-item:hover .rhythmic-figures__palette-label,
.rhythmic-figures__palette-item:focus-visible .rhythmic-figures__palette-label {
  max-height: 2.5rem;
  margin-top: 6px;
  opacity: 1;
}
</style>
