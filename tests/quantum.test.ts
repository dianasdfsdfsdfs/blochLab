import { describe, it, expect } from 'vitest'
import {
  KET_0, KET_1, applyGate, blochVector, probabilities, rotationOf, rotateVec, fromBloch, blochAngles,
  formatKet, measure, canonical, X, Y, Z, H, S, T, Rx, Ry, Rz, GATES, GATE_ORDER, type Vec3,
} from '../app/lib/quantum'

const close = (a: number[], b: number[], eps = 1e-9) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i]!, 9))

describe('Bloch vector', () => {
  it('|0⟩ is the north pole and |1⟩ the south pole', () => {
    close(blochVector(KET_0), [0, 0, 1])
    close(blochVector(KET_1), [0, 0, -1])
  })
  it('H|0⟩ = |+⟩ lies on +X, H|1⟩ = |−⟩ on −X', () => {
    close(blochVector(applyGate(H, KET_0)), [1, 0, 0])
    close(blochVector(applyGate(H, KET_1)), [-1, 0, 0])
  })
  it('S|+⟩ = |+i⟩ lies on +Y', () => {
    close(blochVector(applyGate(S, applyGate(H, KET_0))), [0, 1, 0])
  })
  it('round-trips through Bloch angles', () => {
    const s = fromBloch(1.1, 2.3)
    const { theta, phi } = blochAngles(s)
    expect(theta).toBeCloseTo(1.1, 9)
    expect(phi).toBeCloseTo(2.3, 9)
  })
})

describe('gates', () => {
  it('X flips |0⟩ to |1⟩', () => {
    close(blochVector(applyGate(X, KET_0)), [0, 0, -1])
  })
  it('Z leaves probabilities unchanged', () => {
    const s = applyGate(H, KET_0)
    const p = probabilities(applyGate(Z, s))
    expect(p.p0).toBeCloseTo(0.5, 9)
  })
  it('H·H = identity on the sphere', () => {
    const s = fromBloch(0.7, 1.3)
    close(blochVector(applyGate(H, applyGate(H, s))), blochVector(s))
  })
  it('every gate acts on the sphere as the rotation rotationOf() reports', () => {
    const samples = [fromBloch(0.3, 0.2), fromBloch(1.2, 4.0), fromBloch(2.5, 5.1), KET_0, KET_1]
    const mats = [X, Y, Z, H, S, T, Rx(0.4), Ry(1.7), Rz(-2.2)]
    for (const U of mats) {
      const { axis, angle } = rotationOf(U)
      for (const s of samples) {
        const viaMatrix = blochVector(applyGate(U, s))
        const viaRotation = rotateVec(blochVector(s), axis, angle)
        close(viaMatrix, viaRotation)
      }
    }
  })
  it('reports the expected axes and angles', () => {
    const r = rotationOf(H)
    close(r.axis, [Math.SQRT1_2, 0, Math.SQRT1_2])
    expect(r.angle).toBeCloseTo(Math.PI, 9)
    expect(rotationOf(S).angle).toBeCloseTo(Math.PI / 2, 9)
    expect(rotationOf(T).angle).toBeCloseTo(Math.PI / 4, 9)
    close(rotationOf(T).axis, [0, 0, 1] as Vec3)
  })
  it('gate catalogue is complete', () => {
    expect(GATE_ORDER.every(k => GATES[k].matrix)).toBe(true)
  })
})

describe('measurement and formatting', () => {
  it('measurement collapses to a basis state with Born-rule odds', () => {
    const plus = applyGate(H, KET_0)
    expect(measure(plus, () => 0.2).outcome).toBe(0)
    expect(measure(plus, () => 0.8).outcome).toBe(1)
    expect(measure(KET_0, () => 0.999).outcome).toBe(0)
  })
  it('removes global phase', () => {
    const s = applyGate(Y, KET_0) // = i|1⟩
    expect(formatKet(s)).toBe('|1⟩')
    const [a] = canonical(applyGate(Y, applyGate(H, KET_0)))
    expect(a.im).toBeCloseTo(0, 12)
  })
  it('formats common states', () => {
    expect(formatKet(KET_0)).toBe('|0⟩')
    expect(formatKet(applyGate(H, KET_0))).toBe('0.71|0⟩ + 0.71|1⟩')
    expect(formatKet(applyGate(H, KET_1))).toBe('0.71|0⟩ − 0.71|1⟩')
    expect(formatKet(applyGate(S, applyGate(H, KET_0)))).toBe('0.71|0⟩ + 0.71i|1⟩')
    expect(formatKet(applyGate(T, applyGate(H, KET_0)))).toBe('0.71|0⟩ + (0.50 + 0.50i)|1⟩')
  })
})
