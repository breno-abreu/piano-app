const STORAGE_KEY = 'pianoapp:preferences'

export const OPTIONS_PREFERENCE_DEFAULTS = {
  showKeyLabels: false,
  keyLabelNotation: 'western',
  keyboardHeight: 220,
}

function clampKeyboardHeight(
  value,
  { min, max, step, fallback },
) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  const clamped = Math.max(min, Math.min(max, value))
  const steps = Math.round((clamped - min) / step)

  return min + steps * step
}

function sanitizeOptionsPreferences(raw, bounds) {
  const prefs = { ...OPTIONS_PREFERENCE_DEFAULTS }

  if (typeof raw?.showKeyLabels === 'boolean') {
    prefs.showKeyLabels = raw.showKeyLabels
  }

  if (raw?.keyLabelNotation === 'western' || raw?.keyLabelNotation === 'solfege') {
    prefs.keyLabelNotation = raw.keyLabelNotation
  }

  prefs.keyboardHeight = clampKeyboardHeight(raw?.keyboardHeight, bounds)

  return prefs
}

export function loadOptionsPreferences(bounds) {
  if (typeof localStorage === 'undefined') {
    return { ...OPTIONS_PREFERENCE_DEFAULTS, keyboardHeight: bounds.fallback }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return sanitizeOptionsPreferences({}, bounds)
    }

    const parsed = JSON.parse(stored)

    return sanitizeOptionsPreferences(parsed?.options ?? parsed, bounds)
  } catch {
    return sanitizeOptionsPreferences({}, bounds)
  }
}

export function saveOptionsPreferences(preferences) {
  if (typeof localStorage === 'undefined') return

  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    let payload = { version: 1 }

    if (existing) {
      try {
        payload = { ...JSON.parse(existing), version: 1 }
      } catch {
        // ignore corrupt payload
      }
    }

    payload.options = preferences
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // quota exceeded or private mode — ignore
  }
}
