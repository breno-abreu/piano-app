<template>
  <div
    id="controls-panel-harmonic"
    role="tabpanel"
    class="recorder-section__panel recorder-section__panel--harmonic"
    aria-labelledby="controls-tab-harmonic"
  >
    <div class="recorder-section__inner recorder-section__harmonic">
      <div class="recorder-section__harmonic-row">
        <span class="recorder-section__label">Notação</span>
        <button
          v-for="notation in accidentalNotations"
          :key="`harmonic-${notation.id}`"
          type="button"
          class="recorder-section__pill"
          :class="{ 'recorder-section__pill--active': accidentalNotation === notation.id }"
          :aria-pressed="accidentalNotation === notation.id"
          @click="$emit('update:accidental-notation', notation.id)"
        >
          {{ notation.label }}
        </button>
      </div>

      <div class="recorder-section__harmonic-row">
        <span class="recorder-section__label">Campo</span>
        <button
          type="button"
          class="recorder-section__pill"
          :class="{ 'recorder-section__pill--active': harmonicDisplayEnabled }"
          :aria-pressed="harmonicDisplayEnabled"
          :aria-label="harmonicDisplayEnabled ? 'Ocultar campo harmônico no teclado' : 'Mostrar campo harmônico no teclado'"
          @click="$emit('toggle-harmonic-display')"
        >
          {{ harmonicDisplayEnabled ? 'Ativo' : 'Inativo' }}
        </button>

        <span class="recorder-section__divider" aria-hidden="true" />

        <span class="recorder-section__label">Escala</span>
        <button
          v-for="scale in harmonicScaleTypes"
          :key="scale.id"
          type="button"
          class="recorder-section__pill"
          :class="{ 'recorder-section__pill--active': harmonicScaleType === scale.id }"
          :aria-pressed="harmonicScaleType === scale.id"
          @click="$emit('update:harmonic-scale-type', scale.id)"
        >
          {{ scale.label }}
        </button>

        <span class="recorder-section__divider" aria-hidden="true" />

        <span class="recorder-section__label">Tom</span>
        <button
          v-for="tonic in harmonicTonics"
          :key="tonic"
          type="button"
          class="recorder-section__pill recorder-section__pill--tonic"
          :class="{
            'recorder-section__pill--active': harmonicTonic === tonic,
            'recorder-section__pill--tonic-enh': tonic.includes('#'),
          }"
          :aria-pressed="harmonicTonic === tonic"
          :aria-label="`Tom ${formatAccidentalRootLabel(tonic)}`"
          @click="$emit('update:harmonic-tonic', tonic)"
        >
          {{ formatAccidentalRootLabel(tonic) }}
        </button>
      </div>

      <div class="recorder-section__harmonic-row recorder-section__harmonic-row--chords">
        <span class="recorder-section__label">Acordes</span>
        <div class="harmonic-chords" role="list">
          <button
            v-for="chord in harmonicChords"
            :key="chord.id"
            type="button"
            role="listitem"
            class="harmonic-chords__item"
            :class="{ 'harmonic-chords__item--active': harmonicSelectedChordId === chord.id }"
            :aria-pressed="harmonicSelectedChordId === chord.id"
            :aria-label="`Acorde ${chord.degree}, ${formatHarmonicChordSymbol(chord.symbol)}`"
            @click="$emit('toggle-harmonic-chord', chord.id)"
          >
            <span class="harmonic-chords__degree">{{ chord.degree }}</span>
            <span class="harmonic-chords__symbol">{{ formatHarmonicChordSymbol(chord.symbol) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatRootNotation } from '../../utils/harmonicField.js'

export default {
  name: 'HarmonicTabPanel',
  props: {
    accidentalNotations: { type: Array, required: true },
    accidentalNotation: { type: String, required: true },
    harmonicDisplayEnabled: { type: Boolean, required: true },
    harmonicScaleTypes: { type: Array, required: true },
    harmonicScaleType: { type: String, required: true },
    harmonicTonics: { type: Array, required: true },
    harmonicTonic: { type: String, required: true },
    harmonicChords: { type: Array, required: true },
    harmonicSelectedChordId: { type: String, default: null },
  },
  emits: [
    'update:accidental-notation',
    'toggle-harmonic-display',
    'update:harmonic-scale-type',
    'update:harmonic-tonic',
    'toggle-harmonic-chord',
  ],
  methods: {
    formatAccidentalRootLabel(root) {
      return formatRootNotation(root, this.accidentalNotation)
    },
    formatHarmonicChordSymbol(symbol) {
      const match = symbol.match(/^([A-G]#?)(.*)$/)
      if (!match) return symbol

      const [, root, suffix] = match

      return `${formatRootNotation(root, this.accidentalNotation)}${suffix}`
    },
  },
}
</script>
