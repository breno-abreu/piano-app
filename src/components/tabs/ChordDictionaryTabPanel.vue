<template>
  <div
    id="controls-panel-chord-dictionary"
    role="tabpanel"
    class="recorder-section__panel recorder-section__panel--chord-dictionary"
    aria-labelledby="controls-tab-chord-dictionary"
  >
    <div class="recorder-section__inner recorder-section__chord-dict">
      <div class="recorder-section__chord-dict-row">
        <span class="recorder-section__label">Notação</span>
        <button
          v-for="notation in accidentalNotations"
          :key="`chord-dict-${notation.id}`"
          type="button"
          class="recorder-section__pill"
          :class="{ 'recorder-section__pill--active': accidentalNotation === notation.id }"
          :aria-pressed="accidentalNotation === notation.id"
          @click="$emit('update:accidental-notation', notation.id)"
        >
          {{ notation.label }}
        </button>
      </div>

      <div class="recorder-section__chord-dict-row recorder-section__chord-dict-row--tonic">
        <span class="recorder-section__label">Tom</span>
        <button
          v-for="root in chordDictRoots"
          :key="root"
          type="button"
          class="recorder-section__pill recorder-section__pill--tonic"
          :class="{
            'recorder-section__pill--active': chordDictRoot === root,
            'recorder-section__pill--tonic-enh': root.includes('#'),
          }"
          :aria-pressed="chordDictRoot === root"
          :aria-label="`Tom ${formatAccidentalRootLabel(root)}`"
          @click="$emit('set-chord-dict-root', root)"
        >
          {{ formatAccidentalRootLabel(root) }}
        </button>
      </div>

      <div class="recorder-section__chord-dict-row recorder-section__chord-dict-row--variations">
        <span class="recorder-section__label">Variações</span>
        <div class="chord-dict-variations">
          <button
            v-for="quality in chordDictQualities"
            :key="quality.id"
            type="button"
            class="recorder-section__pill chord-dict-variations__pill"
            :class="{
              'recorder-section__pill--active': chordDictQualityId === quality.id,
            }"
            :aria-pressed="chordDictQualityId === quality.id"
            :aria-label="`Acorde ${formatChordQualityLabel(chordDictRoot, quality, accidentalNotation)}`"
            @click="$emit('set-chord-dict-quality', quality.id)"
          >
            {{ formatChordQualityLabel(chordDictRoot, quality, accidentalNotation) }}
          </button>
        </div>
      </div>

      <div class="recorder-section__chord-dict-row recorder-section__chord-dict-row--bass">
        <span class="recorder-section__label">Baixos</span>
        <button
          v-for="bassRoot in chordDictBassRoots"
          :key="bassRoot"
          type="button"
          class="recorder-section__pill recorder-section__pill--tonic"
          :class="{
            'recorder-section__pill--active': chordDictActiveBassRoot === bassRoot,
            'recorder-section__pill--tonic-enh': bassRoot.includes('#'),
          }"
          :aria-pressed="chordDictActiveBassRoot === bassRoot"
          :aria-label="`Baixo ${formatAccidentalRootLabel(bassRoot)}`"
          @click="$emit('set-chord-dict-bass-root', bassRoot)"
        >
          {{ formatAccidentalRootLabel(bassRoot) }}
        </button>
      </div>

      <div class="recorder-section__chord-dict-row recorder-section__chord-dict-row--inversions">
        <span class="recorder-section__label">Inv. baixo</span>
        <div class="chord-dict-inversion">
          <button
            type="button"
            class="recorder-section__bpm-step chord-dict-inversion__step"
            :disabled="!chordDictBassCanInvert"
            aria-label="Inversão anterior do baixo"
            @click="$emit('shift-chord-dict-bass-inversion', -1)"
          >
            <span class="recorder-section__bpm-step-glyph" aria-hidden="true">←</span>
          </button>
          <span class="chord-dict-inversion__status">{{ chordDictBassInversionLabel }}</span>
          <button
            type="button"
            class="recorder-section__bpm-step chord-dict-inversion__step"
            :disabled="!chordDictBassCanInvert"
            aria-label="Próxima inversão do baixo"
            @click="$emit('shift-chord-dict-bass-inversion', 1)"
          >
            <span class="recorder-section__bpm-step-glyph" aria-hidden="true">→</span>
          </button>
        </div>

        <span class="recorder-section__divider" aria-hidden="true" />

        <span class="recorder-section__label">Inv. agudos</span>
        <div class="chord-dict-inversion">
          <button
            type="button"
            class="recorder-section__bpm-step chord-dict-inversion__step"
            :disabled="!chordDictCanInvert"
            aria-label="Inversão anterior dos agudos"
            @click="$emit('shift-chord-dict-inversion', -1)"
          >
            <span class="recorder-section__bpm-step-glyph" aria-hidden="true">←</span>
          </button>
          <span class="chord-dict-inversion__status">{{ chordDictInversionLabel }}</span>
          <button
            type="button"
            class="recorder-section__bpm-step chord-dict-inversion__step"
            :disabled="!chordDictCanInvert"
            aria-label="Próxima inversão dos agudos"
            @click="$emit('shift-chord-dict-inversion', 1)"
          >
            <span class="recorder-section__bpm-step-glyph" aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <p class="recorder-section__chord-dict-generated">
        <span class="recorder-section__chord-dict-generated-symbol">
          {{ chordDictFinalLabel }}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
import { formatRootNotation } from '../../utils/harmonicField.js'
import { formatChordQualityLabel } from '../../utils/chordDictionary.js'

export default {
  name: 'ChordDictionaryTabPanel',
  props: {
    accidentalNotations: { type: Array, required: true },
    accidentalNotation: { type: String, required: true },
    chordDictRoots: { type: Array, required: true },
    chordDictQualities: { type: Array, required: true },
    chordDictRoot: { type: String, required: true },
    chordDictQualityId: { type: String, required: true },
    chordDictBassRoots: { type: Array, required: true },
    chordDictActiveBassRoot: { type: String, required: true },
    chordDictCanInvert: { type: Boolean, required: true },
    chordDictBassCanInvert: { type: Boolean, required: true },
    chordDictInversionLabel: { type: String, required: true },
    chordDictBassInversionLabel: { type: String, required: true },
    chordDictFinalLabel: { type: String, required: true },
  },
  emits: [
    'update:accidental-notation',
    'set-chord-dict-root',
    'set-chord-dict-quality',
    'set-chord-dict-bass-root',
    'shift-chord-dict-inversion',
    'shift-chord-dict-bass-inversion',
  ],
  methods: {
    formatChordQualityLabel,
    formatAccidentalRootLabel(root) {
      return formatRootNotation(root, this.accidentalNotation)
    },
  },
}
</script>
