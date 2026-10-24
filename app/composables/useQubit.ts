import {
  KET_0, applyGate, blochVector, rotationOf, rotateVec, slerpVec, measure as measureState, probabilities,
  blochAngles, formatKet, GATES, type GateKey, type QubitState, type Vec3,
} from '~/lib/quantum'

export interface HistoryItem {
  kind: 'gate' | 'measure'
  label: string
}

type Job = { kind: 'gate'; key: GateKey } | { kind: 'measure' } | { kind: 'reset' }

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Holds one qubit's exact quantum state plus everything the 3D view needs to
 * animate it: the displayed Bloch vector, the active rotation axis and the trail.
 */
export function useQubit(initial: QubitState = KET_0) {
  const state = shallowRef<QubitState>(initial)
  const vector = shallowRef<Vec3>(blochVector(initial))
  const axis = shallowRef<Vec3 | null>(null)
  const trail = shallowRef<Vec3[]>([])
  const busy = ref(false)
  const history = ref<HistoryItem[]>([])
  const lastGate = ref<GateKey | null>(null)
  const flash = ref<{ n: number; outcome: 0 | 1 }>({ n: 0, outcome: 0 })
  const title = ref('Start: the qubit is in |0⟩')
  const info = ref('The arrow points at the north pole, so measuring now gives 0 every time. Press a gate to rotate it, or drag the sphere to look around.')

  const queue: Job[] = []
  let raf = 0
  const reduced = import.meta.client && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const ket = computed(() => formatKet(state.value))
  const probs = computed(() => probabilities(state.value))
  const p0 = computed(() => Math.round(probs.value.p0 * 100))
  const p1 = computed(() => 100 - p0.value)
  const angles = computed(() => {
    const { theta, phi } = blochAngles(state.value)
    return { theta: Math.round((theta * 180) / Math.PI), phi: Math.round((phi * 180) / Math.PI) % 360 }
  })

  function animate(fn: (e: number) => Vec3, duration: number, done: () => void) {
    if (!import.meta.client) {
      vector.value = fn(1)
      done()
      return
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const v = fn(easeInOut(t))
      vector.value = v
      trail.value = [...trail.value, v].slice(-120)
      if (t < 1) raf = requestAnimationFrame(tick)
      else done()
    }
    raf = requestAnimationFrame(tick)
  }

  function next() {
    const job = queue.shift()
    if (!job) {
      busy.value = false
      axis.value = null
      return
    }
    busy.value = true
    const from = vector.value

    if (job.kind === 'gate') {
      const g = GATES[job.key]
      const { axis: n, angle } = rotationOf(g.matrix)
      const after = applyGate(g.matrix, state.value)
      axis.value = angle > 1e-6 ? n : null
      trail.value = [from]
      lastGate.value = job.key
      title.value = g.name
      info.value = g.summary
      history.value = [...history.value, { kind: 'gate', label: job.key }]
      const duration = reduced ? 200 : 500 + 650 * (angle / Math.PI)
      animate(e => rotateVec(from, n, angle * e), duration, () => {
        state.value = after
        vector.value = blochVector(after)
        next()
      })
    } else if (job.kind === 'measure') {
      const { outcome, p0: before } = measureState(state.value)
      const target: Vec3 = [0, 0, outcome === 0 ? 1 : -1]
      axis.value = null
      trail.value = [from]
      lastGate.value = null
      title.value = `Measured: ${outcome}`
      info.value = `The qubit collapsed to |${outcome}⟩. Just before measuring, the odds were ${Math.round(before * 100)}% for 0 and ${Math.round((1 - before) * 100)}% for 1. Measure again and it stays put.`
      history.value = [...history.value, { kind: 'measure', label: String(outcome) }]
      flash.value = { n: flash.value.n + 1, outcome }
      animate(e => slerpVec(from, target, e), reduced ? 150 : 520, () => {
        state.value = outcome === 0 ? KET_0 : applyGate(GATES.X.matrix, KET_0)
        vector.value = target
        next()
      })
    } else {
      axis.value = null
      trail.value = []
      lastGate.value = null
      title.value = 'Start: the qubit is in |0⟩'
      info.value = 'Back to the north pole. Measuring now gives 0 every time.'
      history.value = []
      animate(e => slerpVec(from, [0, 0, 1], e), reduced ? 150 : 650, () => {
        state.value = KET_0
        vector.value = [0, 0, 1]
        trail.value = []
        next()
      })
    }
  }

  function enqueue(job: Job) {
    if (queue.length > 6) return
    queue.push(job)
    if (!busy.value) next()
  }

  const gate = (key: GateKey) => enqueue({ kind: 'gate', key })
  const measure = () => enqueue({ kind: 'measure' })
  const reset = () => {
    queue.length = 0
    enqueue({ kind: 'reset' })
  }

  onBeforeUnmount(() => cancelAnimationFrame(raf))

  return { state, vector, axis, trail, busy, history, lastGate, flash, title, info, ket, p0, p1, angles, gate, measure, reset }
}
