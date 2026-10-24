import { c, expi, type Complex } from './complex'
import type { Matrix2 } from './qubit'

const h = Math.SQRT1_2
const m = (a: Complex, b: Complex, cc: Complex, d: Complex): Matrix2 => [
  [a, b],
  [cc, d],
]

/** Pauli-X — the quantum NOT. 180° around the X axis. */
export const X: Matrix2 = m(c(0), c(1), c(1), c(0))
/** Pauli-Y — 180° around the Y axis. */
export const Y: Matrix2 = m(c(0), c(0, -1), c(0, 1), c(0))
/** Pauli-Z — the phase flip. 180° around the Z axis. */
export const Z: Matrix2 = m(c(1), c(0), c(0), c(-1))
/** Hadamard — 180° around the diagonal (X+Z)/√2. Creates superposition. */
export const H: Matrix2 = m(c(h), c(h), c(h), c(-h))
/** S (phase) gate — 90° around Z. */
export const S: Matrix2 = m(c(1), c(0), c(0), c(0, 1))
/** S† — −90° around Z. */
export const Sdg: Matrix2 = m(c(1), c(0), c(0), c(0, -1))
/** T gate — 45° around Z. */
export const T: Matrix2 = m(c(1), c(0), c(0), expi(Math.PI / 4))
/** T† — −45° around Z. */
export const Tdg: Matrix2 = m(c(1), c(0), c(0), expi(-Math.PI / 4))
export const IDENTITY: Matrix2 = m(c(1), c(0), c(0), c(1))

/** Rotation by angle t around X. */
export const Rx = (t: number): Matrix2 =>
  m(c(Math.cos(t / 2)), c(0, -Math.sin(t / 2)), c(0, -Math.sin(t / 2)), c(Math.cos(t / 2)))
/** Rotation by angle t around Y. */
export const Ry = (t: number): Matrix2 =>
  m(c(Math.cos(t / 2)), c(-Math.sin(t / 2)), c(Math.sin(t / 2)), c(Math.cos(t / 2)))
/** Rotation by angle t around Z. */
export const Rz = (t: number): Matrix2 => m(expi(-t / 2), c(0), c(0), expi(t / 2))

export type GateKey = 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T'

export interface GateInfo {
  key: GateKey
  name: string
  matrix: Matrix2
  /** One-line, beginner friendly explanation of what the gate does on the sphere. */
  summary: string
}

export const GATES: Record<GateKey, GateInfo> = {
  X: {
    key: 'X',
    name: 'Pauli-X · the quantum NOT',
    matrix: X,
    summary: 'Rotates the arrow 180° around the X axis. |0⟩ becomes |1⟩ and |1⟩ becomes |0⟩.',
  },
  Y: {
    key: 'Y',
    name: 'Pauli-Y',
    matrix: Y,
    summary: 'Rotates 180° around the Y axis. It flips the bit and changes the phase at the same time.',
  },
  Z: {
    key: 'Z',
    name: 'Pauli-Z · the phase flip',
    matrix: Z,
    summary: 'Rotates 180° around the Z axis. The probabilities stay the same — only the phase (the longitude) changes. Try it after H.',
  },
  H: {
    key: 'H',
    name: 'Hadamard',
    matrix: H,
    summary: 'Rotates 180° around the diagonal between X and Z. From |0⟩ it lands on the equator: a perfect 50/50 superposition.',
  },
  S: {
    key: 'S',
    name: 'S gate',
    matrix: S,
    summary: 'A quarter turn around Z: adds a 90° phase. It moves |+⟩ to |+i⟩.',
  },
  T: {
    key: 'T',
    name: 'T gate',
    matrix: T,
    summary: 'An eighth of a turn around Z: adds a 45° phase.',
  },
}

export const GATE_ORDER: GateKey[] = ['X', 'Y', 'Z', 'H', 'S', 'T']
