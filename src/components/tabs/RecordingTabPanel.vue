<template>
  <div
    id="controls-panel-recording"
    role="tabpanel"
    class="recorder-section__panel recorder-section__panel--recording"
    aria-labelledby="controls-tab-recording"
  >
    <div class="recorder-section__inner">
      <span class="recorder-section__label">MIDI</span>
      <AppTooltip :text="midiRecordTooltip">
        <button
          type="button"
          class="recorder-section__button"
          :class="{ 'recorder-section__button--recording': isRecording }"
          :aria-label="isRecording ? 'Parar gravação MIDI' : 'Gravar performance MIDI'"
          @click="$emit('toggle-recording')"
        >
          <span
            v-if="!isRecording"
            class="recorder-section__icon recorder-section__icon--record"
          />
          <span
            v-else
            class="recorder-section__icon recorder-section__icon--stop"
          />
        </button>
      </AppTooltip>

      <span class="recorder-section__divider" aria-hidden="true" />

      <span class="recorder-section__label">Tela</span>
      <AppTooltip :text="screenRecordTooltip">
        <button
          type="button"
          class="recorder-section__button"
          :class="{ 'recorder-section__button--recording': isScreenRecording }"
          :disabled="!screenRecordingSupported"
          :aria-label="isScreenRecording ? 'Parar gravação de tela' : screenRecordAriaLabel"
          @click="$emit('toggle-screen-recording')"
        >
          <span
            v-if="!isScreenRecording"
            class="recorder-section__icon recorder-section__icon--record"
          />
          <span
            v-else
            class="recorder-section__icon recorder-section__icon--stop"
          />
        </button>
      </AppTooltip>

      <span class="recorder-section__divider" aria-hidden="true" />

      <span class="recorder-section__label">Metrônomo</span>
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
      <div class="recorder-section__bpm">
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
      v-if="metronomeRunning"
      class="recorder-section__beat-dots"
      aria-hidden="true"
    >
      <span
        v-for="beatIndex in metronomeBeatCount"
        :key="beatIndex"
        class="recorder-section__beat-dot"
        :class="beatDotClass(beatIndex - 1)"
      />
    </div>
  </div>
</template>

<script>
import AppTooltip from '../AppTooltip.vue'

export default {
  name: 'RecordingTabPanel',
  components: {
    AppTooltip,
  },
  props: {
    isRecording: { type: Boolean, required: true },
    isScreenRecording: { type: Boolean, required: true },
    screenRecordingSupported: { type: Boolean, required: true },
    screenRecordAriaLabel: { type: String, required: true },
    screenRecordingHint: { type: String, required: true },
    screenRecordingIdleHint: { type: String, required: true },
    metronomeRunning: { type: Boolean, required: true },
    metronomeBpm: { type: Number, required: true },
    metronomeTimeSignatures: { type: Array, required: true },
    metronomeTimeSignature: { type: String, required: true },
    metronomeBeatCount: { type: Number, required: true },
    metronomeCurrentBeat: { type: Number, required: true },
  },
  emits: [
    'toggle-recording',
    'toggle-screen-recording',
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
  computed: {
    midiRecordTooltip() {
      if (this.isRecording) {
        return 'Gravando… Clique para parar e salvar o arquivo MIDI.'
      }

      return 'Grava a performance em arquivo MIDI com o BPM do metrônomo. Atalho: tecla R.'
    },
    screenRecordTooltip() {
      if (!this.screenRecordingSupported) {
        return 'Gravação de tela não suportada neste navegador.'
      }

      if (this.isScreenRecording) {
        return this.screenRecordingHint
      }

      return this.screenRecordingIdleHint
    },
  },
  methods: {
    beatDotClass(beatIndex) {
      const isCurrent = this.metronomeCurrentBeat === beatIndex

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
