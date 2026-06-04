<template>
  <svg
    class="control-tab-icon"
    :class="{
      'control-tab-icon--playback': name === 'playback',
      'control-tab-icon--harmonic': name === 'harmonic',
    }"
    :viewBox="name === 'harmonic' ? '0 0 640 640' : '0 0 24 24'"
    :fill="name === 'harmonic' ? 'currentColor' : 'none'"
    :stroke="name === 'harmonic' ? 'none' : 'currentColor'"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Gravação e reprodução -->
    <template v-if="name === 'playback'">
      <circle cx="7.75" cy="12" r="3.65" />
      <path d="M14.5 9.35 19.25 12l-4.75 2.65V9.35Z" />
    </template>

    <!-- Opções -->
    <template v-else-if="name === 'options'">
      <circle cx="12" cy="12" r="2.75" />
      <path
        d="M12 3.25v2.1M12 18.65v2.1M5.01 5.01l1.49 1.49M17.5 17.5l1.49 1.49M3.25 12h2.1M18.65 12h2.1M5.01 18.99l1.49-1.49M17.5 6.5l1.49-1.49"
      />
    </template>

    <!-- Metrônomo -->
    <template v-else-if="name === 'metronome'">
      <path d="M12 3.5v1.75M8.25 5.75l1.05 1.45M15.75 5.75l-1.05 1.45" />
      <path d="M7.25 19.75h9.5L15.6 10.5H8.4L7.25 19.75Z" />
      <path d="M12 10.75v5.25" />
      <circle cx="12" cy="10.75" r="1" fill="currentColor" stroke="none" />
    </template>

    <!-- Vídeo da tela -->
    <template v-else-if="name === 'screen'">
      <rect x="3.75" y="5.75" width="16.5" height="10.5" rx="1.5" />
      <path d="M8.25 18.75h7.5" />
    </template>

    <!-- Campos harmônicos — Font Awesome Free (piano) -->
    <template v-else-if="name === 'harmonic'">
      <path
        d="M532 71C539.6 77.1 544 86.3 544 96L544 400C544 444.2 501 480 448 480C395 480 352 444.2 352 400C352 355.8 395 320 448 320C459.2 320 470 321.6 480 324.6L480 207.9L256 257.7L256 464C256 508.2 213 544 160 544C107 544 64 508.2 64 464C64 419.8 107 384 160 384C171.2 384 182 385.6 192 388.6L192 160C192 145 202.4 132 217.1 128.8L505.1 64.8C514.6 62.7 524.5 65 532.1 71.1z"
      />
    </template>
  </svg>
</template>

<script>
export default {
  name: 'ControlTabIcon',
  props: {
    name: {
      type: String,
      required: true,
      validator: (value) =>
        ['playback', 'options', 'metronome', 'screen', 'harmonic'].includes(
          value,
        ),
    },
  },
}
</script>

<style scoped>
.control-tab-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-shrink: 0;
  shape-rendering: geometricPrecision;
}

.control-tab-icon--playback {
  width: 1.45rem;
  height: 1.45rem;
}

.control-tab-icon--harmonic {
  width: 1.05rem;
  height: 1.05rem;
}
</style>
