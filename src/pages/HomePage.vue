<template>
  <main class="home-page">
    <PianoKeyboard class="home-page__piano" />
  </main>
</template>

<script>
import PianoKeyboard from '../components/PianoKeyboard.vue'

export default {
  name: 'HomePage',
  components: {
    PianoKeyboard,
  },
}
</script>

<style scoped>
.home-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0;
  overflow: hidden;
}

.home-page__piano {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
