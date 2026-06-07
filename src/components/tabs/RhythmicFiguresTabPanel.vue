<template>
  <div
    id="controls-panel-rhythmic-figures"
    role="tabpanel"
    class="recorder-section__panel recorder-section__panel--rhythmic-figures"
    aria-labelledby="controls-tab-rhythmic-figures"
  >
    <RhythmicFiguresPanel />
  </div>
</template>

<script>
import RhythmicFiguresPanel from '../RhythmicFiguresPanel.vue'

export default {
  name: 'RhythmicFiguresTabPanel',
  components: {
    RhythmicFiguresPanel,
  },
}
</script>
