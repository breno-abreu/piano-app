<template>
  <div class="rhythmic-figures">
    <Transition name="rhythmic-figures__count-overlay">
      <div
        v-if="countInOverlayVisible"
        class="rhythmic-figures__count-overlay"
        role="status"
        aria-live="polite"
      >
        <Transition name="rhythmic-figures__count-number" mode="out-in">
          <span
            :key="countInNumber"
            class="rhythmic-figures__count-number"
          >
            {{ countInNumber }}
          </span>
        </Transition>
      </div>
    </Transition>

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
        <div class="recorder-section__bpm">
          <button
            type="button"
            class="recorder-section__bpm-step"
            aria-label="Diminuir andamento"
            @click="changeBpm(-1)"
          >
            <span class="recorder-section__bpm-step-glyph" aria-hidden="true">−</span>
          </button>
          <button
            v-if="!bpmEditing"
            type="button"
            class="recorder-section__bpm-value"
            aria-label="Editar andamento em BPM"
            @click="startBpmEdit"
          >
            {{ bpm }} BPM
          </button>
          <span v-else class="recorder-section__bpm-edit">
            <input
              ref="bpmInput"
              v-model="bpmDraft"
              type="text"
              inputmode="numeric"
              class="recorder-section__bpm-input"
              aria-label="Andamento em BPM"
              @keydown.enter.prevent="commitBpm"
              @keydown.esc.prevent="cancelBpmEdit"
              @blur="commitBpm"
            />
            <span class="recorder-section__bpm-suffix">BPM</span>
          </span>
          <button
            type="button"
            class="recorder-section__bpm-step"
            aria-label="Aumentar andamento"
            @click="changeBpm(1)"
          >
            <span class="recorder-section__bpm-step-glyph" aria-hidden="true">+</span>
          </button>
        </div>
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
          @click="changeTimeSignature(signature)"
        >
          {{ signature }}
        </button>
      </div>

      <div class="rhythmic-figures__toolbar-group rhythmic-figures__toolbar-group--playback">
        <button
          type="button"
          class="rhythmic-figures__reset-btn"
          aria-label="Gerar frase rítmica aleatória"
          @click="generateRandomPhrase"
        >
          <ShuffleIcon class="rhythmic-figures__reset-icon" aria-hidden="true" />
          <span class="rhythmic-figures__reset-label">Gerar</span>
        </button>
        <button
          type="button"
          class="rhythmic-figures__reset-btn"
          :class="{ 'rhythmic-figures__reset-btn--active': randomSettingsOpen }"
          :aria-expanded="randomSettingsOpen"
          aria-controls="rhythmic-random-settings"
          aria-label="Configurar geração aleatória"
          @click="randomSettingsOpen = !randomSettingsOpen"
        >
          <SlidersHorizontalIcon class="rhythmic-figures__reset-icon" aria-hidden="true" />
          <span class="rhythmic-figures__reset-label">Configurar</span>
        </button>
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
        <button
          type="button"
          class="rhythmic-figures__reset-btn"
          aria-label="Limpar pauta rítmica"
          @click="resetScore"
        >
          <svg
            class="rhythmic-figures__reset-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span class="rhythmic-figures__reset-label">Limpar</span>
        </button>
      </div>
    </div>

    <section
      v-if="randomSettingsOpen"
      id="rhythmic-random-settings"
      class="rhythmic-figures__random-settings"
      aria-label="Configurações da geração aleatória"
    >
      <div class="rhythmic-figures__random-settings-header">
        <div>
          <h3 class="rhythmic-figures__random-settings-title">Figuras permitidas</h3>
          <p class="rhythmic-figures__random-settings-description">
            Escolha quais figuras podem aparecer ao gerar uma frase rítmica.
          </p>
        </div>
        <button
          type="button"
          class="rhythmic-figures__reset-btn rhythmic-figures__reset-btn--compact"
          @click="allowAllRandomFigures"
        >
          Todas
        </button>
      </div>

      <div class="rhythmic-figures__random-grid">
        <button
          v-for="figure in figures"
          :key="`random-${figure.id}`"
          type="button"
          class="rhythmic-figures__random-figure"
          :class="{ 'rhythmic-figures__random-figure--active': isRandomFigureAllowed(figure.id) }"
          :aria-pressed="isRandomFigureAllowed(figure.id)"
          @click="toggleRandomFigure(figure.id)"
        >
          <img
            class="rhythmic-figures__figure-img"
            :src="figure.image"
            :alt="figure.label"
            draggable="false"
          />
          <span>{{ figure.label }}</span>
        </button>
      </div>
    </section>

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
            <template
              v-for="(slot, beatIndex) in measure"
              :key="`beat-${measureIndex}-${beatIndex}`"
            >
              <div
                class="rhythmic-figures__beat"
                :class="beatCellClass(measureIndex, beatIndex)"
                :aria-label="beatAriaLabel(measureIndex, beatIndex)"
                @dragover.prevent="onBeatDragOver(measureIndex, beatIndex, $event)"
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
                <span
                  v-else-if="isBeatContinuation(measureIndex, beatIndex)"
                  class="rhythmic-figures__slot-icon rhythmic-figures__slot-icon--blocked"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8.5a4 4 0 0 1 8 0V11" />
                  </svg>
                </span>
                <span
                  v-else-if="isDragOverInvalid(measureIndex, beatIndex)"
                  class="rhythmic-figures__slot-icon rhythmic-figures__slot-icon--forbidden"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 16 16 8" />
                  </svg>
                </span>
                <span
                  v-else-if="isDragPreviewContinuation(measureIndex, beatIndex)"
                  class="rhythmic-figures__slot-icon rhythmic-figures__slot-icon--blocked rhythmic-figures__slot-icon--preview"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8.5a4 4 0 0 1 8 0V11" />
                  </svg>
                </span>
              </div>

              <button
                v-if="beatIndex < measure.length - 1"
                type="button"
                class="rhythmic-figures__tie"
                :class="tieButtonClass(measureIndex, beatIndex)"
                :disabled="!isTieInteractive(measureIndex, beatIndex)"
                :aria-label="tieAriaLabel(measureIndex, beatIndex)"
                :aria-pressed="hasTie(measureIndex, beatIndex)"
                @click="toggleTie(measureIndex, beatIndex)"
              >
                <svg
                  class="rhythmic-figures__tie-icon"
                  viewBox="0 0 32 14"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.25"
                  stroke-linecap="round"
                  aria-hidden="true"
                >
                  <path d="M2 11 C9 2, 23 2, 30 11" />
                </svg>
              </button>
            </template>
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
  Shuffle as ShuffleIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
} from '@lucide/vue'
import {
  RHYTHMIC_FIGURES,
  RHYTHMIC_MAX_MEASURES,
  RHYTHMIC_TIME_SIGNATURES,
  RHYTHMIC_DEFAULT_BPM,
  clampRhythmicBpm,
  canAddRhythmicTie,
  canPlaceRhythmicFigure,
  createEmptyRhythmicScore,
  createEmptyRhythmicTies,
  fillEmptyRhythmicSlotsWithRests,
  getRhythmicBeatsPerBar,
  getRhythmicFigure,
  getRhythmicPlacementAt,
  hasRhythmicTie,
  placeRhythmicFigure,
  removeRhythmicFigure,
  sanitizeRhythmicTies,
  toggleRhythmicTie,
  trimRhythmicScore,
  trimRhythmicTies,
} from '../utils/rhythmicFigures.js'
import { createRhythmicPlayer } from '../utils/rhythmicPlayer.js'

export default {
  name: 'RhythmicFiguresPanel',
  components: {
    ShuffleIcon,
    SlidersHorizontalIcon,
  },
  data() {
    return {
      figures: RHYTHMIC_FIGURES,
      allowedRandomFigureIds: RHYTHMIC_FIGURES.map((figure) => figure.id),
      randomSettingsOpen: false,
      maxMeasures: RHYTHMIC_MAX_MEASURES,
      timeSignatures: RHYTHMIC_TIME_SIGNATURES,
      measureCount: 4,
      timeSignature: '4/4',
      bpm: RHYTHMIC_DEFAULT_BPM,
      bpmEditing: false,
      bpmDraft: '',
      score: createEmptyRhythmicScore(4, 4),
      ties: createEmptyRhythmicTies(4, 4),
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
    countInOverlayVisible() {
      return (
        this.playbackRunning
        && this.playbackPhase === 'count-in'
        && this.activeBeatIndex !== null
      )
    },
    countInNumber() {
      return this.activeBeatIndex === null ? '' : this.activeBeatIndex + 1
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
    resetScore() {
      this.stopPlayback()
      this.score = createEmptyRhythmicScore(this.measureCount, this.beatsPerBar)
      this.ties = createEmptyRhythmicTies(this.measureCount, this.beatsPerBar)
      this.draggedFigureId = null
      this.dragOverTarget = null
    },
    generateRandomPhrase() {
      this.stopPlayback()

      let nextScore = createEmptyRhythmicScore(this.measureCount, this.beatsPerBar)
      const nextTies = createEmptyRhythmicTies(this.measureCount, this.beatsPerBar)
      const availableFigures = this.figures.filter((figure) => figure.beats <= this.beatsPerBar)

      for (let measureIndex = 0; measureIndex < this.measureCount; measureIndex += 1) {
        let beatIndex = 0

        while (beatIndex < this.beatsPerBar) {
          const remainingBeats = this.beatsPerBar - beatIndex
          const allowedFigures = availableFigures.filter((figure) =>
            this.allowedRandomFigureIds.includes(figure.id),
          )
          const candidatePool = allowedFigures.length ? allowedFigures : availableFigures
          const candidates = candidatePool.filter((figure) => figure.beats <= remainingBeats)
          const safeCandidates = candidates.length
            ? candidates
            : availableFigures.filter((figure) => figure.beats <= remainingBeats)
          const weightedCandidates = safeCandidates.flatMap((figure) => {
            if (figure.beats === 1 && figure.hits > 0) return [figure, figure, figure]
            if (figure.hits > 0) return [figure, figure]
            return [figure]
          })
          const randomFigure = weightedCandidates[
            Math.floor(Math.random() * weightedCandidates.length)
          ]

          if (!randomFigure) break

          nextScore = placeRhythmicFigure(
            nextScore,
            measureIndex,
            beatIndex,
            randomFigure.id,
          )
          beatIndex += randomFigure.beats
        }
      }

      this.score = nextScore
      this.ties = nextTies
      this.draggedFigureId = null
      this.dragOverTarget = null
    },
    isRandomFigureAllowed(figureId) {
      return this.allowedRandomFigureIds.includes(figureId)
    },
    toggleRandomFigure(figureId) {
      if (this.isRandomFigureAllowed(figureId)) {
        if (this.allowedRandomFigureIds.length === 1) return

        this.allowedRandomFigureIds = this.allowedRandomFigureIds.filter((id) => id !== figureId)
        return
      }

      this.allowedRandomFigureIds = [...this.allowedRandomFigureIds, figureId]
    },
    allowAllRandomFigures() {
      this.allowedRandomFigureIds = this.figures.map((figure) => figure.id)
    },
    syncTies() {
      this.ties = sanitizeRhythmicTies(
        this.score,
        this.ties,
        this.measureCount,
        this.beatsPerBar,
      )
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
          this.activeMeasureIndex = null
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

      this.score = fillEmptyRhythmicSlotsWithRests(
        this.score,
        this.measureCount,
        this.beatsPerBar,
      )
      this.syncTies()

      await this.rhythmicPlayer.start(
        this.score,
        this.measureCount,
        this.beatsPerBar,
        this.ties,
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
      this.ties = trimRhythmicTies(this.ties, nextCount, this.beatsPerBar)
      this.syncTies()
    },
    changeTimeSignature(signature) {
      if (this.timeSignature === signature) return
      this.stopPlayback()
      this.timeSignature = signature
      this.score = trimRhythmicScore(this.score, this.measureCount, this.beatsPerBar)
      this.ties = trimRhythmicTies(this.ties, this.measureCount, this.beatsPerBar)
      this.syncTies()
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
    onBeatDragOver(measureIndex, beatIndex, event) {
      this.dragOverTarget = { measureIndex, beatIndex }

      if (event?.dataTransfer && this.draggedFigureId) {
        const canDrop = canPlaceRhythmicFigure(
          this.score,
          measureIndex,
          beatIndex,
          this.draggedFigureId,
        )
        event.dataTransfer.dropEffect = canDrop ? 'copy' : 'none'
      }
    },
    onBeatDragLeave(event) {
      const relatedTarget = event.relatedTarget
      if (relatedTarget?.closest?.('.rhythmic-figures__beats')) return
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
      this.syncTies()
    },
    removeAt(measureIndex, beatIndex) {
      this.stopPlayback()
      this.score = removeRhythmicFigure(this.score, measureIndex, beatIndex)
      this.syncTies()
    },
    hasTie(measureIndex, betweenBeatIndex) {
      return hasRhythmicTie(this.ties, measureIndex, betweenBeatIndex)
    },
    isTieInteractive(measureIndex, betweenBeatIndex) {
      return (
        this.hasTie(measureIndex, betweenBeatIndex)
        || canAddRhythmicTie(this.score, measureIndex, betweenBeatIndex)
      )
    },
    tieButtonClass(measureIndex, betweenBeatIndex) {
      return {
        'rhythmic-figures__tie--active': this.hasTie(measureIndex, betweenBeatIndex),
        'rhythmic-figures__tie--available': this.isTieInteractive(
          measureIndex,
          betweenBeatIndex,
        ),
      }
    },
    toggleTie(measureIndex, betweenBeatIndex) {
      this.stopPlayback()
      this.ties = toggleRhythmicTie(
        this.ties,
        this.score,
        measureIndex,
        betweenBeatIndex,
      )
    },
    tieAriaLabel(measureIndex, betweenBeatIndex) {
      const fromBeat = betweenBeatIndex + 1
      const toBeat = betweenBeatIndex + 2

      if (this.hasTie(measureIndex, betweenBeatIndex)) {
        return `Remover ligadura entre os tempos ${fromBeat} e ${toBeat}`
      }

      return `Ligar o fim do tempo ${fromBeat} ao início do tempo ${toBeat}`
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
    canDropAt(measureIndex, beatIndex, figureId = this.draggedFigureId) {
      if (!figureId) return false
      return canPlaceRhythmicFigure(
        this.score,
        measureIndex,
        beatIndex,
        figureId,
      )
    },
    isDragOverInvalid(measureIndex, beatIndex) {
      if (!this.draggedFigureId || !this.dragOverTarget) return false
      if (
        this.dragOverTarget.measureIndex !== measureIndex
        || this.dragOverTarget.beatIndex !== beatIndex
      ) {
        return false
      }
      return !this.canDropAt(measureIndex, beatIndex)
    },
    isDragPreviewContinuation(measureIndex, beatIndex) {
      if (!this.draggedFigureId || !this.dragOverTarget) return false

      const { measureIndex: overMeasure, beatIndex: overBeat } = this.dragOverTarget
      if (!this.canDropAt(overMeasure, overBeat)) return false

      const figure = getRhythmicFigure(this.draggedFigureId)
      if (!figure || figure.beats <= 1) return false
      if (measureIndex !== overMeasure) return false

      return beatIndex > overBeat && beatIndex < overBeat + figure.beats
    },
    beatCellClass(measureIndex, beatIndex) {
      const placement = this.placementAt(measureIndex, beatIndex)
      const isDragOver =
        this.dragOverTarget?.measureIndex === measureIndex
        && this.dragOverTarget?.beatIndex === beatIndex
      const isDragOverValid = isDragOver && this.canDropAt(measureIndex, beatIndex)
      const isDragOverInvalid = this.isDragOverInvalid(measureIndex, beatIndex)
      const isDragPreview = this.isDragPreviewContinuation(measureIndex, beatIndex)

      const isActiveBeat =
        this.activeMeasureIndex === measureIndex
        && this.activeBeatIndex === beatIndex

      return {
        'rhythmic-figures__beat--occupied': Boolean(placement && !placement.isContinuation),
        'rhythmic-figures__beat--continuation': this.isBeatContinuation(measureIndex, beatIndex),
        'rhythmic-figures__beat--drag-over': isDragOverValid,
        'rhythmic-figures__beat--drag-invalid': isDragOverInvalid,
        'rhythmic-figures__beat--drag-preview': isDragPreview,
        'rhythmic-figures__beat--playing':
          this.playbackPhase === 'sequence' && isActiveBeat,
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
        return `Compasso ${measureIndex + 1}, tempo ${beatIndex + 1}, bloqueado`
      }
      if (this.isDragOverInvalid(measureIndex, beatIndex)) {
        return `Compasso ${measureIndex + 1}, tempo ${beatIndex + 1}, não é possível colocar aqui`
      }
      return `Compasso ${measureIndex + 1}, tempo ${beatIndex + 1}, ${figure?.label ?? 'figura'}`
    },
  },
}
</script>

<style scoped>
.rhythmic-figures {
  --rhythm-surface: var(--neu-surface);
  --rhythm-paper-border: var(--app-border-card);
  --rhythm-paper-shadow: var(--neu-raised-sm);
  --rhythm-paper-shadow-hover: var(--neu-raised);
  --rhythm-paper-shadow-pressed: var(--neu-pressed);
  --rhythm-paper-shadow-lifted: var(--neu-raised-lg);

  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  overflow: visible;
}

.rhythmic-figures__count-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.rhythmic-figures__count-number {
  display: grid;
  place-items: center;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(5.5rem, 14vw, 10rem);
  font-weight: 800;
  line-height: 1;
  color: var(--app-accent);
  text-shadow: 0 10px 34px rgba(3, 8, 18, 0.36);
}

.rhythmic-figures__count-overlay-enter-active,
.rhythmic-figures__count-overlay-leave-active {
  transition: opacity 0.08s ease;
}

.rhythmic-figures__count-overlay-enter-from,
.rhythmic-figures__count-overlay-leave-to {
  opacity: 0;
}

.rhythmic-figures__count-number-enter-active,
.rhythmic-figures__count-number-leave-active {
  transition:
    opacity 0.08s ease,
    transform 0.08s ease;
}

.rhythmic-figures__count-number-enter-from {
  opacity: 0;
  transform: scale(0.92);
}

.rhythmic-figures__count-number-leave-to {
  opacity: 0;
  transform: scale(1.04);
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
  color: var(--app-text-muted);
}

.rhythmic-figures__step,
.rhythmic-figures__pill,
.rhythmic-figures__playback-btn,
.rhythmic-figures__reset-btn {
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
  color: var(--app-text);
  font-size: 1.1rem;
  line-height: 1;
}

.rhythmic-figures__step:hover:not(:disabled),
.rhythmic-figures__pill:hover,
.rhythmic-figures__playback-btn:hover,
.rhythmic-figures__reset-btn:hover {
  box-shadow: var(--neu-raised);
}

.rhythmic-figures__step:active:not(:disabled),
.rhythmic-figures__pill:active,
.rhythmic-figures__playback-btn:active,
.rhythmic-figures__reset-btn:active {
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
  color: var(--app-text);
}

.rhythmic-figures__pill {
  min-width: 52px;
  padding: 8px 14px;
  border-radius: 12px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--app-text-soft);
}

.rhythmic-figures__pill--active {
  color: var(--app-accent);
  box-shadow: var(--neu-pressed-deep);
  transition: none;
}

.rhythmic-figures__pill--active:hover,
.rhythmic-figures__pill--active:active {
  color: var(--app-accent);
  box-shadow: var(--neu-pressed-deep);
  transform: none;
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
  transition: none;
}

.rhythmic-figures__playback-btn--active:hover,
.rhythmic-figures__playback-btn--active:active {
  box-shadow:
    var(--neu-pressed-deep),
    0 0 14px rgba(34, 197, 94, 0.25);
  transform: none;
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
  background: var(--app-heading);
}

.rhythmic-figures__reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 44px;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  color: var(--app-text-soft);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
}

.rhythmic-figures__reset-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.rhythmic-figures__reset-btn--active {
  color: var(--app-accent);
  box-shadow: var(--neu-pressed-deep);
}

.rhythmic-figures__reset-btn--compact {
  height: 34px;
  min-width: auto;
  padding: 0 12px;
}

.rhythmic-figures__random-settings {
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: 14px 16px;
  border: 1px solid var(--app-border-card);
  border-radius: 16px;
  background: var(--rhythm-surface);
  box-shadow: var(--rhythm-paper-shadow);
}

.rhythmic-figures__random-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--app-border-subtle);
}

.rhythmic-figures__random-settings-title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--app-accent);
}

.rhythmic-figures__random-settings-description {
  margin: 4px 0 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--app-text-muted);
}

.rhythmic-figures__random-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 10px;
  padding-top: 12px;
}

.rhythmic-figures__random-figure {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  margin: 0;
  padding: 8px 10px;
  border: 1px solid var(--app-border-card);
  border-radius: 12px;
  background: var(--neu-surface);
  color: var(--app-text-muted);
  box-shadow: none;
  cursor: pointer;
  text-align: left;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  transition:
    border-color 0.12s ease,
    box-shadow 0.12s ease,
    color 0.12s ease,
    opacity 0.12s ease;
}

.rhythmic-figures__random-figure:hover {
  box-shadow: var(--rhythm-paper-shadow-hover);
}

.rhythmic-figures__random-figure--active {
  color: var(--app-text);
  border-color: rgba(217, 119, 6, 0.42);
  box-shadow: var(--neu-pressed);
}

.rhythmic-figures__random-figure:not(.rhythmic-figures__random-figure--active) {
  opacity: 0.55;
}

.rhythmic-figures__random-figure .rhythmic-figures__figure-img {
  width: 28px;
  max-width: 28px;
  max-height: 24px;
  margin: 0;
  flex-shrink: 0;
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
  padding: 4px 8px 8px;
}

.rhythmic-figures__measures--count-1 .rhythmic-figures__measure {
  flex: 0 1 auto;
  width: min(100%, 540px);
  max-width: 540px;
}

.rhythmic-figures__measures--count-1 .rhythmic-figures__beats {
  padding: 18px 16px;
  gap: 4px;
}

.rhythmic-figures__measures--count-1 .rhythmic-figures__beat {
  min-width: 64px;
  min-height: 104px;
  margin: 0 2px;
  border-radius: 12px;
}

.rhythmic-figures__measures--count-1 .rhythmic-figures__figure-img--placed {
  max-height: 58px;
}

.rhythmic-figures__measures--count-1 .rhythmic-figures__tie {
  flex: 0 0 34px;
}

.rhythmic-figures__measures--count-1 .rhythmic-figures__tie-icon {
  width: 30px;
  height: 13px;
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
  color: var(--app-text-faint);
}

.rhythmic-figures__beats {
  display: flex;
  align-items: stretch;
  gap: 0;
  width: 100%;
  padding: 12px 10px;
  border-radius: 14px;
  background: var(--rhythm-surface);
  border: 1px solid var(--rhythm-paper-border);
  box-shadow: var(--rhythm-paper-shadow);
}

.rhythmic-figures__beat {
  position: relative;
  flex: 1 1 0;
  min-width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  margin: 0 1px;
  border-radius: 10px;
  border: 1px dashed var(--app-rhythm-slot-border);
  background: var(--app-rhythm-beat-bg);
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

.rhythmic-figures__beat--drag-invalid {
  border-color: rgba(239, 68, 68, 0.85);
  background: rgba(239, 68, 68, 0.12);
  cursor: not-allowed;
}

.rhythmic-figures__beat--drag-preview {
  border-style: solid;
  border-color: rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.05);
}

.rhythmic-figures__beat--occupied {
  border-style: solid;
  border-color: var(--app-rhythm-slot-border-occupied);
}

.rhythmic-figures__beat--continuation {
  border-style: solid;
  border-color: var(--app-rhythm-slot-border-muted);
  background: var(--app-rhythm-beat-continuation-bg);
  cursor: not-allowed;
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
  filter: var(--app-rhythm-figure-filter);
  mix-blend-mode: var(--app-rhythm-figure-blend);
}

.rhythmic-figures__figure-img--placed {
  max-height: 40px;
}

.rhythmic-figures__slot-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.rhythmic-figures__slot-icon svg {
  width: 22px;
  height: 22px;
}

.rhythmic-figures__slot-icon--blocked {
  color: var(--app-rhythm-icon-muted);
}

.rhythmic-figures__slot-icon--preview {
  color: rgba(251, 191, 36, 0.45);
}

.rhythmic-figures__slot-icon--forbidden {
  color: rgba(239, 68, 68, 0.8);
}

.rhythmic-figures__tie {
  flex: 0 0 26px;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--app-rhythm-tie-idle);
  cursor: default;
  transition:
    color 0.12s ease,
    background-color 0.12s ease;
}

.rhythmic-figures__tie--available {
  color: var(--app-rhythm-tie-available);
  cursor: pointer;
}

.rhythmic-figures__tie--available:hover {
  color: rgba(251, 191, 36, 0.72);
  background: rgba(251, 191, 36, 0.06);
}

.rhythmic-figures__tie--active {
  color: var(--app-accent);
  cursor: pointer;
}

.rhythmic-figures__tie--active:hover {
  color: var(--app-accent);
  background: rgba(251, 191, 36, 0.08);
}

.rhythmic-figures__tie:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.rhythmic-figures__tie:disabled {
  opacity: 0.35;
  cursor: default;
}

.rhythmic-figures__tie-icon {
  width: 24px;
  height: 11px;
}

.rhythmic-figures__palette {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 20px 4px 8px;
  border-top: 1px solid var(--app-rhythm-palette-divider);
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
  color: var(--app-text-muted);
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

@media (max-height: 760px) {
  .rhythmic-figures {
    gap: 10px;
  }

  .rhythmic-figures__random-settings {
    padding: 10px 12px;
  }

  .rhythmic-figures__random-grid {
    gap: 8px;
    padding-top: 10px;
  }

  .rhythmic-figures__random-figure {
    min-height: 38px;
    padding: 6px 8px;
  }

  .rhythmic-figures__staff {
    padding: 4px 2px;
  }

  .rhythmic-figures__beats {
    padding: 8px 8px;
  }

  .rhythmic-figures__beat {
    min-height: 54px;
  }

  .rhythmic-figures__figure-img--placed {
    max-height: 30px;
  }

  .rhythmic-figures__palette {
    padding-top: 12px;
  }

  .rhythmic-figures__palette-surface {
    min-height: 44px;
  }
}

@media (max-height: 640px) {
  .rhythmic-figures__toolbar {
    gap: 10px;
  }

  .rhythmic-figures__random-settings-description {
    display: none;
  }

  .rhythmic-figures__random-grid {
    grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  }

  .rhythmic-figures__beat {
    min-height: 46px;
  }

  .rhythmic-figures__figure-img--placed {
    max-height: 26px;
  }
}
</style>
