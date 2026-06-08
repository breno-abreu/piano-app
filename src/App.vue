<template>
  <HomePage />
  <AppToastHost />
</template>

<script>
import HomePage from './pages/HomePage.vue'
import AppToastHost from './components/AppToastHost.vue'

export default {
  name: 'App',
  components: {
    HomePage,
    AppToastHost,
  },
}
</script>
