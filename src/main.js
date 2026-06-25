import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './styles/design-themes.css'
import './styles/recorder-section.css'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
