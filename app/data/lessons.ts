export interface Lesson {
  slug: string
  number: string
  title: string
  /** Short card description. */
  blurb: string
  /** Lesson pages that exist. The rest show as "coming soon". */
  ready: boolean
}

export const LESSONS: Lesson[] = [
  {
    slug: 'what-is-a-qubit',
    number: '01',
    title: 'What is a qubit?',
    blurb: 'How a qubit differs from a bit, and what “a bit of 0 and a bit of 1” really means.',
    ready: true,
  },
  {
    slug: 'bloch-sphere',
    number: '02',
    title: 'The Bloch sphere',
    blurb: 'Every qubit state is a point on a sphere. Read latitude as probability and longitude as phase.',
    ready: true,
  },
  {
    slug: 'measurement',
    number: '03',
    title: 'Measurement',
    blurb: 'Why looking at a qubit changes it, and why you need many runs to see the full picture.',
    ready: true,
  },
  {
    slug: 'quantum-gates',
    number: '04',
    title: 'Quantum gates',
    blurb: 'X, Y, Z, Hadamard, S and T — each one is simply a rotation of the sphere.',
    ready: true,
  },
  {
    slug: 'multiple-qubits',
    number: '05',
    title: 'Multiple qubits',
    blurb: 'Why two qubits need four numbers, and how the CNOT gate links them.',
    ready: false,
  },
  {
    slug: 'entanglement',
    number: '06',
    title: 'Entanglement',
    blurb: 'Bell pairs, and why an entangled qubit has no arrow of its own.',
    ready: false,
  },
  {
    slug: 'interference',
    number: '07',
    title: 'Interference',
    blurb: 'How amplitudes cancel and add up — the trick behind every quantum algorithm.',
    ready: false,
  },
]

export const lessonBySlug = (slug: string) => LESSONS.find(l => l.slug === slug)
export const nextLesson = (slug: string) => {
  const i = LESSONS.findIndex(l => l.slug === slug)
  return i >= 0 ? LESSONS[i + 1] : undefined
}
export const prevLesson = (slug: string) => {
  const i = LESSONS.findIndex(l => l.slug === slug)
  return i > 0 ? LESSONS[i - 1] : undefined
}
