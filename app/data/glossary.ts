export interface GlossaryTerm {
  id: string
  term: string
  definition: string
  /** Lesson that explains the term in depth. */
  lesson?: string
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: 'qubit',
    term: 'Qubit',
    definition:
      'The basic unit of quantum information. Like a bit it can give 0 or 1 when measured, but before measurement it can be in a superposition — a weighted combination of both, described by two complex numbers.',
    lesson: 'what-is-a-qubit',
  },
  {
    id: 'superposition',
    term: 'Superposition',
    definition:
      'A state that is a combination of |0⟩ and |1⟩ at the same time, written α|0⟩ + β|1⟩. It is not “secretly 0 or 1”: the two parts can interfere with each other, which is what quantum algorithms exploit.',
    lesson: 'what-is-a-qubit',
  },
  {
    id: 'amplitude',
    term: 'Amplitude',
    definition:
      'The complex number in front of each basis state (α and β in α|0⟩ + β|1⟩). Its squared magnitude is a probability; its angle is the phase.',
    lesson: 'what-is-a-qubit',
  },
  {
    id: 'born-rule',
    term: 'Born rule',
    definition:
      'The rule that turns amplitudes into probabilities: the chance of measuring 0 is |α|² and the chance of measuring 1 is |β|². The two always add up to 1.',
    lesson: 'measurement',
  },
  {
    id: 'phase',
    term: 'Phase',
    definition:
      'The angle of a complex amplitude. The relative phase between |0⟩ and |1⟩ does not change measurement probabilities directly, but it changes how the qubit reacts to later gates. On the Bloch sphere it is the longitude φ.',
    lesson: 'bloch-sphere',
  },
  {
    id: 'global-phase',
    term: 'Global phase',
    definition:
      'Multiplying the whole state by the same phase factor e^{iγ}. It has no observable effect at all, which is why two numbers α and β really carry only two angles of information.',
    lesson: 'bloch-sphere',
  },
  {
    id: 'bloch-sphere',
    term: 'Bloch sphere',
    definition:
      'A unit sphere on which every pure state of one qubit is a single point. |0⟩ is the north pole, |1⟩ the south pole, equal superpositions sit on the equator, and gates act as rotations.',
    lesson: 'bloch-sphere',
  },
  {
    id: 'dirac-notation',
    term: 'Dirac notation (ket)',
    definition:
      'The “bra-ket” notation physicists use for quantum states. A ket like |ψ⟩ is a state vector; |0⟩ and |1⟩ are the two basis states of a qubit.',
    lesson: 'what-is-a-qubit',
  },
  {
    id: 'basis-state',
    term: 'Basis state',
    definition:
      'One of the reference states every other state is built from. For one qubit in the computational basis these are |0⟩ and |1⟩.',
    lesson: 'what-is-a-qubit',
  },
  {
    id: 'measurement',
    term: 'Measurement',
    definition:
      'Reading out a qubit. It returns a classical 0 or 1 with Born-rule probabilities and leaves the qubit in the state it reported, so the original superposition is gone.',
    lesson: 'measurement',
  },
  {
    id: 'collapse',
    term: 'Collapse',
    definition:
      'The change of state caused by measurement: after reading 0 the qubit is |0⟩, after reading 1 it is |1⟩. On the Bloch sphere the arrow snaps to a pole.',
    lesson: 'measurement',
  },
  {
    id: 'shots',
    term: 'Shots',
    definition:
      'Repetitions of the same experiment. A single measurement gives one random bit; running many shots reveals the probabilities.',
    lesson: 'measurement',
  },
  {
    id: 'quantum-gate',
    term: 'Quantum gate',
    definition:
      'An operation that changes a qubit’s state. Mathematically it is a unitary matrix; on the Bloch sphere a single-qubit gate is a rotation around some axis.',
    lesson: 'quantum-gates',
  },
  {
    id: 'pauli-gates',
    term: 'Pauli gates (X, Y, Z)',
    definition:
      'Three basic gates that rotate the Bloch sphere by 180° around the X, Y or Z axis. X is the quantum NOT, Z flips the phase, Y does both.',
    lesson: 'quantum-gates',
  },
  {
    id: 'hadamard-gate',
    term: 'Hadamard gate',
    definition:
      'The gate H, a 180° rotation around the axis halfway between X and Z. It turns |0⟩ into the equal superposition |+⟩ = (|0⟩ + |1⟩)/√2 and back again.',
    lesson: 'quantum-gates',
  },
  {
    id: 's-gate',
    term: 'S and T gates',
    definition:
      'Phase gates: S rotates 90° around the Z axis and T rotates 45°. They change the phase of |1⟩ without changing the probabilities.',
    lesson: 'quantum-gates',
  },
  {
    id: 'unitary',
    term: 'Unitary',
    definition:
      'A matrix U with U†U = I. Unitary operations keep the total probability equal to 1 and can always be undone, which is why quantum gates are reversible.',
    lesson: 'quantum-gates',
  },
  {
    id: 'quantum-circuit',
    term: 'Quantum circuit',
    definition:
      'A diagram of a quantum program: horizontal wires are qubits, boxes on them are gates applied from left to right, and meters at the end are measurements.',
  },
  {
    id: 'cnot-gate',
    term: 'CNOT gate',
    definition:
      'A two-qubit gate: it flips the target qubit if and only if the control qubit is 1. Together with the Hadamard gate it creates entanglement.',
  },
  {
    id: 'entanglement',
    term: 'Entanglement',
    definition:
      'A correlation between qubits so strong that the group has a definite state while the individual qubits do not. Measuring one immediately tells you about the other.',
  },
  {
    id: 'bell-state',
    term: 'Bell state',
    definition:
      'One of four maximally entangled two-qubit states, for example (|00⟩ + |11⟩)/√2: each qubit alone is a perfect coin flip, but the two always agree.',
  },
  {
    id: 'interference',
    term: 'Interference',
    definition:
      'Amplitudes can add up or cancel out, just like waves. Quantum algorithms arrange interference so wrong answers cancel and the right one is amplified.',
  },
]
