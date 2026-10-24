<script setup lang="ts">
import { fromBloch, blochVector, formatComplex, probabilities, canonical } from '~/lib/quantum'

const thetaDeg = ref(60)
const phiDeg = ref(45)

const state = computed(() => fromBloch((thetaDeg.value * Math.PI) / 180, (phiDeg.value * Math.PI) / 180))
const vector = computed(() => blochVector(state.value))
const amps = computed(() => canonical(state.value))
const probs = computed(() => probabilities(state.value))
const p0 = computed(() => Math.round(probs.value.p0 * 1000) / 10)
const p1 = computed(() => Math.round((100 - p0.value) * 10) / 10)
const xyz = computed(() => vector.value.map(v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2)))

const presets = [
  { label: '|0⟩', t: 0, p: 0 },
  { label: '|1⟩', t: 180, p: 0 },
  { label: '|+⟩', t: 90, p: 0 },
  { label: '|−⟩', t: 90, p: 180 },
  { label: '|+i⟩', t: 90, p: 90 },
  { label: '|−i⟩', t: 90, p: 270 },
]

// Smoothly glide to a preset instead of jumping.
let raf = 0
function goTo(t: number, p: number) {
  cancelAnimationFrame(raf)
  const t0 = performance.now()
  const a = { t: thetaDeg.value, p: phiDeg.value }
  let dp = p - a.p
  if (dp > 180) dp -= 360
  if (dp < -180) dp += 360
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / 600)
    const e = 1 - Math.pow(1 - k, 3)
    thetaDeg.value = Math.round(a.t + (t - a.t) * e)
    phiDeg.value = Math.round((((a.p + dp * e) % 360) + 360) % 360)
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="widget explorer glass">
    <div class="viz">
      <BlochSphere :vector="vector" label="Bloch sphere showing the angles you choose with the sliders" />
    </div>
    <div class="panel">
      <span class="w-title">Move the qubit yourself</span>
      <label class="slider">
        <span class="s-head"><span>θ (theta) — latitude</span><b>{{ thetaDeg }}°</b></span>
        <input v-model.number="thetaDeg" type="range" min="0" max="180" step="1" aria-label="theta in degrees">
      </label>
      <label class="slider">
        <span class="s-head"><span>φ (phi) — longitude / phase</span><b>{{ phiDeg }}°</b></span>
        <input v-model.number="phiDeg" type="range" min="0" max="359" step="1" aria-label="phi in degrees">
      </label>

      <div class="presets" role="group" aria-label="Jump to a named state">
        <button v-for="p in presets" :key="p.label" type="button" class="preset" @click="goTo(p.t, p.p)">{{ p.label }}</button>
      </div>

      <dl class="out">
        <div><dt>α (amplitude of |0⟩)</dt><dd>{{ formatComplex(amps[0]) }}</dd></div>
        <div><dt>β (amplitude of |1⟩)</dt><dd>{{ formatComplex(amps[1]) }}</dd></div>
        <div><dt>P(0) = |α|²</dt><dd>{{ p0 }}%</dd></div>
        <div><dt>P(1) = |β|²</dt><dd>{{ p1 }}%</dd></div>
        <div class="wide"><dt>Point on the sphere (x, y, z)</dt><dd>({{ xyz[0] }}, {{ xyz[1] }}, {{ xyz[2] }})</dd></div>
      </dl>
    </div>
  </div>
</template>

<style scoped>
.explorer {
  border-radius: var(--radius-lg);
  padding: clamp(16px, 3vw, 24px);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}
.viz {
  flex: 1 1 300px;
  min-width: 0;
  max-width: 420px;
  margin: 0 auto;
}
.panel {
  flex: 1 1 300px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.w-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 17px;
  color: #e9ddff;
}
.slider {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.s-head {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--muted);
}
.s-head b {
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--ink-strong);
}
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 28px;
  background: transparent;
  cursor: pointer;
}
input[type='range']::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #7c3aed, #c084fc, #3b82f6);
}
input[type='range']::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #7c3aed, #c084fc, #3b82f6);
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  margin-top: -8px;
  border-radius: 50%;
  background: #f5f0ff;
  box-shadow: 0 0 0 4px rgba(192, 132, 252, 0.35), 0 0 18px rgba(192, 132, 252, 0.9);
}
input[type='range']::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: #f5f0ff;
  box-shadow: 0 0 0 4px rgba(192, 132, 252, 0.35), 0 0 18px rgba(192, 132, 252, 0.9);
}
.presets {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}
.preset {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(201, 184, 255, 0.22);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink-strong);
  font-family: var(--font-mono);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.preset:hover {
  border-color: rgba(192, 132, 252, 0.7);
  background: rgba(124, 58, 237, 0.2);
}
.out {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}
.out div {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(5, 4, 20, 0.45);
  border: 1px solid rgba(201, 184, 255, 0.1);
}
.out .wide {
  grid-column: 1 / -1;
}
dt {
  font-size: 12px;
  color: var(--muted-2);
}
dd {
  margin: 2px 0 0;
  font-family: var(--font-mono);
  font-size: 15px;
  color: var(--ink-strong);
}
@media (max-width: 480px) {
  .presets {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
