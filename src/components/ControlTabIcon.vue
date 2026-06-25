<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    class="control-tab-icon"
    :stroke-width="1.75"
    aria-hidden="true"
    focusable="false"
  />

</template>

<script>
import {
  BookOpen,
  CircleDot,
  CirclePlay,
  Home,
  ListMusic,
  Metronome,
  Piano,
  Settings,
} from '@lucide/vue'

const LUCIDE_ICONS = {
  home: Home,
  recording: CircleDot,
  playback: CirclePlay,
  options: Settings,
  harmonic: Piano,
  'chord-dictionary': BookOpen,
  'rhythmic-figures': ListMusic,
  metronome: Metronome,
}

export default {
  name: 'ControlTabIcon',
  props: {
    name: {
      type: String,
      required: true,
      validator: (value) =>
        [
          'home',
          'recording',
          'playback',
          'options',
          'harmonic',
          'chord-dictionary',
          'rhythmic-figures',
          'metronome',
        ].includes(
          value,
        ),
    },
  },
  computed: {
    iconComponent() {
      return LUCIDE_ICONS[this.name] ?? null
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
