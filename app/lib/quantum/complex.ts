/**
 * Minimal complex-number toolkit.
 * A complex number z = re + i·im. Quantum amplitudes are complex numbers.
 */
export interface Complex {
  re: number
  im: number
}

export const c = (re: number, im = 0): Complex => ({ re, im })

export const ZERO = c(0)
export const ONE = c(1)
export const I = c(0, 1)

export const add = (a: Complex, b: Complex): Complex => c(a.re + b.re, a.im + b.im)
export const sub = (a: Complex, b: Complex): Complex => c(a.re - b.re, a.im - b.im)
export const mul = (a: Complex, b: Complex): Complex =>
  c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
export const scale = (a: Complex, k: number): Complex => c(a.re * k, a.im * k)
export const conj = (a: Complex): Complex => c(a.re, -a.im)
export const div = (a: Complex, b: Complex): Complex => {
  const d = b.re * b.re + b.im * b.im
  return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d)
}

/** |z|² — the squared magnitude. For an amplitude this is a probability. */
export const abs2 = (a: Complex): number => a.re * a.re + a.im * a.im
/** |z| — magnitude (length of the arrow in the complex plane). */
export const abs = (a: Complex): number => Math.sqrt(abs2(a))
/** arg(z) — the angle (phase) of z in radians, in (−π, π]. */
export const arg = (a: Complex): number => Math.atan2(a.im, a.re)
/** e^{iφ} = cos φ + i sin φ — a unit-length complex number with phase φ. */
export const expi = (phi: number): Complex => c(Math.cos(phi), Math.sin(phi))

export const approxEq = (a: Complex, b: Complex, eps = 1e-9): boolean =>
  Math.abs(a.re - b.re) < eps && Math.abs(a.im - b.im) < eps
