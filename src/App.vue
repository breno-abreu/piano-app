<template>
  <DeviceGate>
    <HomePage />
    <AppToastHost />
  </DeviceGate>
</template>

<script>
import DeviceGate from './components/DeviceGate.vue'
import HomePage from './pages/HomePage.vue'
import AppToastHost from './components/AppToastHost.vue'

export default {
  name: 'App',
  components: {
    DeviceGate,
    HomePage,
    AppToastHost,
  },
}
</script>
