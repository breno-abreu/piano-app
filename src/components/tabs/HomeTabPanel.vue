<template>
  <div
    id="controls-panel-home"
    role="tabpanel"
    class="recorder-section__panel home-tab-panel"
    aria-labelledby="controls-tab-home"
  >
    <header class="home-tab-panel__header">
      <p class="home-tab-panel__eyebrow">Início</p>
      <h2 class="home-tab-panel__title">Escolha uma área para começar</h2>
      <p class="home-tab-panel__subtitle">
        Acesse rapidamente gravação, reprodução, teoria musical e figuras rítmicas.
      </p>
    </header>

    <div class="home-tab-panel__grid">
      <button
        v-for="card in bentoCards"
        :key="card.id"
        type="button"
        class="home-tab-panel__card"
        :data-card-id="card.id"
        @click="$emit('select-tab', card.id)"
      >
        <span class="home-tab-panel__card-icon" aria-hidden="true">
          <ControlTabIcon :name="card.icon" />
        </span>
        <span class="home-tab-panel__card-body">
          <span class="home-tab-panel__card-title">{{ card.label }}</span>
          <span class="home-tab-panel__card-description">{{ card.description }}</span>
        </span>
        <span class="home-tab-panel__card-action" aria-hidden="true">Abrir</span>
      </button>
    </div>
  </div>
</template>

<script>
import ControlTabIcon from '../ControlTabIcon.vue'

export default {
  name: 'HomeTabPanel',
  components: {
    ControlTabIcon,
  },
  props: {
    cards: {
      type: Array,
      required: true,
    },
  },
  emits: ['select-tab'],
  computed: {
    bentoCards() {
      const importanceOrder = [
        'playback',
        'recording',
        'harmonic',
        'chordDictionary',
        'rhythmicFigures',
      ]

      return [...this.cards].sort((cardA, cardB) => {
        const cardAIndex = importanceOrder.indexOf(cardA.id)
        const cardBIndex = importanceOrder.indexOf(cardB.id)
        const normalizedAIndex = cardAIndex === -1 ? importanceOrder.length : cardAIndex
        const normalizedBIndex = cardBIndex === -1 ? importanceOrder.length : cardBIndex

        return normalizedAIndex - normalizedBIndex
      })
    },
  },
}
</script>

<style scoped>
.home-tab-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
}

.home-tab-panel__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.home-tab-panel__eyebrow {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--app-accent);
}

.home-tab-panel__title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--app-heading);
}

.home-tab-panel__subtitle {
  max-width: 42rem;
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--app-subtitle);
}

.home-tab-panel__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-auto-rows: minmax(112px, auto);
  gap: 14px;
}

.home-tab-panel__card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 14px;
  min-height: 132px;
  margin: 0;
  padding: 18px;
  border: 1px solid var(--app-border-card);
  border-radius: 18px;
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.12s ease,
    border-color 0.15s ease;
}

.home-tab-panel__card[data-card-id='playback'] {
  grid-column: span 3;
  grid-row: span 2;
  min-height: 278px;
  align-content: start;
  padding: 22px;
}

.home-tab-panel__card[data-card-id='recording'],
.home-tab-panel__card[data-card-id='harmonic'] {
  grid-column: span 3;
}

.home-tab-panel__card[data-card-id='chordDictionary'] {
  grid-column: span 4;
}

.home-tab-panel__card[data-card-id='rhythmicFigures'] {
  grid-column: span 2;
}

.home-tab-panel__card:hover {
  border-color: rgba(17, 24, 39, 0.22);
  background: #f9fafb;
  box-shadow:
    var(--neu-raised),
    0 12px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.home-tab-panel__card:hover .home-tab-panel__card-icon {
  box-shadow:
    var(--neu-pressed),
    0 0 0 1px rgba(17, 24, 39, 0.14);
}

.home-tab-panel__card:hover .home-tab-panel__card-action {
  color: var(--app-heading);
}

.home-tab-panel__card:active {
  box-shadow: var(--neu-pressed);
  transform: translateY(0);
}

.home-tab-panel__card:focus-visible {
  outline: 2px solid var(--app-accent);
  outline-offset: 3px;
}

.home-tab-panel__card-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #ffffff;
  color: var(--app-accent);
  box-shadow: var(--neu-pressed);
}

.home-tab-panel__card-icon :deep(.control-tab-icon) {
  width: 1.45rem;
  height: 1.45rem;
}

.home-tab-panel__card[data-card-id='playback'] .home-tab-panel__card-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
}

.home-tab-panel__card[data-card-id='playback'] .home-tab-panel__card-icon :deep(.control-tab-icon) {
  width: 1.75rem;
  height: 1.75rem;
}

.home-tab-panel__card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.home-tab-panel__card-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--app-heading);
}

.home-tab-panel__card[data-card-id='playback'] .home-tab-panel__card-title {
  font-size: 1.08rem;
}

.home-tab-panel__card-description {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--app-text-muted);
}

.home-tab-panel__card-action {
  grid-column: 2;
  justify-self: start;
  align-self: end;
  margin-top: 4px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--app-accent);
}

@media (max-width: 1080px) {
  .home-tab-panel__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: auto;
  }

  .home-tab-panel__card,
  .home-tab-panel__card[data-card-id='recording'],
  .home-tab-panel__card[data-card-id='playback'],
  .home-tab-panel__card[data-card-id='harmonic'],
  .home-tab-panel__card[data-card-id='chordDictionary'],
  .home-tab-panel__card[data-card-id='rhythmicFigures'] {
    grid-column: span 1;
    grid-row: auto;
    min-height: 132px;
  }
}
</style>
