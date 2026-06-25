<template>
  <div
    id="controls-panel-chord-dictionary"
    role="tabpanel"
    class="recorder-section__panel chord-dict-panel"
    aria-labelledby="controls-tab-chord-dictionary"
  >
    <div class="chord-dict-panel__layout">
      <header class="chord-dict-panel__header">
        <h2 class="chord-dict-panel__title">Dicionário de acordes</h2>
        <p class="chord-dict-panel__subtitle">
          Escolha o tom, o tipo de acorde e o baixo. O resultado aparece no teclado abaixo.
        </p>
      </header>

      <div class="chord-dict-panel__result" aria-live="polite">
        <div class="chord-dict-panel__result-text">
          <span class="chord-dict-panel__result-label">Acorde selecionado</span>
          <span class="chord-dict-panel__result-symbol">{{ chordDictFinalLabel }}</span>
        </div>
        <AppTooltip :text="`Tocar o acorde ${chordDictFinalLabel} por alguns segundos.`">
          <button
            type="button"
            class="recorder-section__button recorder-section__button--play chord-dict-panel__play-button"
            :aria-label="`Tocar acorde ${chordDictFinalLabel}`"
            @click="$emit('play-chord')"
          >
            <span class="recorder-section__icon recorder-section__icon--play" />
          </button>
        </AppTooltip>
      </div>

      <div class="chord-dict-panel__settings">
        <section class="chord-dict-panel__card chord-dict-panel__card--base" aria-labelledby="chord-dict-card-base">
          <h3 id="chord-dict-card-base" class="chord-dict-panel__card-title">Base do acorde</h3>

          <div class="chord-dict-panel__field">
            <span class="chord-dict-panel__field-label">Tom</span>
            <AppTooltip text="Fundamental do acorde. Define a raiz das notas destacadas no teclado.">
              <div class="chord-dict-panel__note-grid">
                <button
                  v-for="root in chordDictRoots"
                  :key="root"
                  type="button"
                  class="recorder-section__pill recorder-section__pill--tonic chord-dict-panel__note-btn"
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
            </AppTooltip>
          </div>

          <div class="chord-dict-panel__field chord-dict-panel__field--inversion">
            <span class="chord-dict-panel__field-label">Inversão dos agudos</span>
            <AppTooltip text="Roda as notas agudas do acorde entre as possíveis inversões.">
              <div class="chord-dict-panel__inversion-controls">
                <button
                  type="button"
                  class="recorder-section__bpm-step chord-dict-panel__inversion-step"
                  :disabled="!chordDictCanInvert"
                  aria-label="Inversão anterior dos agudos"
                  @click="$emit('shift-chord-dict-inversion', -1)"
                >
                  <span class="recorder-section__bpm-step-glyph" aria-hidden="true">←</span>
                </button>
                <span class="chord-dict-panel__inversion-status">{{ chordDictInversionLabel }}</span>
                <button
                  type="button"
                  class="recorder-section__bpm-step chord-dict-panel__inversion-step"
                  :disabled="!chordDictCanInvert"
                  aria-label="Próxima inversão dos agudos"
                  @click="$emit('shift-chord-dict-inversion', 1)"
                >
                  <span class="recorder-section__bpm-step-glyph" aria-hidden="true">→</span>
                </button>
              </div>
            </AppTooltip>
          </div>

          <div class="chord-dict-panel__subsection" aria-labelledby="chord-dict-card-bass">
            <h4 id="chord-dict-card-bass" class="chord-dict-panel__subsection-title">Baixo</h4>

            <div class="chord-dict-panel__field">
              <span class="chord-dict-panel__field-label">Nota do baixo</span>
              <AppTooltip text="Nota tocada no baixo. Pode ser a fundamental ou um baixo alternado (ex.: C/G).">
                <div class="chord-dict-panel__note-grid">
                  <button
                    v-for="bassRoot in chordDictBassRoots"
                    :key="bassRoot"
                    type="button"
                    class="recorder-section__pill recorder-section__pill--tonic chord-dict-panel__note-btn"
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
              </AppTooltip>
            </div>

            <div class="chord-dict-panel__field chord-dict-panel__field--inversion">
              <span class="chord-dict-panel__field-label">Inversão do baixo</span>
              <AppTooltip text="Roda a nota do baixo entre os graus do acorde quando o baixo é um tom do acorde.">
                <div class="chord-dict-panel__inversion-controls">
                  <button
                    type="button"
                    class="recorder-section__bpm-step chord-dict-panel__inversion-step"
                    :disabled="!chordDictBassCanInvert"
                    aria-label="Inversão anterior do baixo"
                    @click="$emit('shift-chord-dict-bass-inversion', -1)"
                  >
                    <span class="recorder-section__bpm-step-glyph" aria-hidden="true">←</span>
                  </button>
                  <span class="chord-dict-panel__inversion-status">{{ chordDictBassInversionLabel }}</span>
                  <button
                    type="button"
                    class="recorder-section__bpm-step chord-dict-panel__inversion-step"
                    :disabled="!chordDictBassCanInvert"
                    aria-label="Próxima inversão do baixo"
                    @click="$emit('shift-chord-dict-bass-inversion', 1)"
                  >
                    <span class="recorder-section__bpm-step-glyph" aria-hidden="true">→</span>
                  </button>
                </div>
              </AppTooltip>
            </div>
          </div>
        </section>

        <section class="chord-dict-panel__card chord-dict-panel__card--variations" aria-labelledby="chord-dict-card-variations">
          <h3 id="chord-dict-card-variations" class="chord-dict-panel__card-title">Tipo do acorde</h3>

          <div
            v-for="group in chordQualityGroups"
            :key="group.id"
            class="chord-dict-panel__quality-group"
          >
            <span class="chord-dict-panel__quality-group-label">{{ group.label }}</span>
            <div class="chord-dict-panel__quality-grid">
              <AppTooltip
                v-for="quality in group.qualities"
                :key="`chord-dict-quality-tt-${quality.id}`"
                :text="qualityTooltip(quality.id)"
              >
                <button
                  type="button"
                  class="recorder-section__pill chord-dict-panel__quality-pill"
                  :class="{ 'recorder-section__pill--active': chordDictQualityId === quality.id }"
                  :aria-pressed="chordDictQualityId === quality.id"
                  :aria-label="`Acorde ${formatChordQualityLabel(chordDictRoot, quality, accidentalNotation)}`"
                  @click="$emit('set-chord-dict-quality', quality.id)"
                >
                  {{ formatChordQualityLabel(chordDictRoot, quality, accidentalNotation) }}
                </button>
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
import { formatRootNotation } from '../../utils/harmonicField.js'
import { formatChordQualityLabel } from '../../utils/chordDictionary.js'

const CHORD_QUALITY_GROUP_DEFS = [
  {
    id: 'basic',
    label: 'Básicos',
    ids: ['maj', 'min', 'dim', 'aug', 'sus2', 'sus4', '5'],
  },
  {
    id: 'sixth',
    label: 'Sextas',
    ids: ['6', 'm6', '69'],
  },
  {
    id: 'seventh',
    label: 'Sétimas',
    ids: ['7', 'maj7', 'm7', 'mmaj7', 'm7b5'],
  },
  {
    id: 'extended',
    label: 'Complexos',
    ids: [
      'add9',
      'madd9',
      '9',
      'maj9',
      'm9',
      'mmaj9',
      '7b9',
      '7s9',
      '11',
      'maj11',
      '13',
      'maj13',
    ],
  },
]

const QUALITY_TOOLTIPS = {
  maj: 'Tríade maior — fundamental, terça maior e quinta justa.',
  min: 'Tríade menor — terça menor e quinta justa.',
  dim: 'Diminuto — terça menor e quinta diminuta.',
  aug: 'Aumentado — terça maior e quinta aumentada.',
  sus2: 'Suspenso com segunda no lugar da terça.',
  sus4: 'Suspenso com quarta no lugar da terça.',
  5: 'Power chord — apenas fundamental e quinta.',
  6: 'Sexta maior adicionada à tríade.',
  m6: 'Sexta maior sobre tríade menor.',
  69: 'Sexta e nona sobre tríade maior.',
  7: 'Sétima dominante — tríade maior com sétima menor.',
  maj7: 'Sétima maior — tríade maior com sétima maior.',
  m7: 'Sétima menor — tríade menor com sétima menor.',
  mmaj7: 'Menor com sétima maior.',
  m7b5: 'Meio-diminuto — tríade diminuta com sétima menor.',
  add9: 'Tríade maior com nona adicionada, sem sétima.',
  madd9: 'Tríade menor com nona adicionada, sem sétima.',
  9: 'Nona — sétima dominante com nona maior.',
  maj9: 'Nona maior — sétima maior com nona.',
  m9: 'Nona menor — sétima menor com nona.',
  mmaj9: 'Menor com sétima maior e nona.',
  '7b9': 'Sétima dominante com nona bemol.',
  '7s9': 'Sétima dominante com nona aumentada (7#9).',
  11: 'Décima primeira — sétima dominante com nona e 11ª.',
  maj11: 'Décima primeira maior — sétima maior com nona e 11ª.',
  13: 'Décima terceira — sétima dominante com nona, 11ª e 13ª.',
  maj13: 'Décima terceira maior — sétima maior com nona, 11ª e 13ª.',
}

export default {
  name: 'ChordDictionaryTabPanel',
  components: {
    AppTooltip,
  },
  props: {
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
    chordDictTrebleNotes: { type: Array, required: true },
    chordDictBassNotes: { type: Array, required: true },
  },
  emits: [
    'set-chord-dict-root',
    'set-chord-dict-quality',
    'set-chord-dict-bass-root',
    'shift-chord-dict-inversion',
    'shift-chord-dict-bass-inversion',
    'play-chord',
  ],
  computed: {
    chordQualityGroups() {
      const qualitiesById = new Map(
        this.chordDictQualities.map((quality) => [quality.id, quality]),
      )

      return CHORD_QUALITY_GROUP_DEFS.map((group) => ({
        ...group,
        qualities: group.ids
          .map((id) => qualitiesById.get(id))
          .filter(Boolean),
      })).filter((group) => group.qualities.length > 0)
    },
  },
  methods: {
    formatChordQualityLabel,
    formatAccidentalRootLabel(root) {
      return formatRootNotation(root, this.accidentalNotation)
    },
    qualityTooltip(qualityId) {
      return QUALITY_TOOLTIPS[qualityId] ?? 'Seleciona este tipo de acorde no teclado.'
    },
  },
}
</script>

<style scoped>
.chord-dict-panel {
  width: 100%;
}

.chord-dict-panel__layout {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
}

.chord-dict-panel__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chord-dict-panel__title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--app-heading);
}

.chord-dict-panel__subtitle {
  margin: 0;
  max-width: 42rem;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--app-subtitle);
}

.chord-dict-panel__result {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 18px;
  width: 100%;
  padding: 16px 18px;
  border-radius: 18px;
  background: var(--app-result-bg);
  box-shadow: var(--app-result-shadow);
  border: 1px solid rgba(251, 191, 36, 0.12);
  box-sizing: border-box;
}

.chord-dict-panel__result-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  text-align: center;
}

.chord-dict-panel__play-button {
  justify-self: end;
  flex-shrink: 0;
}

.chord-dict-panel__result-label {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--app-result-label);
}

.chord-dict-panel__result-symbol {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--app-accent);
  text-shadow: none;
}

.chord-dict-panel__settings {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 14px;
  width: 100%;
}

.chord-dict-panel__card {
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

.chord-dict-panel__card--variations {
  gap: 16px;
}

.chord-dict-panel__card--base .chord-dict-panel__field--inversion {
  margin-top: 0;
}

.chord-dict-panel__card-title {
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

.chord-dict-panel__subsection {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--app-border-subtle);
}

.chord-dict-panel__subsection-title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--app-accent);
}

.chord-dict-panel__field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chord-dict-panel__field--inversion {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--app-border);
}

.chord-dict-panel__field-label {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--app-field-label);
}

.chord-dict-panel__field-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.chord-dict-panel__field-controls :deep(.app-tooltip),
.chord-dict-panel__quality-grid :deep(.app-tooltip) {
  display: inline-flex;
}

.chord-dict-panel__field-controls :deep(.app-tooltip__trigger),
.chord-dict-panel__quality-grid :deep(.app-tooltip__trigger) {
  display: inline-flex;
}

.chord-dict-panel__field :deep(.app-tooltip) {
  width: 100%;
}

.chord-dict-panel__field :deep(.app-tooltip__trigger) {
  width: 100%;
}

.chord-dict-panel__note-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(2.25rem, 1fr));
  gap: 8px;
  width: 100%;
}

.chord-dict-panel__note-btn {
  min-width: 0;
  width: 100%;
  height: 38px;
  padding: 0 6px;
  font-size: 0.8125rem;
}

.chord-dict-panel__note-btn.recorder-section__pill--tonic-enh {
  font-size: 0.75rem;
  letter-spacing: 0.01em;
}

.chord-dict-panel__inversion-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--app-panel-inset);
  border: 1px solid var(--app-border-card);
  width: 100%;
  box-sizing: border-box;
}

.chord-dict-panel__inversion-step {
  flex-shrink: 0;
}

.chord-dict-panel__inversion-status {
  min-width: 6.5rem;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--app-text);
  text-align: center;
}

.chord-dict-panel__quality-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chord-dict-panel__quality-group + .chord-dict-panel__quality-group {
  padding-top: 14px;
  border-top: 1px solid var(--app-border);
}

.chord-dict-panel__quality-group-label {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--app-text-hint);
}

.chord-dict-panel__quality-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chord-dict-panel__quality-pill {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
}

@media (max-width: 900px) {
  .chord-dict-panel__result {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .chord-dict-panel__play-button {
    justify-self: center;
  }

  .chord-dict-panel__settings {
    grid-template-columns: minmax(0, 1fr);
  }

  .chord-dict-panel__note-grid {
    grid-template-columns: repeat(6, minmax(2.25rem, 1fr));
  }
}
</style>

