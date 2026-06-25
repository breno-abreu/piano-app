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
        v-for="card in cards"
        :key="card.id"
        type="button"
        class="home-tab-panel__card"
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
    box-shadow 0.15s ease,
    transform 0.12s ease,
    border-color 0.15s ease;
}

.home-tab-panel__card:hover {
  border-color: rgba(251, 191, 36, 0.22);
  box-shadow: var(--neu-raised);
  transform: translateY(-1px);
}

.home-tab-panel__card:active {
  box-shadow: var(--neu-pressed);
  transform: translateY(0);
}

.home-tab-panel__card:focus-visible {
  outline: 2px solid #fbbf24;
  outline-offset: 3px;
}

.home-tab-panel__card-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(251, 191, 36, 0.1);
  color: var(--app-accent);
  box-shadow: var(--neu-pressed);
}

.home-tab-panel__card-icon :deep(.control-tab-icon) {
  width: 1.45rem;
  height: 1.45rem;
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
  }
}
</style>
