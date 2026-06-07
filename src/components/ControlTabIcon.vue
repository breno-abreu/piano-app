<template>
  <svg
    class="control-tab-icon"
    :viewBox="name === 'harmonic' ? '0 0 640 640' : '0 0 24 24'"
    :fill="name === 'harmonic' ? 'currentColor' : 'none'"
    :stroke="name === 'harmonic' ? 'none' : 'currentColor'"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Gravação -->
    <template v-if="name === 'recording'">
      <circle cx="12" cy="12" r="4.25" />
    </template>

    <!-- Reprodução -->
    <template v-else-if="name === 'playback'">
      <path d="M9.5 7.75 17.25 12 9.5 16.25V7.75Z" />
    </template>

    <!-- Opções -->
    <template v-else-if="name === 'options'">
      <circle cx="12" cy="12" r="2.75" />
      <path
        d="M12 3.25v2.1M12 18.65v2.1M5.01 5.01l1.49 1.49M17.5 17.5l1.49 1.49M3.25 12h2.1M18.65 12h2.1M5.01 18.99l1.49-1.49M17.5 6.5l1.49-1.49"
      />
    </template>

    <!-- Campos harmônicos — Font Awesome Free (piano) -->
    <template v-else-if="name === 'harmonic'">
      <path
        d="M532 71C539.6 77.1 544 86.3 544 96L544 400C544 444.2 501 480 448 480C395 480 352 444.2 352 400C352 355.8 395 320 448 320C459.2 320 470 321.6 480 324.6L480 207.9L256 257.7L256 464C256 508.2 213 544 160 544C107 544 64 508.2 64 464C64 419.8 107 384 160 384C171.2 384 182 385.6 192 388.6L192 160C192 145 202.4 132 217.1 128.8L505.1 64.8C514.6 62.7 524.5 65 532.1 71.1z"
      />
    </template>

    <!-- Dicionário de acordes -->
    <template v-else-if="name === 'chord-dictionary'">
      <path d="M6.5 5.75h11a1.25 1.25 0 0 1 1.25 1.25v13a1.25 1.25 0 0 1-1.25 1.25h-11A1.25 1.25 0 0 1 5.25 20V7A1.25 1.25 0 0 1 6.5 5.75Z" />
      <path d="M8.25 9.5h7.5M8.25 12h5.5M8.25 14.5h6.75" />
      <circle cx="16.25" cy="16.25" r="2.75" />
      <path d="M16.25 14.1v4.3M14.6 16.25h3.3" />
    </template>

    <!-- Figuras rítmicas -->
    <template v-else-if="name === 'rhythmic-figures'">
      <path d="M5.5 6.25h13v11.5H5.5z" />
      <path d="M8 9.25h1.75v5.5M10.5 10.75h1.75v3.5M13 9.75h1.75v4.5M15.5 11.25h1.75v2.5" />
      <path d="M7.25 17.75h9.5" />
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
        [
          'recording',
          'playback',
          'options',
          'harmonic',
          'chord-dictionary',
          'rhythmic-figures',
        ].includes(
          value,
        ),
    },
  },
}
</script>

<style scoped>
.control-tab-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  shape-rendering: geometricPrecision;
}
</style>
