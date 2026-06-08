<template>

  <div

    id="controls-panel-options"

    role="tabpanel"

    class="recorder-section__panel recorder-section__panel--options"

    aria-labelledby="controls-tab-options"

  >

    <div class="options-panel">

      <header class="options-panel__header">

        <h2 class="options-panel__title">Opções</h2>

        <p class="options-panel__subtitle">

          Ajuste notação, estilo visual, tamanho do teclado e volumes. As alterações aparecem no teclado abaixo.

        </p>

      </header>



      <div class="options-panel__grid">

        <section class="options-panel__card" aria-labelledby="options-card-notation">

          <h3 id="options-card-notation" class="options-panel__card-title">Notas no teclado</h3>



          <div class="options-panel__field">

            <span class="options-panel__field-label">Exibição</span>

            <div class="options-panel__field-controls">

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



          <div class="options-panel__field">

            <span class="options-panel__field-label">Sistema</span>

            <div class="options-panel__field-controls options-panel__field-controls--segmented">

              <AppTooltip text="Notação ocidental: nomes como C4, D#5 e F#3 nas teclas.">

                <button

                  type="button"

                  class="recorder-section__pill recorder-section__pill--notation"

                  :class="{ 'recorder-section__pill--active': keyLabelNotation === 'western' }"

                  :aria-pressed="keyLabelNotation === 'western'"

                  aria-label="Notação ocidental (C4)"

                  @click="$emit('update:key-label-notation', 'western')"

                >

                  C4

                </button>

              </AppTooltip>

              <AppTooltip text="Solfejo: nomes como Dó4, Ré#5 e Fá#3 nas teclas.">

                <button

                  type="button"

                  class="recorder-section__pill recorder-section__pill--notation"

                  :class="{ 'recorder-section__pill--active': keyLabelNotation === 'solfege' }"

                  :aria-pressed="keyLabelNotation === 'solfege'"

                  aria-label="Solfejo (Dó4)"

                  @click="$emit('update:key-label-notation', 'solfege')"

                >

                  Dó4

                </button>

              </AppTooltip>

            </div>

          </div>



          <div class="options-panel__field">

            <span class="options-panel__field-label">Alterações</span>

            <div class="options-panel__field-controls options-panel__field-controls--segmented">

              <AppTooltip

                v-for="notation in accidentalNotations"

                :key="notation.id"

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

        </section>



        <section class="options-panel__card" aria-labelledby="options-card-display">

          <h3 id="options-card-display" class="options-panel__card-title">Visualização</h3>



          <div class="options-panel__field">

            <span class="options-panel__field-label">Estilo visual</span>

            <div class="options-panel__field-controls options-panel__field-controls--segmented">

              <AppTooltip

                v-for="theme in designThemes"

                :key="`design-theme-tt-${theme.id}`"

                :text="designThemeTooltip(theme.id)"

              >

                <button

                  type="button"

                  class="recorder-section__pill"

                  :class="{ 'recorder-section__pill--active': designTheme === theme.id }"

                  :aria-pressed="designTheme === theme.id"

                  @click="$emit('update:design-theme', theme.id)"

                >

                  {{ theme.label }}

                </button>

              </AppTooltip>

            </div>

          </div>



          <div class="options-panel__field">

            <span class="options-panel__field-label">Altura das teclas</span>

            <div class="options-panel__field-controls">

              <div class="recorder-section__bpm options-panel__stepper">

                <AppTooltip text="Diminui a altura vertical das teclas do piano.">

                  <button

                    type="button"

                    class="recorder-section__bpm-step"

                    aria-label="Diminuir altura do teclado"

                    :disabled="!canDecreaseKeyboardHeight"

                    @click="$emit('change-keyboard-height', -keyboardHeightStep)"

                  >

                    <span class="recorder-section__bpm-step-glyph" aria-hidden="true">−</span>

                  </button>

                </AppTooltip>

                <AppTooltip :text="keyboardHeightTooltip">

                  <span

                    class="recorder-section__bpm-value recorder-section__bpm-value--readonly"

                    aria-live="polite"

                  >

                    {{ keyboardHeight }} px

                  </span>

                </AppTooltip>

                <AppTooltip text="Aumenta a altura vertical das teclas do piano.">

                  <button

                    type="button"

                    class="recorder-section__bpm-step"

                    aria-label="Aumentar altura do teclado"

                    :disabled="!canIncreaseKeyboardHeight"

                    @click="$emit('change-keyboard-height', keyboardHeightStep)"

                  >

                    <span class="recorder-section__bpm-step-glyph" aria-hidden="true">+</span>

                  </button>

                </AppTooltip>

              </div>

            </div>

          </div>



          <div class="options-panel__field">

            <span class="options-panel__field-label">Zoom da tela</span>

            <div class="options-panel__field-controls">

              <div class="recorder-section__bpm options-panel__stepper">

                <AppTooltip text="Diminui o zoom de toda a interface.">

                  <button

                    type="button"

                    class="recorder-section__bpm-step"

                    aria-label="Diminuir zoom da tela"

                    :disabled="!canDecreaseViewZoom"

                    @click="$emit('change-view-zoom', -viewZoomStep)"

                  >

                    <span class="recorder-section__bpm-step-glyph" aria-hidden="true">−</span>

                  </button>

                </AppTooltip>

                <AppTooltip :text="viewZoomTooltip">

                  <span

                    class="recorder-section__bpm-value recorder-section__bpm-value--readonly"

                    aria-live="polite"

                  >

                    {{ viewZoomPercent }}%

                  </span>

                </AppTooltip>

                <AppTooltip text="Aumenta o zoom de toda a interface.">

                  <button

                    type="button"

                    class="recorder-section__bpm-step"

                    aria-label="Aumentar zoom da tela"

                    :disabled="!canIncreaseViewZoom"

                    @click="$emit('change-view-zoom', viewZoomStep)"

                  >

                    <span class="recorder-section__bpm-step-glyph" aria-hidden="true">+</span>

                  </button>

                </AppTooltip>

                <AppTooltip :text="resetZoomTooltip">

                  <button

                    type="button"

                    class="recorder-section__pill recorder-section__pill--bpm-reset"

                    :disabled="viewZoom === viewZoomDefault"

                    :aria-label="`Restaurar zoom para ${defaultZoomPercent}%`"

                    @click="$emit('reset-view-zoom')"

                  >

                    {{ defaultZoomPercent }}%

                  </button>

                </AppTooltip>

              </div>

            </div>

          </div>

        </section>



        <section class="options-panel__card" aria-labelledby="options-card-audio">

          <h3 id="options-card-audio" class="options-panel__card-title">Áudio</h3>



          <div class="options-panel__field options-panel__field--volume">

            <span class="options-panel__field-label">Volume piano</span>

            <div class="options-panel__field-controls">

              <AppTooltip text="Ajusta o volume das notas tocadas no teclado virtual e na reprodução MIDI.">

                <div class="recorder-section__volume options-panel__volume">

                  <input

                    :value="pianoVolume"

                    type="range"

                    class="recorder-section__volume-slider options-panel__volume-slider"

                    :style="volumeSliderStyle(pianoVolume)"

                    min="0"

                    max="100"

                    step="1"

                    aria-label="Volume do piano"

                    @input="onPianoVolumeInput"

                  />

                  <span class="recorder-section__volume-value">{{ pianoVolume }}%</span>

                </div>

              </AppTooltip>

            </div>

          </div>



          <div class="options-panel__field options-panel__field--volume">

            <span class="options-panel__field-label">Volume metrônomo</span>

            <div class="options-panel__field-controls">

              <AppTooltip text="Ajusta o volume dos cliques do metrônomo na aba Gravação.">

                <div class="recorder-section__volume options-panel__volume">

                  <input

                    :value="metronomeVolume"

                    type="range"

                    class="recorder-section__volume-slider options-panel__volume-slider"

                    :style="volumeSliderStyle(metronomeVolume)"

                    min="0"

                    max="100"

                    step="1"

                    aria-label="Volume do metrônomo"

                    @input="onMetronomeVolumeInput"

                  />

                  <span class="recorder-section__volume-value">{{ metronomeVolume }}%</span>

                </div>

              </AppTooltip>

            </div>

          </div>

        </section>

      </div>

    </div>

  </div>

</template>



<script>

import AppTooltip from '../AppTooltip.vue'



export default {

  name: 'OptionsTabPanel',

  components: {

    AppTooltip,

  },

  props: {

    showKeyLabels: { type: Boolean, required: true },

    keyLabelNotation: { type: String, required: true },

    accidentalNotations: { type: Array, required: true },

    accidentalNotation: { type: String, required: true },

    keyboardHeight: { type: Number, required: true },

    keyboardHeightStep: { type: Number, required: true },

    canDecreaseKeyboardHeight: { type: Boolean, required: true },

    canIncreaseKeyboardHeight: { type: Boolean, required: true },

    viewZoom: { type: Number, required: true },

    viewZoomStep: { type: Number, required: true },

    viewZoomDefault: { type: Number, required: true },

    viewZoomPercent: { type: Number, required: true },

    canDecreaseViewZoom: { type: Boolean, required: true },

    canIncreaseViewZoom: { type: Boolean, required: true },

    pianoVolume: { type: Number, required: true },

    metronomeVolume: { type: Number, required: true },

    designThemes: { type: Array, required: true },

    designTheme: { type: String, required: true },

  },

  emits: [

    'toggle-show-key-labels',

    'update:design-theme',

    'update:key-label-notation',

    'update:accidental-notation',

    'change-keyboard-height',

    'change-view-zoom',

    'reset-view-zoom',

    'update:piano-volume',

    'update:metronome-volume',

  ],

  computed: {

    defaultZoomPercent() {

      return Math.round(this.viewZoomDefault * 100)

    },

    showKeyLabelsTooltip() {

      if (this.showKeyLabels) {

        return 'Os nomes das notas estão visíveis nas teclas. Clique para ocultar.'

      }



      return 'Exibe o nome de cada nota diretamente nas teclas do piano.'

    },

    keyboardHeightTooltip() {

      return `Altura atual das teclas: ${this.keyboardHeight} px. A alteração é aplicada ao teclado abaixo.`

    },

    viewZoomTooltip() {

      return `Zoom atual da interface: ${this.viewZoomPercent}%. Afeta todo o conteúdo da página.`

    },

    resetZoomTooltip() {

      return `Restaura o zoom padrão (${this.defaultZoomPercent}%).`

    },

  },

  methods: {

    designThemeTooltip(themeId) {

      if (themeId === 'flat') {

        return 'Interface plana com bordas e sombras discretas, sem relevo neumórfico.'

      }



      return 'Interface com relevo suave, sombras duplas e aparência neumórfica.'

    },

    accidentalTooltip(notationId) {

      if (notationId === 'sharp') {

        return 'Mostra sustenidos (♯) nos nomes das teclas alteradas, como C# e F#.'

      }



      return 'Mostra bemóis (♭) nos nomes das teclas alteradas, como D♭ e G♭.'

    },

    volumeSliderStyle(volume) {

      return { '--volume-fill': `${volume}%` }

    },

    onPianoVolumeInput(event) {

      this.$emit('update:piano-volume', Number(event.target.value))

    },

    onMetronomeVolumeInput(event) {

      this.$emit('update:metronome-volume', Number(event.target.value))

    },

  },

}

</script>



<style scoped>

.recorder-section__panel--options {

  width: 100%;

}



.options-panel {

  display: flex;

  flex-direction: column;

  align-items: stretch;

  gap: 18px;

  width: 100%;

  max-width: 72rem;

  margin: 0 auto;

}



.options-panel__header {

  display: flex;

  flex-direction: column;

  gap: 6px;

  padding-bottom: 4px;

}



.options-panel__title {

  margin: 0;

  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;

  font-size: 1.125rem;

  font-weight: 700;

  letter-spacing: 0.02em;

  color: #f3f4f6;

}



.options-panel__subtitle {

  margin: 0;

  max-width: 42rem;

  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;

  font-size: 0.8125rem;

  line-height: 1.5;

  color: rgba(243, 244, 246, 0.55);

}



.options-panel__grid {

  display: grid;

  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 14px;

  width: 100%;

}



.options-panel__card {

  display: flex;

  flex-direction: column;

  gap: 14px;

  padding: 16px 18px;

  border-radius: 16px;

  background: var(--neu-surface);

  box-shadow: var(--neu-raised-sm);

  border: 1px solid rgba(255, 255, 255, 0.04);

}



.options-panel__card-title {

  margin: 0;

  padding-bottom: 10px;

  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;

  font-size: 0.75rem;

  font-weight: 700;

  letter-spacing: 0.1em;

  text-transform: uppercase;

  color: #fbbf24;

}



.options-panel__field {

  display: flex;

  flex-direction: column;

  gap: 8px;

}



.options-panel__field-label {

  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;

  font-size: 0.75rem;

  font-weight: 600;

  letter-spacing: 0.06em;

  text-transform: uppercase;

  color: rgba(243, 244, 246, 0.5);

}



.options-panel__field-controls {

  display: flex;

  flex-wrap: wrap;

  align-items: center;

  gap: 8px;

}



.options-panel__field-controls--segmented {

  gap: 6px;

}



.options-panel__field-controls :deep(.app-tooltip) {

  display: inline-flex;

}



.options-panel__field-controls :deep(.app-tooltip__trigger) {

  display: inline-flex;

}



.options-panel__field--volume .options-panel__field-controls :deep(.app-tooltip) {

  width: 100%;

}



.options-panel__field--volume .options-panel__field-controls :deep(.app-tooltip__trigger) {

  width: 100%;

}



.options-panel__stepper {

  width: 100%;

  max-width: 100%;

}



.options-panel__field--volume .options-panel__field-controls {

  width: 100%;

}



.options-panel__volume {

  width: 100%;

  min-width: 0;

}



.options-panel__volume-slider {

  flex: 1;

  width: auto;

  min-width: 0;

  max-width: none;

}



@media (max-width: 1100px) {

  .options-panel__grid {

    grid-template-columns: repeat(2, minmax(0, 1fr));

  }



  .options-panel__card:last-child {

    grid-column: 1 / -1;

  }

}



@media (max-width: 680px) {

  .options-panel__grid {

    grid-template-columns: minmax(0, 1fr);

  }



  .options-panel__card:last-child {

    grid-column: auto;

  }

}

</style>


