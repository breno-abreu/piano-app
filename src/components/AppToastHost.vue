<template>
  <Teleport to="body">
    <div class="app-toast-host" aria-live="polite" aria-relevant="additions">
      <TransitionGroup name="app-toast">
        <article
          v-for="toast in toasts"
          :key="toast.id"
          class="app-toast"
          :class="`app-toast--${toast.type}`"
          role="alert"
        >
          <div class="app-toast__icon" aria-hidden="true">
            <svg
              v-if="toast.type === 'error'"
              class="app-toast__icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <svg
              v-else
              class="app-toast__icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
          </div>

          <p class="app-toast__message">{{ toast.message }}</p>

          <button
            type="button"
            class="app-toast__close"
            :aria-label="`Fechar aviso: ${toast.message}`"
            @click="dismissToast(toast.id)"
          >
            <svg
              class="app-toast__close-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { subscribeToToasts } from '../utils/toast.js'

export default {
  name: 'AppToastHost',
  data() {
    return {
      toasts: [],
      timers: new Map(),
      unsubscribe: null,
    }
  },
  mounted() {
    this.unsubscribe = subscribeToToasts((toast) => {
      this.pushToast(toast)
    })
  },
  beforeUnmount() {
    this.unsubscribe?.()

    for (const timerId of this.timers.values()) {
      clearTimeout(timerId)
    }

    this.timers.clear()
  },
  methods: {
    pushToast(toast) {
      this.toasts.push(toast)

      if (toast.duration > 0) {
        const timerId = setTimeout(() => {
          this.dismissToast(toast.id)
        }, toast.duration)

        this.timers.set(toast.id, timerId)
      }
    },
    dismissToast(id) {
      const timerId = this.timers.get(id)

      if (timerId) {
        clearTimeout(timerId)
        this.timers.delete(id)
      }

      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
}
</script>

<style>
.app-toast-host {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  width: min(22rem, calc(100vw - 32px));
  pointer-events: none;
}

.app-toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 14px 14px 14px 12px;
  border-radius: 14px;
  background: var(--app-tooltip-bg);
  box-shadow:
    var(--neu-raised-sm),
    0 12px 28px rgba(0, 0, 0, 0.22);
  pointer-events: auto;
}

.app-toast--error {
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.app-toast--warning {
  border: 1px solid rgba(251, 191, 36, 0.35);
}

.app-toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.app-toast--error .app-toast__icon {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.app-toast--warning .app-toast__icon {
  background: rgba(251, 191, 36, 0.12);
  color: var(--app-accent);
}

.app-toast__icon-svg {
  width: 1.25rem;
  height: 1.25rem;
}

.app-toast__message {
  flex: 1;
  margin: 0;
  padding-top: 2px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.45;
  color: var(--app-tooltip-text);
}

.app-toast__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--app-text-muted);
  cursor: pointer;
  transition:
    color 0.12s ease,
    background-color 0.12s ease;
}

.app-toast__close-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.app-toast__close:hover {
  color: var(--app-text);
  background: var(--app-hover-bg);
}

.app-toast__close:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.app-toast-enter-active,
.app-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.22s ease;
}

.app-toast-enter-from,
.app-toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

.app-toast-move {
  transition: transform 0.22s ease;
}
</style>
