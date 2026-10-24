<script setup lang="ts">
import { fromBloch, blochVector, probabilities } from '~/lib/quantum'

const thetaDeg = ref(90)
const counts = ref<[number, number]>([0, 0])
const lastShots = ref<number[]>([])

const state = computed(() => fromBloch((thetaDeg.value * Math.PI) / 180, 0))
const vector = computed(() => blochVector(state.value))
const p0 = computed(() => probabilities(state.value).p0)
const total = computed(() => counts.value[0] + counts.value[1])
const pct = (n: number) => (total.value ? (100 * n) / total.value : 0)

watch(thetaDeg, () => clear())

function run(n: number) {
  const c: [number, number] = [...counts.value]
  const recent: number[] = []
  for (let i = 0; i < n; i++) {
    const r = Math.random() < p0.value ? 0 : 1
    c[r]++
    if (recent.length < 24) recent.push(r)
  }
  counts.value = c
  lastShots.value = recent
}
function clear() {
  counts.value = [0, 0]
  lastShots.value = []
}
</script>

<template>
  <div class="widget shots glass">
    <div class="viz">
      <BlochSphere :vector="vector" :equator-labels="false" label="Bloch sphere showing the state being measured" />
    </div>
    <div class="panel">
      <span class="w-title">Measure it many times</span>
      <label class="slider">
        <span class="s-head"><span>Prepare a state: θ</span><b>{{ thetaDeg }}°</b></span>
        <input v-model.number="thetaDeg" type="range" min="0" max="180" step="1" aria-label="theta in degrees">
      </label>
      <p class="expect">
        Expected: <b>{{ (p0 * 100).toFixed(1) }}%</b> zeros and <b>{{ ((1 - p0) * 100).toFixed(1) }}%</b> ones
      </p>

      <div class="buttons" role="group" aria-label="Run shots">
        <button type="button" class="btn btn-ghost" @click="run(1)">1 shot</button>
        <button type="button" class="btn btn-ghost" @click="run(10)">10</button>
        <button type="button" class="btn btn-ghost" @click="run(100)">100</button>
        <button type="button" class="btn btn-primary" @click="run(1000)">1000</button>
      </div>

      <div class="hist" aria-live="polite">
        <div class="row">
          <span class="lbl">0</span>
          <div class="track"><div class="fill f0" :style="{ width: pct(counts[0]) + '%' }" /><i class="mark" :style="{ left: p0 * 100 + '%' }" /></div>
          <span class="num">{{ counts[0] }}</span>
        </div>
        <div class="row">
          <span class="lbl">1</span>
          <div class="track"><div class="fill f1" :style="{ width: pct(counts[1]) + '%' }" /><i class="mark" :style="{ left: (1 - p0) * 100 + '%' }" /></div>
          <span class="num">{{ counts[1] }}</span>
        </div>
        <p class="meta">
          <span>{{ total }} shots</span>
          <span v-if="lastShots.length" class="bits">{{ lastShots.join('') }}{{ total > lastShots.length ? '…' : '' }}</span>
          <button v-if="total" type="button" class="link" @click="clear">clear</button>
        </p>
        <p class="legend"><i class="mark-key" /> = the probability predicted by the Born rule</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shots {
  border-radius: var(--radius-lg);
  padding: clamp(16px, 3vw, 24px);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}
.viz {
  flex: 1 1 260px;
  min-width: 0;
  max-width: 380px;
  margin: 0 auto;
}
.panel {
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
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
}
.expect {
  margin: 0 !important;
  font-size: 15px !important;
}
.expect b {
  font-family: var(--font-mono);
  color: var(--ink-strong);
  font-weight: 500;
}
.buttons {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.buttons .btn {
  padding: 0 8px;
  min-height: 46px;
  font-size: 15px;
}
.hist {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
}
.lbl {
  width: 16px;
  color: #d9cfff;
}
.num {
  width: 48px;
  text-align: right;
  color: var(--ink-strong);
}
.track {
  position: relative;
  flex: 1;
  height: 22px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}
.fill {
  height: 100%;
  border-radius: 8px;
  transition: width 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.f0 {
  background: linear-gradient(90deg, #7c3aed, #c084fc);
}
.f1 {
  background: linear-gradient(90deg, #3b82f6, #22d3ee);
}
.mark,
.mark-key {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  margin-left: -1px;
  background: #fff;
  box-shadow: 0 0 8px #fff;
  border-radius: 2px;
}
.mark-key {
  position: relative;
  display: inline-block;
  top: 2px;
  height: 14px;
  margin: 0 4px 0 2px;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin: 0 !important;
  font-size: 13px !important;
  color: var(--muted-2) !important;
}
.bits {
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  color: var(--lilac);
  overflow-wrap: anywhere;
}
.link {
  background: none;
  border: none;
  color: var(--muted-2);
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
  padding: 4px;
}
.legend {
  margin: 0 !important;
  font-size: 13px !important;
  color: var(--faint) !important;
}
</style>
