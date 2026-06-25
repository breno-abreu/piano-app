<template>
  <section class="metronome-popover-panel" aria-label="Metrônomo">
    <header class="metronome-popover-panel__header">
      <p class="metronome-popover-panel__eyebrow">Metrônomo</p>
      <h2 class="metronome-popover-panel__title">
        {{ metronomeRunning ? 'Marcando o tempo' : 'Controle de tempo' }}
      </h2>
    </header>

    <div class="metronome-popover-panel__controls">
      <button
        type="button"
        class="recorder-section__button recorder-section__button--metronome"
        :class="{ 'recorder-section__button--metronome-active': metronomeRunning }"
        :aria-label="metronomeRunning ? 'Parar metrônomo' : 'Iniciar metrônomo'"
        @click="$emit('toggle-metronome')"
      >
        <span
          v-if="!metronomeRunning"
          class="recorder-section__icon recorder-section__icon--metronome-play"
        />
        <span
          v-else
          class="recorder-section__icon recorder-section__icon--metronome-stop"
        />
      </button>

      <div class="recorder-section__bpm metronome-popover-panel__bpm">
        <button
          type="button"
          class="recorder-section__bpm-step"
          aria-label="Diminuir andamento"
          @click="$emit('change-metronome-bpm', -1)"
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
          {{ metronomeBpm }} BPM
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
          @click="$emit('change-metronome-bpm', 1)"
        >
          <span class="recorder-section__bpm-step-glyph" aria-hidden="true">+</span>
        </button>
      </div>
    </div>

    <div class="metronome-popover-panel__signatures" aria-label="Fórmula de compasso">
      <button
        v-for="signature in metronomeTimeSignatures"
        :key="signature"
        type="button"
        class="recorder-section__pill recorder-section__pill--time"
        :class="{ 'recorder-section__pill--active': metronomeTimeSignature === signature }"
        :aria-pressed="metronomeTimeSignature === signature"
        @click="$emit('set-metronome-time-signature', signature)"
      >
        {{ signature }}
      </button>
    </div>

    <div
      class="recorder-section__beat-dots metronome-popover-panel__beats"
      :class="{ 'metronome-popover-panel__beats--idle': !metronomeRunning }"
      aria-hidden="true"
    >
      <span
        v-for="beatIndex in metronomeBeatCount"
        :key="beatIndex"
        class="recorder-section__beat-dot"
        :class="beatDotClass(beatIndex - 1)"
      />
    </div>
  </section>
</template>

<script>
export default {
  name: 'MetronomePopoverPanel',
  props: {
    metronomeRunning: { type: Boolean, required: true },
    metronomeBpm: { type: Number, required: true },
    metronomeTimeSignatures: { type: Array, required: true },
    metronomeTimeSignature: { type: String, required: true },
    metronomeBeatCount: { type: Number, required: true },
    metronomeCurrentBeat: { type: Number, required: true },
  },
  emits: [
    'toggle-metronome',
    'change-metronome-bpm',
    'update:metronome-bpm',
    'set-metronome-time-signature',
  ],
  data() {
    return {
      bpmEditing: false,
      bpmDraft: '',
    }
  },
  methods: {
    beatDotClass(beatIndex) {
      const isCurrent = this.metronomeRunning && this.metronomeCurrentBeat === beatIndex

      return {
        'recorder-section__beat-dot--current': isCurrent,
        'recorder-section__beat-dot--strong': beatIndex === 0 && !isCurrent,
      }
    },
    startBpmEdit() {
      this.bpmDraft = String(this.metronomeBpm)
      this.bpmEditing = true

      this.$nextTick(() => {
        const input = this.$refs.bpmInput
        if (!input) return

        input.focus()
        input.select()
      })
    },
    commitBpm() {
      if (!this.bpmEditing) return

      const parsed = Number.parseInt(this.bpmDraft, 10)
      if (Number.isFinite(parsed)) {
        this.$emit('update:metronome-bpm', parsed)
      }

      this.bpmEditing = false
    },
    cancelBpmEdit() {
      this.bpmEditing = false
    },
  },
}
</script>

<style scoped>
.metronome-popover-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(24rem, calc(100vw - 32px));
  padding: 18px;
  border: 1px solid var(--app-border-card);
  border-radius: 20px;
  background: var(--neu-surface);
  box-shadow: var(--neu-raised-sm);
}

.metronome-popover-panel__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--app-border-subtle);
}

.metronome-popover-panel__eyebrow {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--app-accent);
}

.metronome-popover-panel__title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--app-heading);
}

.metronome-popover-panel__controls,
.metronome-popover-panel__signatures {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.metronome-popover-panel__bpm {
  min-width: 11rem;
}

.metronome-popover-panel__beats {
  justify-content: center;
  margin-top: 0;
}

.metronome-popover-panel__beats--idle {
  opacity: 0.48;
}
</style>
