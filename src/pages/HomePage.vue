<template>
  <main class="home-page">
    <PianoKeyboard />
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
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
</style>
