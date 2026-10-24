import { type Complex, c, add, mul, conj, abs, abs2, arg, expi, scale, sub, div } from './complex'

/**
 * A single-qubit state |ψ⟩ = α|0⟩ + β|1⟩, stored as the pair [α, β].
 * Normalised: |α|² + |β|² = 1.
 */
export type QubitState = [Complex, Complex]

/** A 2×2 complex matrix (a quantum gate), row-major: [[a, b], [c, d]]. */
export type Matrix2 = [[Complex, Complex], [Complex, Complex]]

export type Vec3 = [number, number, number]

export const KET_0: QubitState = [c(1), c(0)]
export const KET_1: QubitState = [c(0), c(1)]

/** Apply a gate: |ψ'⟩ = U|ψ⟩ (matrix × vector). */
export function applyGate(U: Matrix2, [a, b]: QubitState): QubitState {
  return [add(mul(U[0][0], a), mul(U[0][1], b)), add(mul(U[1][0], a), mul(U[1][1], b))]
}

export function normalize([a, b]: QubitState): QubitState {
  const n = Math.sqrt(abs2(a) + abs2(b))
  return [scale(a, 1 / n), scale(b, 1 / n)]
}

/** Born rule: P(0) = |α|², P(1) = |β|². */
export function probabilities([a, b]: QubitState): { p0: number; p1: number } {
  const p0 = abs2(a)
  const p1 = abs2(b)
  const n = p0 + p1
  return { p0: p0 / n, p1: p1 / n }
}

/**
 * Position of the state on the Bloch sphere.
 *   x = 2·Re(α*β),  y = 2·Im(α*β),  z = |α|² − |β|²
 * North pole (0,0,1) is |0⟩, south pole (0,0,−1) is |1⟩.
 */
export function blochVector([a, b]: QubitState): Vec3 {
  const ab = mul(conj(a), b)
  return [2 * ab.re, 2 * ab.im, abs2(a) - abs2(b)]
}

/** Polar angle θ ∈ [0, π] and azimuth φ ∈ [0, 2π) of the state. */
export function blochAngles(state: QubitState): { theta: number; phi: number } {
  const [x, y, z] = blochVector(state)
  const theta = Math.acos(Math.max(-1, Math.min(1, z)))
  let phi = Math.atan2(y, x)
  if (phi < 0) phi += 2 * Math.PI
  if (Math.sin(theta) < 1e-9) phi = 0
  return { theta, phi }
}

/** Build |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ from Bloch angles. */
export function fromBloch(theta: number, phi: number): QubitState {
  return [c(Math.cos(theta / 2)), scale(expi(phi), Math.sin(theta / 2))]
}

/**
 * Remove the global phase so that α is real and non-negative.
 * Two states that differ only by a global phase are physically identical.
 */
export function canonical([a, b]: QubitState): QubitState {
  if (abs(a) < 1e-12) return [c(0), c(abs(b))]
  const phase = expi(-arg(a))
  return [mul(a, phase), mul(b, phase)]
}

/** Simulate a measurement in the computational basis. */
export function measure(state: QubitState, random: () => number = Math.random): { outcome: 0 | 1; state: QubitState; p0: number } {
  const { p0 } = probabilities(state)
  const outcome: 0 | 1 = random() < p0 ? 0 : 1
  return { outcome, state: outcome === 0 ? KET_0 : KET_1, p0 }
}

/**
 * Every single-qubit gate is (up to a global phase) a rotation of the Bloch
 * sphere: U = e^{iγ}·(cos(t/2)·I − i·sin(t/2)·(n·σ)).
 * This extracts the rotation axis n and the angle t ∈ [0, π].
 */
export function rotationOf(U: Matrix2): { axis: Vec3; angle: number } {
  // Remove the global phase: divide by sqrt(det U) so that det = 1 (SU(2)).
  const det = sub(mul(U[0][0], U[1][1]), mul(U[0][1], U[1][0]))
  const half = arg(det) / 2
  const k = expi(-half)
  const a = mul(U[0][0], k)
  const b = mul(U[0][1], k)
  const d = mul(U[1][1], k)
  const cc = mul(U[1][0], k)
  // In SU(2): U = [[w − i·nz·s, −i·nx·s − ny·s], [−i·nx·s + ny·s, w + i·nz·s]] with w = cos(t/2), s = sin(t/2)
  let w = (a.re + d.re) / 2
  let nx = -(b.im + cc.im) / 2
  let ny = (cc.re - b.re) / 2
  let nz = (d.im - a.im) / 2
  // Choose the representative with w ≥ 0 so that the angle is in [0, π].
  if (w < 0) {
    w = -w
    nx = -nx
    ny = -ny
    nz = -nz
  }
  const s = Math.sqrt(nx * nx + ny * ny + nz * nz)
  const angle = 2 * Math.atan2(s, w)
  if (s < 1e-12) return { axis: [0, 0, 1], angle: 0 }
  return { axis: [nx / s, ny / s, nz / s], angle }
}

/** Rotate a 3D vector v around unit axis n by angle t (Rodrigues' formula). */
export function rotateVec(v: Vec3, n: Vec3, t: number): Vec3 {
  const cs = Math.cos(t)
  const sn = Math.sin(t)
  const d = n[0] * v[0] + n[1] * v[1] + n[2] * v[2]
  const cx = n[1] * v[2] - n[2] * v[1]
  const cy = n[2] * v[0] - n[0] * v[2]
  const cz = n[0] * v[1] - n[1] * v[0]
  return [
    v[0] * cs + cx * sn + n[0] * d * (1 - cs),
    v[1] * cs + cy * sn + n[1] * d * (1 - cs),
    v[2] * cs + cz * sn + n[2] * d * (1 - cs),
  ]
}

/** Spherical interpolation between two unit vectors. */
export function slerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  d = Math.max(-1, Math.min(1, d))
  if (d < -0.9999) return rotateVec(a, [1, 0, 0], Math.PI * t)
  const ang = Math.acos(d)
  if (ang < 1e-6) return b
  const s = Math.sin(ang)
  const wa = Math.sin((1 - t) * ang) / s
  const wb = Math.sin(t * ang) / s
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb]
}

// ---------- pretty printing ----------

const fmt = (x: number, digits = 2) => {
  const s = (Math.abs(x) < 0.5 * 10 ** -digits ? 0 : x).toFixed(digits)
  return s === '-0.00' ? '0.00' : s
}

/** A complex number as a short human string, e.g. "0.71", "−0.71i", "0.50 + 0.50i". */
export function formatComplex(z: Complex, digits = 2): string {
  const eps = 0.5 * 10 ** -digits
  const re = Math.abs(z.re) < eps ? 0 : z.re
  const im = Math.abs(z.im) < eps ? 0 : z.im
  if (im === 0) return fmt(re, digits).replace('-', '−')
  if (re === 0) return `${fmt(im, digits)}i`.replace('-', '−')
  return `${fmt(re, digits)} ${im < 0 ? '−' : '+'} ${fmt(Math.abs(im), digits)}i`.replace(/^-/, '−')
}

/** The state as a ket string with the global phase removed, e.g. "0.71|0⟩ + 0.71|1⟩". */
export function formatKet(state: QubitState, digits = 2): string {
  const [a, b] = canonical(state)
  const eps = 0.5 * 10 ** -digits
  if (abs(b) < eps) return '|0⟩'
  if (abs(a) < eps) return '|1⟩'
  const A = fmt(a.re, digits)
  const re = Math.abs(b.re) < eps ? 0 : b.re
  const im = Math.abs(b.im) < eps ? 0 : b.im
  let B: string
  if (im === 0) B = `${re < 0 ? '−' : '+'} ${fmt(Math.abs(re), digits)}`
  else if (re === 0) B = `${im < 0 ? '−' : '+'} ${fmt(Math.abs(im), digits)}i`
  else B = `+ (${formatComplex(b, digits)})`
  return `${A}|0⟩ ${B}|1⟩`
}

export { div }
