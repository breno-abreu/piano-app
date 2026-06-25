import { defineStore } from 'pinia'
import {
  loadOptionsPreferences,
  OPTIONS_PREFERENCE_DEFAULTS,
  saveOptionsPreferences,
} from '../utils/userPreferences.js'

const preferenceKeys = Object.keys(OPTIONS_PREFERENCE_DEFAULTS)

export const useOptionsPreferencesStore = defineStore('optionsPreferences', {
  state: () => ({
    ...OPTIONS_PREFERENCE_DEFAULTS,
  }),
  actions: {
    hydrate(bounds) {
      this.$patch(loadOptionsPreferences(bounds))
    },
    persist() {
      const preferences = {}

      for (const key of preferenceKeys) {
        preferences[key] = this[key]
      }

      saveOptionsPreferences(preferences)
    },
    updatePreference(key, value) {
      if (!preferenceKeys.includes(key)) return

      this[key] = value
      this.persist()
    },
  },
})
