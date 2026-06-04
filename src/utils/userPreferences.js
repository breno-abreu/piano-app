const STORAGE_KEY = 'pianoapp:preferences'

export const VIEW_ZOOM_DEFAULT = 1
export const VIEW_ZOOM_MIN = 0.25
export const VIEW_ZOOM_MAX = 2
export const VIEW_ZOOM_STEP = 0.05

export const OPTIONS_PREFERENCE_DEFAULTS = {
  showKeyLabels: false,
  keyLabelNotation: 'western',
  keyboardHeight: 220,
  viewZoom: VIEW_ZOOM_DEFAULT,
}

function clampViewZoom(value, fallback = VIEW_ZOOM_DEFAULT) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  const clamped = Math.max(VIEW_ZOOM_MIN, Math.min(VIEW_ZOOM_MAX, value))
  const steps = Math.round((clamped - VIEW_ZOOM_MIN) / VIEW_ZOOM_STEP)

  return Math.round((VIEW_ZOOM_MIN + steps * VIEW_ZOOM_STEP) * 100) / 100
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
  prefs.viewZoom = clampViewZoom(raw?.viewZoom)

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
