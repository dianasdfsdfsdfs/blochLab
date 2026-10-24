<script setup lang="ts">
import {
  KET_0, GATES, GATE_ORDER, applyGate, blochVector, rotationOf, rotateVec, slerpVec, formatKet, probabilities,
  type GateKey, type QubitState, type Vec3,
} from '~/lib/quantum'

const { siteUrl } = useRuntimeConfig().public
useSeoMeta({
  title: 'Quantum circuit playground — single-qubit simulator in 3D',
  description:
    'Build a single-qubit quantum circuit from X, Y, Z, H, S and T gates, step through it on a 3D Bloch sphere and run 1000 measurement shots. Free online quantum simulator, no account needed.',
})
useHead({ link: [{ rel: 'canonical', href: `${siteUrl.replace(/\/$/, '')}/playground` }] })

const MAX = 16
const route = useRoute()
const router = useRouter()

const parse = (s: unknown): GateKey[] =>
  String(s ?? '')
    .toUpperCase()
    .split('')
    .filter((k): k is GateKey => (GATE_ORDER as string[]).includes(k))
    .slice(0, MAX)

const circuit = ref<GateKey[]>([])
const pos = ref(0) // how many gates have been applied in the view
const vector = shallowRef<Vec3>([0, 0, 1])
const axis = shallowRef<Vec3 | null>(null)
const trail = shallowRef<Vec3[]>([])
const playing = ref(false)
const animating = ref(false)
const counts = ref<[number, number] | null>(null)

const states = computed<QubitState[]>(() => {
  const out: QubitState[] = [KET_0]
  for (const k of circuit.value) out.push(applyGate(GATES[k].matrix, out[out.length - 1]!))
  return out
})
const current = computed(() => states.value[pos.value]!)
const final = computed(() => states.value[states.value.length - 1]!)
const ket = computed(() => formatKet(current.value))
const p0 = computed(() => Math.round(probabilities(current.value).p0 * 100))
const finalP0 = computed(() => probabilities(final.value).p0)
const activeGate = computed(() => (pos.value > 0 ? circuit.value[pos.value - 1] : null))

let raf = 0
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const reduced = import.meta.client && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function animate(fn: (e: number) => Vec3, ms: number): Promise<void> {
  cancelAnimationFrame(raf)
  animating.value = true
  return new Promise(resolve => {
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / (reduced ? 1 : ms))
      const v = fn(ease(t))
      vector.value = v
      trail.value = [...trail.value, v].slice(-120)
      if (t < 1) raf = requestAnimationFrame(tick)
      else {
        animating.value = false
        axis.value = null
        resolve()
      }
    }
    raf = requestAnimationFrame(tick)
  })
}

async function stepForward() {
  if (pos.value >= circuit.value.length || animating.value) return
  const k = circuit.value[pos.value]!
  const { axis: n, angle } = rotationOf(GATES[k].matrix)
  const from = blochVector(states.value[pos.value]!)
  axis.value = angle > 1e-6 ? n : null
  trail.value = [from]
  await animate(e => rotateVec(from, n, angle * e), 450 + 600 * (angle / Math.PI))
  pos.value++
  vector.value = blochVector(current.value)
}

async function stepBack() {
  if (pos.value <= 0 || animating.value) return
  const k = circuit.value[pos.value - 1]!
  const { axis: n, angle } = rotationOf(GATES[k].matrix)
  const from = blochVector(states.value[pos.value]!)
  axis.value = angle > 1e-6 ? n : null
  trail.value = [from]
  await animate(e => rotateVec(from, n, -angle * e), 400 + 500 * (angle / Math.PI))
  pos.value--
  vector.value = blochVector(current.value)
}

async function jumpTo(i: number) {
  if (animating.value) return
  playing.value = false
  const from = vector.value
  const to = blochVector(states.value[i]!)
  trail.value = []
  axis.value = null
  await animate(e => slerpVec(from, to, e), 450)
  pos.value = i
  trail.value = []
}

async function play() {
  if (playing.value) {
    playing.value = false
    return
  }
  if (!circuit.value.length) return
  if (pos.value >= circuit.value.length) await jumpTo(0)
  playing.value = true
  while (playing.value && pos.value < circuit.value.length) {
    await stepForward()
    await new Promise(r => setTimeout(r, 220))
  }
  playing.value = false
}

function add(k: GateKey) {
  if (circuit.value.length >= MAX) return
  playing.value = false
  const atEnd = pos.value === circuit.value.length
  circuit.value = [...circuit.value, k]
  counts.value = null
  if (atEnd && !animating.value) stepForward()
}
function undo() {
  if (!circuit.value.length || animating.value) return
  playing.value = false
  circuit.value = circuit.value.slice(0, -1)
  counts.value = null
  if (pos.value > circuit.value.length) jumpTo(circuit.value.length)
}
function clear() {
  playing.value = false
  circuit.value = []
  counts.value = null
  jumpTo(0)
}
function load(seq: string) {
  playing.value = false
  circuit.value = parse(seq)
  counts.value = null
  jumpTo(0).then(() => play())
}
function shoot(n = 1000) {
  const c: [number, number] = [0, 0]
  for (let i = 0; i < n; i++) c[Math.random() < finalP0.value ? 0 : 1]++
  counts.value = c
}

// Keep the circuit in the URL so it can be shared.
watch(circuit, c => {
  const q = c.join('')
  if (q !== (route.query.c ?? '')) router.replace({ query: q ? { c: q } : {} })
})

onMounted(() => {
  const initial = parse(route.query.c)
  if (initial.length) {
    circuit.value = initial
    pos.value = initial.length
    vector.value = blochVector(final.value)
  }
})
onBeforeUnmount(() => {
  playing.value = false
  cancelAnimationFrame(raf)
})

const presets = [
  { name: 'Superposition', seq: 'H', note: '|0⟩ → |+⟩' },
  { name: 'Phase kick', seq: 'HZH', note: 'ends at |1⟩' },
  { name: 'To |+i⟩', seq: 'HS', note: 'phase of 90°' },
  { name: 'H undoes H', seq: 'HH', note: 'interference' },
  { name: 'Eight T’s', seq: 'HTTTTTTTT', note: 'full turn' },
]
const copied = ref(false)
async function share() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {}
}
</script>

<template>
  <div class="container page">
    <header class="section-head">
      <span class="eyebrow cyan">Playground</span>
      <h1 class="grad-text">Build a circuit. Watch the qubit move.</h1>
      <p>Add gates to the wire, then play it step by step on the Bloch sphere. The circuit is saved in the link, so you can share it.</p>
    </header>

    <div class="grid">
      <section class="stage glass" aria-label="Bloch sphere">
        <BlochSphere :vector="vector" :axis="axis" :trail="trail" />
        <div class="readout" aria-live="polite">
          <span class="ket">|ψ⟩ = {{ ket }}</span>
          <span class="meta">step {{ pos }} / {{ circuit.length }}<template v-if="activeGate"> · after {{ activeGate }}</template> · P(0) = {{ p0 }}%</span>
        </div>
      </section>

      <section class="side">
        <div class="panel glass">
          <h2 class="p-title">Gates</h2>
          <div class="palette" role="group" aria-label="Add a gate">
            <button v-for="k in GATE_ORDER" :key="k" type="button" class="gate" :title="GATES[k].name" :aria-label="`Add ${GATES[k].name}`" :disabled="circuit.length >= MAX" @click="add(k)">{{ k }}</button>
          </div>

          <h2 class="p-title">Circuit</h2>
          <div class="wire-wrap">
            <span class="wl">|0⟩</span>
            <div class="wire">
              <button type="button" class="slot start" :class="{ on: pos === 0 }" aria-label="Go to the start" @click="jumpTo(0)" />
              <button
                v-for="(k, i) in circuit"
                :key="i + k"
                type="button"
                class="slot g"
                :class="{ done: i < pos, on: i === pos - 1 }"
                :aria-label="`Go to step ${i + 1}, gate ${k}`"
                @click="jumpTo(i + 1)"
              >
                {{ k }}
              </button>
              <span v-if="!circuit.length" class="hint">tap a gate above to add it</span>
            </div>
          </div>

          <div class="transport" role="group" aria-label="Playback">
            <button type="button" class="t" aria-label="Back to start" :disabled="pos === 0" @click="jumpTo(0)">⏮</button>
            <button type="button" class="t" aria-label="Step back" :disabled="pos === 0" @click="stepBack">◀</button>
            <button type="button" class="t play" :aria-label="playing ? 'Pause' : 'Play'" :disabled="!circuit.length" @click="play">{{ playing ? '❚❚' : '▶' }}</button>
            <button type="button" class="t" aria-label="Step forward" :disabled="pos >= circuit.length" @click="stepForward">▶︎|</button>
          </div>
          <div class="edit">
            <button type="button" class="btn btn-ghost" :disabled="!circuit.length" @click="undo">Undo</button>
            <button type="button" class="btn btn-ghost" :disabled="!circuit.length" @click="clear">Clear</button>
            <button type="button" class="btn btn-ghost" :disabled="!circuit.length" @click="share">{{ copied ? 'Link copied' : 'Share' }}</button>
          </div>
        </div>

        <div class="panel glass">
          <h2 class="p-title">Measure the result</h2>
          <p class="small">Runs the whole circuit 1000 times and measures the qubit at the end.</p>
          <button type="button" class="btn btn-primary run" @click="shoot()">Run 1000 shots</button>
          <div v-if="counts" class="hist">
            <div class="row"><span>0</span><div class="track"><i class="f0" :style="{ width: counts[0] / 10 + '%' }" /></div><b>{{ counts[0] }}</b></div>
            <div class="row"><span>1</span><div class="track"><i class="f1" :style="{ width: counts[1] / 10 + '%' }" /></div><b>{{ counts[1] }}</b></div>
          </div>
        </div>

        <div class="panel glass">
          <h2 class="p-title">Try an example</h2>
          <div class="presets">
            <button v-for="p in presets" :key="p.seq" type="button" class="preset" @click="load(p.seq)">
              <span>{{ p.name }}</span>
              <small>{{ p.seq }} · {{ p.note }}</small>
            </button>
          </div>
        </div>
      </section>
    </div>

    <p class="roadmap">
      Coming next: multi-qubit circuits with CNOT and entanglement. New to the gates? Start with the
      <NuxtLink to="/learn/quantum-gates">quantum gates lesson</NuxtLink>.
    </p>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(32px, 6vw, 56px);
  padding-bottom: 40px;
}
.eyebrow.cyan {
  color: var(--cyan);
}
h1 {
  font-size: clamp(34px, 5vw, 56px);
  font-weight: 700;
  padding-bottom: 0.06em;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}
.stage {
  flex: 1 1 440px;
  min-width: 0;
  border-radius: var(--radius-lg);
  padding: clamp(14px, 3vw, 24px);
  position: sticky;
  top: 88px;
}
.readout {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}
.ket {
  font-family: var(--font-mono);
  font-size: clamp(15px, 2vw, 18px);
  color: var(--ink-strong);
  overflow-wrap: anywhere;
}
.meta {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--faint);
}
.side {
  flex: 1 1 380px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.panel {
  border-radius: 22px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.p-title {
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--muted-2);
}
.palette {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}
.gate {
  height: 52px;
  border-radius: 14px;
  border: 1px solid rgba(201, 184, 255, 0.22);
  background: linear-gradient(140deg, rgba(124, 58, 237, 0.35), rgba(59, 130, 246, 0.2));
  color: #fff;
  font-family: var(--font-mono);
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s, border-color 0.2s;
}
.gate:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(192, 132, 252, 0.7);
  box-shadow: 0 0 24px -6px rgba(192, 132, 252, 0.8);
}
.wire-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
}
.wl {
  color: var(--muted-2);
  font-size: 14px;
}
.wire {
  position: relative;
  flex: 1;
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding: 6px 2px;
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
.slot {
  position: relative;
  flex: 0 0 auto;
  cursor: pointer;
  font-family: var(--font-mono);
}
.slot.start {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(201, 184, 255, 0.5);
  background: #0a0823;
  padding: 0;
}
.slot.start.on {
  background: var(--cyan);
  border-color: var(--cyan);
  box-shadow: 0 0 12px var(--cyan);
}
.slot.g {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(201, 184, 255, 0.3);
  background: #120e33;
  color: #d9cfff;
  font-size: 15px;
  transition: background 0.2s, box-shadow 0.2s;
}
.slot.g.done {
  background: linear-gradient(140deg, #7c3aed, #a855f7);
  color: #fff;
}
.slot.g.on {
  box-shadow: 0 0 0 2px var(--cyan), 0 0 18px rgba(34, 211, 238, 0.7);
}
.hint {
  position: relative;
  font-size: 12px;
  color: var(--faint);
  background: rgba(10, 8, 35, 0.9);
  padding: 0 8px;
}
.transport {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.t {
  height: 48px;
  border-radius: 14px;
  border: 1px solid rgba(201, 184, 255, 0.22);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink);
  font-size: 16px;
  cursor: pointer;
}
.t.play {
  background: var(--grad-brand);
  border: none;
  color: #fff;
}
button:disabled {
  opacity: 0.45;
  cursor: default;
}
.edit {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.edit .btn {
  min-height: 44px;
  padding: 0 8px;
  font-size: 14px;
}
.small {
  font-size: 14px;
  color: var(--muted);
}
.run {
  align-self: flex-start;
}
.hist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: var(--font-mono);
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.row b {
  width: 48px;
  text-align: right;
  font-weight: 500;
}
.track {
  flex: 1;
  height: 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}
.track i {
  display: block;
  height: 100%;
  border-radius: 8px;
  transition: width 0.4s;
}
.f0 {
  background: linear-gradient(90deg, #7c3aed, #c084fc);
}
.f1 {
  background: linear-gradient(90deg, #3b82f6, #22d3ee);
}
.presets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}
.preset {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(201, 184, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ink);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
}
.preset small {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: 12px;
  color: var(--muted-2);
}
.preset:hover {
  border-color: rgba(192, 132, 252, 0.6);
}
.roadmap {
  margin-top: 28px;
  font-size: 15px;
  color: var(--muted-2);
}
.roadmap a {
  color: var(--lilac);
}
@media (max-width: 900px) {
  .stage {
    position: static;
  }
}
</style>
