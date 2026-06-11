<template>
  <div class="piano-roll" aria-hidden="true">
    <div class="piano-roll__grid">
      <span
        v-for="key in whiteKeys"
        :key="key.id"
        class="piano-roll__lane"
        :style="{ width: `${whiteLaneWidth}%` }"
      />
    </div>
    <div class="piano-roll__notes">
      <div
        v-for="note in visibleNotes"
        :key="note.id"
        class="piano-roll__note"
        :class="{ 'piano-roll__note--black': note.isBlack }"
        :style="note.style"
      >
        <span
          class="piano-roll__note-fill"
          :style="{ opacity: note.velocityAlpha }"
        />
      </div>
    </div>
    <div class="piano-roll__hit-line" />
  </div>
</template>

<script>
import { buildKeyLayoutMap, getVisiblePianoRollNotes, PIANO_ROLL_FALL_MS } from '../utils/midiPianoRoll.js'

export default {
  name: 'PianoRoll',
  props: {
    notes: {
      type: Array,
      default: () => [],
    },
    positionMs: {
      type: Number,
      default: 0,
    },
    whiteKeys: {
      type: Array,
      required: true,
    },
    blackKeys: {
      type: Array,
      required: true,
    },
    whiteKeyCount: {
      type: Number,
      required: true,
    },
    blackKeyWidthPercent: {
      type: Number,
      required: true,
    },
    fallTimeMs: {
      type: Number,
      default: PIANO_ROLL_FALL_MS,
    },
  },
  computed: {
    whiteLaneWidth() {
      return 100 / this.whiteKeyCount
    },
    keyLayout() {
      return buildKeyLayoutMap(
        this.whiteKeys,
        this.blackKeys,
        this.whiteKeyCount,
        this.blackKeyWidthPercent,
      )
    },
    visibleNotes() {
      return getVisiblePianoRollNotes(
        this.notes,
        this.positionMs,
        this.keyLayout,
        this.fallTimeMs,
      )
    },
  },
}
</script>

<style scoped>
.piano-roll {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  background: var(--app-piano-roll-bg);
  box-shadow: var(--app-piano-roll-inset-shadow);
}

.piano-roll__grid {
  position: absolute;
  inset: 0;
  display: flex;
  pointer-events: none;
}

.piano-roll__lane {
  flex-shrink: 0;
  height: 100%;
  border-right: 1px solid var(--app-piano-roll-lane-border);
}

.piano-roll__lane:first-child {
  border-left: 1px solid var(--app-piano-roll-lane-border);
}

.piano-roll__notes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.piano-roll__note {
  position: absolute;
  box-sizing: border-box;
  padding: 0 1px;
  z-index: 1;
}

.piano-roll__note--black {
  z-index: 2;
  padding: 0;
}

.piano-roll__note-fill {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 4px 4px 2px 2px;
  background: var(--app-piano-roll-note-bg);
  box-shadow: var(--app-piano-roll-note-shadow);
}

.piano-roll__note--black .piano-roll__note-fill {
  border-radius: 3px 3px 2px 2px;
  background: var(--app-piano-roll-note-black-bg);
}

.piano-roll__hit-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--app-piano-roll-hit-line);
  box-shadow: var(--app-piano-roll-hit-line-shadow);
  z-index: 3;
  pointer-events: none;
}
</style>
