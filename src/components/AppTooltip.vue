<template>
  <span
    ref="root"
    class="app-tooltip"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="onFocusOut"
  >
    <span class="app-tooltip__trigger">
      <slot />
    </span>

    <Teleport to="body">
      <Transition name="app-tooltip-fade">
        <span
          v-if="visible && text"
          ref="bubble"
          role="tooltip"
          class="app-tooltip__bubble"
          :style="bubbleStyle"
        >
          {{ text }}
        </span>
      </Transition>
    </Teleport>
  </span>
</template>

<script>
const VIEWPORT_PADDING = 10

export default {
  name: 'AppTooltip',
  props: {
    text: {
      type: String,
      default: '',
    },
    placement: {
      type: String,
      default: 'top',
      validator: (value) => ['top', 'bottom', 'right', 'left'].includes(value),
    },
    showDelay: {
      type: Number,
      default: 280,
    },
  },
  data() {
    return {
      visible: false,
      bubbleStyle: {},
      showTimer: null,
    }
  },
  beforeUnmount() {
    this.clearShowTimer()
    this.removeViewportListeners()
  },
  methods: {
    clearShowTimer() {
      if (this.showTimer) {
        clearTimeout(this.showTimer)
        this.showTimer = null
      }
    },
    getTriggerRect() {
      const root = this.$refs.root
      return root instanceof HTMLElement ? root.getBoundingClientRect() : null
    },
    updatePosition() {
      const rect = this.getTriggerRect()
      if (!rect) return

      const offset = 10
      let top = 0
      let left = 0
      let transform = ''

      if (this.placement === 'right') {
        top = rect.top + rect.height / 2
        left = rect.right + offset
        transform = 'translateY(-50%)'
      } else if (this.placement === 'left') {
        top = rect.top + rect.height / 2
        left = rect.left - offset
        transform = 'translate(-100%, -50%)'
      } else if (this.placement === 'bottom') {
        top = rect.bottom + offset
        left = rect.left + rect.width / 2
        transform = 'translateX(-50%)'
      } else {
        top = rect.top - offset
        left = rect.left + rect.width / 2
        transform = 'translate(-50%, -100%)'
      }

      this.bubbleStyle = {
        top: `${top}px`,
        left: `${left}px`,
        transform,
      }

      this.$nextTick(() => this.clampToViewport())
    },
    clampToViewport() {
      const bubble = this.$refs.bubble
      if (!(bubble instanceof HTMLElement)) return

      const bubbleRect = bubble.getBoundingClientRect()
      const currentTop = Number.parseFloat(this.bubbleStyle.top) || 0
      const currentLeft = Number.parseFloat(this.bubbleStyle.left) || 0

      let deltaX = 0
      let deltaY = 0

      if (bubbleRect.left < VIEWPORT_PADDING) {
        deltaX = VIEWPORT_PADDING - bubbleRect.left
      } else if (bubbleRect.right > window.innerWidth - VIEWPORT_PADDING) {
        deltaX = (window.innerWidth - VIEWPORT_PADDING) - bubbleRect.right
      }

      if (bubbleRect.top < VIEWPORT_PADDING) {
        deltaY = VIEWPORT_PADDING - bubbleRect.top
      } else if (bubbleRect.bottom > window.innerHeight - VIEWPORT_PADDING) {
        deltaY = (window.innerHeight - VIEWPORT_PADDING) - bubbleRect.bottom
      }

      if (deltaX !== 0 || deltaY !== 0) {
        this.bubbleStyle = {
          ...this.bubbleStyle,
          top: `${currentTop + deltaY}px`,
          left: `${currentLeft + deltaX}px`,
        }
      }
    },
    addViewportListeners() {
      this.onViewportChange = () => {
        if (this.visible) {
          this.updatePosition()
        }
      }

      window.addEventListener('scroll', this.onViewportChange, true)
      window.addEventListener('resize', this.onViewportChange)
    },
    removeViewportListeners() {
      if (!this.onViewportChange) return

      window.removeEventListener('scroll', this.onViewportChange, true)
      window.removeEventListener('resize', this.onViewportChange)
      this.onViewportChange = null
    },
    show() {
      if (!this.text) return

      this.clearShowTimer()
      this.showTimer = setTimeout(() => {
        this.visible = true
        this.addViewportListeners()
        this.$nextTick(() => {
          this.updatePosition()
        })
        this.showTimer = null
      }, this.showDelay)
    },
    hide() {
      this.clearShowTimer()
      this.visible = false
      this.removeViewportListeners()
    },
    onFocusOut(event) {
      const root = this.$refs.root
      if (root instanceof HTMLElement && event.relatedTarget instanceof Node) {
        if (root.contains(event.relatedTarget)) return
      }

      this.hide()
    },
  },
}
</script>

<style scoped>
.app-tooltip {
  display: inline-flex;
  vertical-align: middle;
}

.app-tooltip__trigger {
  display: inline-flex;
}
</style>

<style>
.app-tooltip__bubble {
  position: fixed;
  z-index: 10000;
  width: max-content;
  max-width: min(18rem, calc(100vw - 20px));
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(251, 191, 36, 0.22);
  background: #25252d;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0.01em;
  color: rgba(243, 244, 246, 0.92);
  text-align: center;
  pointer-events: none;
}

.app-tooltip-fade-enter-active,
.app-tooltip-fade-leave-active {
  transition: opacity 0.14s ease;
}

.app-tooltip-fade-enter-from,
.app-tooltip-fade-leave-to {
  opacity: 0;
}
</style>
