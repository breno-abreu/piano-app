<template>
  <slot v-if="deviceMode === 'supported'" />

  <main v-else class="device-gate" :class="`device-gate--${deviceMode}`">
    <section class="device-gate__card" aria-live="polite">
      <div class="device-gate__icon" aria-hidden="true">
        <svg
          v-if="deviceMode === 'rotate-tablet'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M10 18h4" />
          <path d="M3 9a7 7 0 0 1 7-7" />
          <path d="M3 9H1V7" />
          <path d="M21 15a7 7 0 0 1-7 7" />
          <path d="M21 15h2v2" />
        </svg>

        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
          <path d="M11 18h2" />
          <path d="M3 7h2" />
          <path d="M3 12h2" />
          <path d="M3 17h2" />
          <path d="M19 7h2" />
          <path d="M19 12h2" />
          <path d="M19 17h2" />
        </svg>
      </div>

      <p class="device-gate__eyebrow">{{ content.eyebrow }}</p>
      <h1 class="device-gate__title">{{ content.title }}</h1>
      <p class="device-gate__message">{{ content.message }}</p>
      <p class="device-gate__hint">{{ content.hint }}</p>
    </section>
  </main>
</template>

<script>
const SMARTPHONE_MIN_SIDE_MAX = 599
const SMARTPHONE_LANDSCAPE_HEIGHT_MAX = 520
const TABLET_PORTRAIT_WIDTH_MIN = 600
const TABLET_PORTRAIT_WIDTH_MAX = 1023

export default {
  name: 'DeviceGate',
  data() {
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }
  },
  computed: {
    deviceMode() {
      const minSide = Math.min(this.viewportWidth, this.viewportHeight)
      const isPortrait = this.viewportHeight > this.viewportWidth
      const isSmartphone =
        minSide <= SMARTPHONE_MIN_SIDE_MAX ||
        (this.viewportHeight <= SMARTPHONE_LANDSCAPE_HEIGHT_MAX && this.viewportWidth < 1024)

      if (isSmartphone) return 'phone'

      const isTabletPortrait =
        isPortrait &&
        this.viewportWidth >= TABLET_PORTRAIT_WIDTH_MIN &&
        this.viewportWidth <= TABLET_PORTRAIT_WIDTH_MAX

      return isTabletPortrait ? 'rotate-tablet' : 'supported'
    },
    content() {
      if (this.deviceMode === 'rotate-tablet') {
        return {
          eyebrow: 'Modo paisagem recomendado',
          title: 'Gire o tablet para continuar',
          message:
            'O PianoApp usa teclado, controles e leitura musical em uma área horizontal ampla.',
          hint: 'Use o tablet na horizontal para acessar a experiência completa.',
        }
      }

      return {
        eyebrow: 'Tela pequena detectada',
        title: 'Este app foi feito para telas maiores',
        message:
          'A experiência combina piano virtual, painéis de controle e recursos MIDI que não funcionam bem em smartphones.',
        hint: 'Abra em um computador ou em um tablet no modo paisagem.',
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.updateViewport)
    window.addEventListener('orientationchange', this.updateViewport)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateViewport)
    window.removeEventListener('orientationchange', this.updateViewport)
  },
  methods: {
    updateViewport() {
      this.viewportWidth = window.innerWidth
      this.viewportHeight = window.innerHeight
    },
  },
}
</script>

<style scoped>
.device-gate {
  width: 100%;
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(55, 65, 81, 0.08), transparent 34rem),
    linear-gradient(145deg, var(--app-bg), var(--app-main-bg));
  color: var(--app-text);
}

.device-gate__card {
  width: min(100%, 30rem);
  padding: 28px;
  border: 1px solid var(--app-border);
  border-radius: 24px;
  background: color-mix(in srgb, var(--app-shell-bg) 92%, transparent);
  box-shadow: var(--neu-raised-lg);
  text-align: center;
}

.device-gate__icon {
  width: 74px;
  height: 74px;
  margin: 0 auto 22px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: var(--neu-surface);
  color: var(--app-accent);
  box-shadow: var(--neu-pressed);
}

.device-gate__icon svg {
  width: 42px;
  height: 42px;
}

.device-gate__eyebrow {
  margin: 0 0 10px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--app-accent);
}

.device-gate__title {
  margin: 0;
  font-size: clamp(1.65rem, 8vw, 2.4rem);
  line-height: 1.05;
  color: var(--app-heading);
}

.device-gate__message {
  margin: 18px 0 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--app-text-soft);
}

.device-gate__hint {
  margin: 20px 0 0;
  padding: 12px 14px;
  border: 1px solid rgba(55, 65, 81, 0.16);
  border-radius: 14px;
  background: rgba(55, 65, 81, 0.05);
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--app-text);
}

@supports not (background: color-mix(in srgb, black 50%, transparent)) {
  .device-gate__card {
    background: var(--app-shell-bg);
  }
}
</style>
