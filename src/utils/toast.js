const listeners = new Set()
let toastId = 0

export function showToast({
  message,
  type = 'error',
  duration = 5200,
} = {}) {
  if (!message) return null

  const id = ++toastId
  const toast = { id, message, type, duration }

  for (const listener of listeners) {
    listener(toast)
  }

  return id
}

export function subscribeToToasts(listener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
