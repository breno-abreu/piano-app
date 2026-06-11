<template>

  <div

    id="controls-panel-harmonic"

    role="tabpanel"

    class="recorder-section__panel harmonic-panel"

    aria-labelledby="controls-tab-harmonic"

  >

    <div class="harmonic-panel__layout">

      <header class="harmonic-panel__header">

        <h2 class="harmonic-panel__title">Campos harmônicos</h2>

        <p class="harmonic-panel__subtitle">

          Configure o campo no teclado, escolha escala e tom.

          <template v-if="showHarmonicChordsCard"> Clique em um acorde para vê-lo no teclado.</template>

        </p>

      </header>



      <div class="harmonic-panel__settings">

        <section class="harmonic-panel__card" aria-labelledby="harmonic-card-notation">

          <h3 id="harmonic-card-notation" class="harmonic-panel__card-title">Notação e exibição</h3>



          <div class="harmonic-panel__field">

            <span class="harmonic-panel__field-label">Notação</span>

            <div class="harmonic-panel__field-controls">

              <AppTooltip

                v-for="notation in accidentalNotations"

                :key="`harmonic-tt-${notation.id}`"

                :text="accidentalTooltip(notation.id)"

              >

                <button

                  type="button"

                  class="recorder-section__pill"

                  :class="{ 'recorder-section__pill--active': accidentalNotation === notation.id }"

                  :aria-pressed="accidentalNotation === notation.id"

                  @click="$emit('update:accidental-notation', notation.id)"

                >

                  {{ notation.label }}

                </button>

              </AppTooltip>

            </div>

          </div>



          <div class="harmonic-panel__field">

            <span class="harmonic-panel__field-label">Campo no teclado</span>

            <div class="harmonic-panel__field-controls">

              <AppTooltip :text="harmonicDisplayTooltip">

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

              </AppTooltip>

            </div>

          </div>



          <div class="harmonic-panel__field">

            <span class="harmonic-panel__field-label">Nomes nas teclas</span>

            <div class="harmonic-panel__field-controls">

              <AppTooltip :text="showKeyLabelsTooltip">

                <button

                  type="button"

                  class="recorder-section__pill"

                  :class="{ 'recorder-section__pill--active': showKeyLabels }"

                  :aria-pressed="showKeyLabels"

                  :aria-label="showKeyLabels ? 'Ocultar nomes nas teclas' : 'Mostrar nomes nas teclas'"

                  @click="$emit('toggle-show-key-labels')"

                >

                  {{ showKeyLabels ? 'Visível' : 'Oculto' }}

                </button>

              </AppTooltip>

            </div>

          </div>

        </section>



        <section class="harmonic-panel__card" aria-labelledby="harmonic-card-scale">

          <h3 id="harmonic-card-scale" class="harmonic-panel__card-title">Tom e escala</h3>



          <div class="harmonic-panel__field">

            <span class="harmonic-panel__field-label">Escala</span>

            <div class="harmonic-panel__field-controls">

              <AppTooltip

                v-for="scale in harmonicScaleTypes"

                :key="`harmonic-scale-tt-${scale.id}`"

                :text="scaleTooltip(scale.id)"

              >

                <button

                  type="button"

                  class="recorder-section__pill"

                  :class="{ 'recorder-section__pill--active': harmonicScaleType === scale.id }"

                  :aria-pressed="harmonicScaleType === scale.id"

                  @click="$emit('update:harmonic-scale-type', scale.id)"

                >

                  {{ scale.label }}

                </button>

              </AppTooltip>

            </div>

          </div>



          <div class="harmonic-panel__field">

            <span class="harmonic-panel__field-label">Tom</span>

            <AppTooltip text="Tônica do campo harmônico. As notas da escala são destacadas no teclado.">

              <div class="harmonic-panel__note-grid">

                <button

                  v-for="tonic in harmonicTonics"

                  :key="tonic"

                  type="button"

                  class="recorder-section__pill recorder-section__pill--tonic harmonic-panel__note-btn"

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

            </AppTooltip>

          </div>

        </section>

      </div>



      <section
        v-if="showHarmonicChordsCard"
        class="harmonic-panel__card harmonic-panel__card--chords"
        aria-labelledby="harmonic-card-chords"
      >

        <h3 id="harmonic-card-chords" class="harmonic-panel__card-title">Acordes do campo</h3>



        <AppTooltip text="Clique em um acorde para destacar suas notas em vermelho no teclado. Clique novamente para desmarcar.">

          <div class="harmonic-panel__chords" role="group" aria-label="Acordes do campo harmônico">

            <button

              v-for="chord in harmonicChords"

              :key="chord.id"

              type="button"

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

        </AppTooltip>

      </section>

    </div>

  </div>

</template>



<script>

import AppTooltip from '../AppTooltip.vue'

import { formatRootNotation, isPentatonicScale } from '../../utils/harmonicField.js'



const SCALE_TOOLTIPS = {

  major: 'Escala maior natural — campo com sétima maior e acordes diatônicos clássicos.',

  minor: 'Escala menor natural — campo com sétima menor e acordes diatônicos menores.',

  pentatonicMajor: 'Pentatônica maior — cinco notas (1, 2, 3, 5, 6).',

  pentatonicMinor: 'Pentatônica menor — cinco notas (1, ♭3, 4, 5, ♭7).',

}



export default {

  name: 'HarmonicTabPanel',

  components: {

    AppTooltip,

  },

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

    showKeyLabels: { type: Boolean, required: true },

  },

  emits: [

    'update:accidental-notation',

    'toggle-harmonic-display',

    'update:harmonic-scale-type',

    'update:harmonic-tonic',

    'toggle-harmonic-chord',

    'toggle-show-key-labels',

  ],

  computed: {

    showHarmonicChordsCard() {
      return !isPentatonicScale(this.harmonicScaleType)
    },

    harmonicDisplayTooltip() {

      if (this.harmonicDisplayEnabled) {

        return 'O campo está visível no teclado. Clique para ocultar as notas da escala.'

      }



      return 'Destaca no teclado as notas da escala e a tônica do campo harmônico.'

    },

    showKeyLabelsTooltip() {

      if (this.showKeyLabels) {

        return 'Os nomes das notas estão visíveis nas teclas. Clique para ocultar.'

      }



      return 'Exibe o nome de cada nota nas teclas do piano (mesma opção da aba Opções).'

    },

  },

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

    accidentalTooltip(notationId) {

      if (notationId === 'sharp') {

        return 'Mostra sustenidos (♯) nos nomes das notas e acordes.'

      }



      return 'Mostra bemóis (♭) nos nomes das notas e acordes.'

    },

    scaleTooltip(scaleId) {

      return SCALE_TOOLTIPS[scaleId] ?? 'Seleciona o tipo de escala do campo harmônico.'

    },

  },

}

</script>



<style scoped>

.harmonic-panel {

  width: 100%;

}



.harmonic-panel__layout {

  display: flex;

  flex-direction: column;

  align-items: stretch;

  gap: 14px;

  width: 100%;

  max-width: 72rem;

  margin: 0 auto;

}



.harmonic-panel__header {

  display: flex;

  flex-direction: column;

  gap: 6px;

}



.harmonic-panel__title {

  margin: 0;

  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;

  font-size: 1.125rem;

  font-weight: 700;

  letter-spacing: 0.02em;

  color: var(--app-heading);

}



.harmonic-panel__subtitle {

  margin: 0;

  max-width: 42rem;

  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;

  font-size: 0.8125rem;

  line-height: 1.5;

  color: var(--app-subtitle);

}



.harmonic-panel__settings {

  display: grid;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 14px;

  width: 100%;

}



.harmonic-panel__card {

  display: flex;

  flex-direction: column;

  gap: 14px;

  width: 100%;

  padding: 16px 18px;

  border-radius: 16px;

  background: var(--neu-surface);

  box-shadow: var(--neu-raised-sm);

  border: 1px solid var(--app-border-card);

  box-sizing: border-box;

}



.harmonic-panel__card--chords {

  gap: 16px;

}



.harmonic-panel__card-title {

  margin: 0;

  padding-bottom: 10px;

  border-bottom: 1px solid var(--app-border-subtle);

  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;

  font-size: 0.75rem;

  font-weight: 700;

  letter-spacing: 0.1em;

  text-transform: uppercase;

  color: var(--app-accent);

}



.harmonic-panel__field {

  display: flex;

  flex-direction: column;

  gap: 10px;

}



.harmonic-panel__field-label {

  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;

  font-size: 0.75rem;

  font-weight: 600;

  letter-spacing: 0.06em;

  text-transform: uppercase;

  color: var(--app-field-label);

}



.harmonic-panel__field-controls {

  display: flex;

  flex-wrap: wrap;

  align-items: center;

  gap: 10px;

}



.harmonic-panel__field-controls :deep(.app-tooltip) {

  display: inline-flex;

}



.harmonic-panel__field-controls :deep(.app-tooltip__trigger) {

  display: inline-flex;

}



.harmonic-panel__card--chords :deep(.app-tooltip) {

  width: 100%;

}



.harmonic-panel__card--chords :deep(.app-tooltip__trigger) {

  width: 100%;

}



.harmonic-panel__note-grid {

  display: grid;

  grid-template-columns: repeat(12, minmax(2.25rem, 1fr));

  gap: 8px;

  width: 100%;

}



.harmonic-panel__note-btn {

  min-width: 0;

  width: 100%;

  height: 38px;

  padding: 0 6px;

  font-size: 0.8125rem;

}



.harmonic-panel__note-btn.recorder-section__pill--tonic-enh {

  font-size: 0.75rem;

  letter-spacing: 0.01em;

}



.harmonic-panel__chords {

  display: flex;

  flex-wrap: wrap;

  gap: 10px;

  width: 100%;

}



@media (max-width: 900px) {

  .harmonic-panel__settings {

    grid-template-columns: minmax(0, 1fr);

  }



  .harmonic-panel__note-grid {

    grid-template-columns: repeat(6, minmax(2.25rem, 1fr));

  }

}

</style>


