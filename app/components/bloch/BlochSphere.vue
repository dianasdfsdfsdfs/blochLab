<script setup lang="ts">
import type { Vec3 } from '~/lib/quantum'

const props = withDefaults(defineProps<{
  vector: Vec3
  axis?: Vec3 | null
  trail?: Vec3[]
  flash?: { n: number; outcome: 0 | 1 }
  compact?: boolean
  equatorLabels?: boolean
  label?: string
}>(), {
  axis: null,
  trail: () => [],
  flash: () => ({ n: 0, outcome: 0 }),
  compact: false,
  equatorLabels: true,
  label: 'Interactive 3D Bloch sphere. Drag to rotate the view.',
})

const host = ref<HTMLElement | null>(null)
const ready = ref(false)
const unsupported = ref(false)
let scene: import('~/lib/three/BlochScene').BlochScene | null = null

onMounted(async () => {
  const mod = await import('~/lib/three/BlochScene')
  if (!host.value) return
  if (!mod.webglAvailable()) {
    unsupported.value = true
    return
  }
  const small = window.matchMedia('(max-width: 640px)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  try {
    scene = new mod.BlochScene(host.value, {
      compact: props.compact || small,
      reducedMotion: reduced,
      equatorLabels: props.equatorLabels,
    })
  } catch {
    unsupported.value = true
    return
  }
  scene.setVector(props.vector)
  scene.setAxis(props.axis)
  scene.setTrail(props.trail)
  scene.start()
  ready.value = true
})

watch(() => props.vector, v => scene?.setVector(v))
watch(() => props.axis, a => scene?.setAxis(a))
watch(() => props.trail, t => scene?.setTrail(t))
watch(() => props.flash.n, () => scene?.flash(props.flash.outcome))

onBeforeUnmount(() => {
  scene?.dispose()
  scene = null
})

function onKey(e: KeyboardEvent) {
  const step = 0.12
  if (e.key === 'ArrowLeft') scene?.nudge(-step)
  else if (e.key === 'ArrowRight') scene?.nudge(step)
  else if (e.key === 'ArrowUp') scene?.nudge(0, step)
  else if (e.key === 'ArrowDown') scene?.nudge(0, -step)
  else return
  e.preventDefault()
}
</script>

<template>
  <div
    ref="host"
    class="bloch"
    :class="{ ready }"
    role="img"
    tabindex="0"
    :aria-label="label"
    @keydown="onKey"
  >
    <div class="placeholder" aria-hidden="true">
      <div class="ph-sphere" />
    </div>
    <p v-if="unsupported" class="fallback">Your browser can’t show 3D (WebGL is off). The explanations still work without it.</p>
  </div>
</template>

<style scoped>
.bloch {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.bloch.is-dragging {
  cursor: grabbing;
}
.bloch:focus-visible {
  outline: 2px solid var(--lilac);
  outline-offset: 4px;
}
.bloch :deep(canvas) {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  opacity: 0;
  transition: opacity 0.8s ease;
  /* soften the square edge of the canvas so glow and dust fade out naturally */
  -webkit-mask-image: radial-gradient(closest-side, #000 70%, transparent 100%);
  mask-image: radial-gradient(closest-side, #000 70%, transparent 100%);
}
.bloch.ready :deep(canvas) {
  opacity: 1;
}
.placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transition: opacity 0.8s ease;
}
.bloch.ready .placeholder {
  opacity: 0;
}
.ph-sphere {
  width: 58%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, rgba(109, 75, 216, 0.45), rgba(42, 26, 110, 0.2) 55%, rgba(11, 10, 42, 0.05));
  box-shadow: 0 0 80px -10px rgba(124, 58, 237, 0.6), inset 0 0 40px rgba(192, 132, 252, 0.35);
  border: 1.5px solid rgba(192, 132, 252, 0.55);
}
.fallback {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  font-size: 14px;
  color: var(--muted);
  text-align: center;
}
</style>

<style>
/* Labels are created by Three's CSS2DRenderer, outside Vue's scoped styles. */
.bloch-label {
  font-family: var(--font-mono);
  font-size: 15px;
  line-height: 1;
  color: #ece4ff;
  text-shadow: 0 0 12px rgba(168, 85, 247, 0.9), 0 0 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  transition: opacity 0.2s linear;
}
.bloch-label.pole {
  font-size: 17px;
  font-weight: 500;
  color: #fff;
}
.bloch-label.eq {
  font-size: 13px;
  color: #c9bdf0;
}
@media (max-width: 640px) {
  .bloch-label { font-size: 13px; }
  .bloch-label.pole { font-size: 15px; }
  .bloch-label.eq { font-size: 11px; }
}
</style>
