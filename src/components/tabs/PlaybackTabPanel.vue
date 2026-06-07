<template>
  <div>
    <div
      id="controls-panel-playback"
      role="tabpanel"
      class="recorder-section__panel"
      aria-labelledby="controls-tab-playback"
    >
      <div class="recorder-section__inner">
        <span class="recorder-section__label">Arquivo</span>
        <input
          ref="midiFileInput"
          type="file"
          accept=".mid,audio/midi,audio/x-midi"
          class="recorder-section__file-input"
          @change="onFileSelected"
        />
        <button
          type="button"
          class="recorder-section__pill recorder-section__pill--file"
          @click="openFilePicker"
        >
          Arquivo
        </button>
        <span
          v-if="midiFileName"
          class="recorder-section__file-name"
          :title="midiFileName"
        >
          {{ midiFileName }}
        </span>
        <button
          v-if="midiPlaybackReady"
          type="button"
          class="recorder-section__pill recorder-section__pill--remove-file"
          aria-label="Remover arquivo MIDI carregado"
          @click="$emit('remove-file')"
        >
          Remover
        </button>
        <button
          type="button"
          class="recorder-section__button recorder-section__button--play"
          :class="{ 'recorder-section__button--pause-mode': playbackStatus === 'playing' }"
          :disabled="!midiPlaybackReady"
          :aria-label="playbackStatus === 'playing' ? 'Pausar reprodução MIDI' : 'Reproduzir arquivo MIDI'"
          @click="$emit('toggle-play-pause')"
        >
          <span
            v-if="playbackStatus !== 'playing'"
            class="recorder-section__icon recorder-section__icon--play"
          />
          <span
            v-else
            class="recorder-section__icon recorder-section__icon--pause"
          />
        </button>
        <button
          type="button"
          class="recorder-section__button recorder-section__button--stop-playback"
          :disabled="!midiPlaybackCanStop"
          aria-label="Parar reprodução MIDI"
          @click="$emit('stop')"
        >
          <span class="recorder-section__icon recorder-section__icon--stop" />
        </button>
        <template v-if="midiPlaybackReady">
          <span class="recorder-section__label">Velocidade</span>
          <div class="recorder-section__bpm">
            <button
              type="button"
              class="recorder-section__bpm-step"
              aria-label="Diminuir velocidade da reprodução"
              @click="$emit('change-playback-bpm', -1)"
            >
              <span class="recorder-section__bpm-step-glyph" aria-hidden="true">−</span>
            </button>
            <button
              v-if="!bpmEditing"
              type="button"
              class="recorder-section__bpm-value"
              :aria-label="playbackBpmAriaLabel"
              @click="startBpmEdit"
            >
              {{ playbackBpm }} BPM
            </button>
            <span v-else class="recorder-section__bpm-edit">
              <input
                ref="bpmInput"
                v-model="bpmDraft"
                type="text"
                inputmode="numeric"
                class="recorder-section__bpm-input"
                aria-label="Velocidade da reprodução em BPM"
                @keydown.enter.prevent="commitBpm"
                @keydown.esc.prevent="cancelBpmEdit"
                @blur="commitBpm"
              />
              <span class="recorder-section__bpm-suffix">BPM</span>
            </span>
            <button
              type="button"
              class="recorder-section__bpm-step"
              aria-label="Aumentar velocidade da reprodução"
              @click="$emit('change-playback-bpm', 1)"
            >
              <span class="recorder-section__bpm-step-glyph" aria-hidden="true">+</span>
            </button>
            <button
              type="button"
              class="recorder-section__pill recorder-section__pill--bpm-reset"
              :disabled="isPlaybackAtOriginalBpm"
              :aria-label="`Restaurar velocidade original (${midiRecordedBpm} BPM)`"
              :title="`Voltar para ${midiRecordedBpm} BPM`"
              @click="$emit('reset-playback-bpm')"
            >
              Original
            </button>
          </div>
        </template>
      </div>
    </div>

    <div
      v-if="showProgress"
      class="recorder-section__progress"
    >
      <button
        type="button"
        class="recorder-section__progress-track"
        :aria-label="playbackProgressAriaLabel"
        :aria-valuenow="Math.round(playbackPositionMs)"
        aria-valuemin="0"
        :aria-valuemax="Math.round(midiDurationMs)"
        @click="$emit('seek', $event)"
      >
        <span
          class="recorder-section__progress-fill"
          :style="{ width: `${playbackProgressPercent}%` }"
        />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlaybackTabPanel',
  props: {
    midiFileName: { type: String, required: true },
    midiPlaybackReady: { type: Boolean, required: true },
    playbackStatus: { type: String, required: true },
    midiPlaybackCanStop: { type: Boolean, required: true },
    playbackBpm: { type: Number, required: true },
    midiRecordedBpm: { type: Number, required: true },
    isPlaybackAtOriginalBpm: { type: Boolean, required: true },
    playbackBpmAriaLabel: { type: String, required: true },
    showProgress: { type: Boolean, default: false },
    playbackProgressPercent: { type: Number, default: 0 },
    playbackProgressAriaLabel: { type: String, default: '' },
    playbackPositionMs: { type: Number, default: 0 },
    midiDurationMs: { type: Number, default: 0 },
  },
  emits: [
    'file-selected',
    'remove-file',
    'toggle-play-pause',
    'stop',
    'change-playback-bpm',
    'update:playback-bpm',
    'reset-playback-bpm',
    'seek',
  ],
  data() {
    return {
      bpmEditing: false,
      bpmDraft: '',
    }
  },
  methods: {
    openFilePicker() {
      const input = this.$refs.midiFileInput
      if (input instanceof HTMLInputElement) {
        input.click()
      }
    },
    onFileSelected(event) {
      const file = event.target.files?.[0] ?? null
      this.$emit('file-selected', file)

      if (event.target instanceof HTMLInputElement) {
        event.target.value = ''
      }
    },
    startBpmEdit() {
      this.bpmDraft = String(this.playbackBpm)
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
        this.$emit('update:playback-bpm', parsed)
      }

      this.bpmEditing = false
    },
    cancelBpmEdit() {
      this.bpmEditing = false
    },
  },
}
</script>
