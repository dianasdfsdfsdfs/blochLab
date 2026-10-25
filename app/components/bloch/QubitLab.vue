<script setup lang="ts">
import { GATE_ORDER, GATES } from '~/lib/quantum'

const props = withDefaults(defineProps<{
  heading?: string
  gates?: (typeof GATE_ORDER)[number][]
  showHistory?: boolean
  /** Pass a qubit from useQubit() to control this lab from outside (e.g. "try it" buttons). */
  qubit?: ReturnType<typeof useQubit>
}>(), {
  heading: 'The Bloch sphere',
  gates: () => [...GATE_ORDER],
  showHistory: true,
  qubit: undefined,
})

const q = props.qubit ?? useQubit()
const gateList = computed(() => props.gates.map(k => GATES[k]))
</script>

<template>
  <div class="lab glass">
    <div class="lab-head">
      <span class="lab-title">{{ heading }}</span>
      <span class="hint">Drag to rotate</span>
    </div>

    <BlochSphere
      class="sphere"
      :vector="q.vector.value"
      :axis="q.axis.value"
      :trail="q.trail.value"
      :flash="q.flash.value"
    />

    <div class="controls">
      <div class="gates" role="group" aria-label="Quantum gates">
        <button
          v-for="g in gateList"
          :key="g.key"
          type="button"
          class="gate"
          :class="{ active: q.lastGate.value === g.key }"
          :aria-label="`Apply ${g.name}`"
          :title="g.name"
          @click="q.gate(g.key)"
        >
          {{ g.key }}
        </button>
      </div>
      <div class="actions">
        <button type="button" class="btn btn-primary measure" @click="q.measure()">Measure</button>
        <button type="button" class="btn btn-ghost reset" @click="q.reset()">Reset</button>
      </div>
    </div>

    <div class="readout" aria-live="polite">
      <span class="label">State</span>
      <span class="ket">|ψ⟩ = {{ q.ket.value }}</span>
      <span class="angles">θ = {{ q.angles.value.theta }}° · φ = {{ q.angles.value.phi }}°</span>
    </div>

    <div class="probs">
      <div class="prob">
        <span class="pl">P(0)</span>
        <div class="bar"><div class="fill f0" :style="{ width: q.p0.value + '%' }" /></div>
        <span class="pv">{{ q.p0.value }}%</span>
      </div>
      <div class="prob">
        <span class="pl">P(1)</span>
        <div class="bar"><div class="fill f1" :style="{ width: q.p1.value + '%' }" /></div>
        <span class="pv">{{ q.p1.value }}%</span>
      </div>
    </div>

    <div v-if="showHistory" class="circuit" aria-label="Gates applied so far">
      <span class="wire-label">|0⟩</span>
      <div class="wire">
        <span v-if="!q.history.value.length" class="empty">your circuit appears here</span>
        <TransitionGroup name="pop">
          <span
            v-for="(h, i) in q.history.value"
            :key="i"
            class="chip"
            :class="'k-' + h.kind"
          >
            <template v-if="h.kind === 'gate'">{{ h.label }}</template>
            <template v-else>
              <svg width="18" height="12" viewBox="0 0 26 18" aria-hidden="true"><path d="M3 16 A10 10 0 0 1 23 16" fill="none" stroke="currentColor" stroke-width="2" /><line x1="13" y1="16" x2="20" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
              <span>{{ h.label }}</span>
            </template>
          </span>
        </TransitionGroup>
      </div>
    </div>

    <div class="info">
      <div class="info-title">{{ q.title.value }}</div>
      <p class="info-text">{{ q.info.value }}</p>
    </div>
  </div>
</template>

<style scoped>
.lab {
  border-radius: var(--radius-lg);
  padding: clamp(16px, 3vw, 24px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 40px 120px -40px rgba(124, 58, 237, 0.6);
  min-width: 0;
}
.lab-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.lab-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: #d9cfff;
}
.hint {
  font-size: 13px;
  color: var(--faint);
}
.sphere {
  /* keep the sphere and the gate buttons on one screen, even on short laptop displays */
  width: min(100%, 440px, max(260px, calc(100vh - 290px)));
  width: min(100%, 440px, max(260px, calc(100svh - 290px)));
  margin: -10px auto -6px;
}
.readout {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted-2);
}
.ket {
  font-family: var(--font-mono);
  font-size: clamp(15px, 2.2vw, 18px);
  color: var(--ink-strong);
  overflow-wrap: anywhere;
}
.angles {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--faint);
}
.probs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.prob {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 14px;
}
.pl {
  width: 44px;
  color: #d9cfff;
}
.pv {
  width: 44px;
  text-align: right;
}
.bar {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.f0 {
  background: linear-gradient(90deg, #7c3aed, #c084fc);
  box-shadow: 0 0 16px rgba(192, 132, 252, 0.6);
}
.f1 {
  background: linear-gradient(90deg, #3b82f6, #22d3ee);
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.5);
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
}
.gates {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  flex: 1 1 300px;
}
.gate {
  height: 50px;
  min-width: 44px;
  border-radius: 14px;
  border: 1px solid rgba(201, 184, 255, 0.22);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink-strong);
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s, background 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.gate:hover {
  transform: translateY(-2px);
  border-color: rgba(192, 132, 252, 0.7);
  box-shadow: 0 0 24px -6px rgba(192, 132, 252, 0.8);
}
.gate:active {
  transform: translateY(0) scale(0.97);
}
.gate.active {
  background: linear-gradient(140deg, rgba(124, 58, 237, 0.75), rgba(59, 130, 246, 0.6));
  border-color: rgba(201, 184, 255, 0.5);
}
.actions {
  display: flex;
  gap: 8px;
  flex: 1 1 200px;
}
.actions .btn {
  flex: 1;
  min-height: 50px;
  padding: 0 16px;
  font-size: 15px;
}
.circuit {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
}
.wire-label {
  font-size: 14px;
  color: var(--muted-2);
}
.wire {
  position: relative;
  flex: 1;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px;
  scrollbar-width: none;
}
.wire::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: rgba(201, 184, 255, 0.3);
}
.empty {
  position: relative;
  font-size: 12px;
  color: var(--faint);
  background: rgba(10, 8, 35, 0.9);
  padding: 0 8px;
  margin-left: 8px;
}
.chip {
  position: relative;
  flex: 0 0 auto;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  color: #fff;
}
.chip.k-gate {
  background: linear-gradient(140deg, #7c3aed, #a855f7);
  box-shadow: 0 0 14px -4px rgba(168, 85, 247, 0.9);
}
.chip.k-measure {
  background: #120e33;
  border: 1px solid rgba(34, 211, 238, 0.5);
  color: #22d3ee;
}
.info {
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(192, 132, 252, 0.2);
  min-height: 96px;
}
.info-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: #e9ddff;
  margin-bottom: 4px;
}
.info-text {
  font-size: 14px;
  line-height: 1.55;
  color: #c3bce6;
}
.pop-enter-active {
  transition: transform 0.3s cubic-bezier(0.2, 1.4, 0.4, 1), opacity 0.2s;
}
.pop-enter-from {
  transform: scale(0.4);
  opacity: 0;
}
@media (max-width: 420px) {
  .gate {
    height: 46px;
    font-size: 16px;
  }
}
</style>
