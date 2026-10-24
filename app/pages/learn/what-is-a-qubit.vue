<script setup lang="ts">
const faq = [
  {
    q: 'Is a qubit 0 and 1 at the same time?',
    a: 'Not in the everyday sense. A qubit in superposition is described by two amplitudes, one for 0 and one for 1. It is a genuinely new kind of state: when you measure it you get just one answer, but before that the two amplitudes can interfere with each other, which a hidden “it was really 0 all along” could never do.',
  },
  {
    q: 'How much information can one qubit store?',
    a: 'Describing a qubit takes two real numbers (two angles), so its state holds a continuum of possibilities. But when you measure it you only ever get one classical bit out. Holevo’s theorem makes this precise: one qubit can carry at most one bit of retrievable classical information.',
  },
  {
    q: 'What are qubits made of in real quantum computers?',
    a: 'Any physical system with two well-separated states can serve: tiny superconducting circuits cooled close to absolute zero, single trapped ions or neutral atoms held by lasers, the polarization of a photon, or the spin of an electron. The maths in this lesson is the same for all of them.',
  },
  {
    q: 'Why do qubits use complex numbers?',
    a: 'Because amplitudes have a phase as well as a size. The phase does not change the odds of a single measurement, but it decides how amplitudes add up or cancel after further gates. Complex numbers are the natural bookkeeping for “size plus angle”.',
  },
]
</script>

<template>
  <LessonShell
    slug="what-is-a-qubit"
    seo-title="What is a qubit? Superposition and amplitudes explained simply"
    description="A beginner-friendly explanation of qubits: how a qubit differs from a classical bit, what superposition and amplitudes mean, and how the Born rule turns them into probabilities — with an interactive 3D qubit."
    short-answer="A qubit is the quantum version of a bit. When you measure it you always get 0 or 1, but before that it can be in a superposition α|0⟩ + β|1⟩, where two complex numbers α and β set the odds: |α|² for 0 and |β|² for 1."
    :faq="faq"
  >
    <h2 id="bits-and-qubits">From bits to qubits</h2>
    <p>
      Every classical computer is built from <strong>bits</strong>. A bit is always in exactly one of two states, 0 or 1 — a
      switch that is off or on. Everything else, from photos to this web page, is long strings of those switches.
    </p>
    <p>
      A <strong>qubit</strong> (short for <em>quantum bit</em>) also has two basic states. Physicists write them as
      <span class="ket">|0⟩</span> and <span class="ket">|1⟩</span>. The difference is what is allowed <em>between</em>
      measurements: a qubit can be in a combination of both basic states, called a <strong>superposition</strong>.
    </p>

    <KeyIdea>
      <p>
        A bit stores a 0 <em>or</em> a 1. A qubit stores two numbers that describe how much of <span class="ket">|0⟩</span>
        and how much of <span class="ket">|1⟩</span> it contains. Measuring it still gives a single 0 or 1.
      </p>
    </KeyIdea>

    <h2 id="dirac-notation">Reading the notation: |0⟩ and |1⟩</h2>
    <p>
      The angle-bracket symbol <span class="ket">|ψ⟩</span> is called a <strong>ket</strong> (from Dirac’s “bra-ket”
      notation). It simply means “the quantum state named ψ”. For one qubit, the two basis states are column vectors:
    </p>
    <Tex display expr="|0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}, \qquad |1\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix}" />
    <p>A general qubit state is a weighted sum of the two:</p>
    <Tex display expr="|\psi\rangle = \alpha\,|0\rangle + \beta\,|1\rangle = \begin{pmatrix} \alpha \\ \beta \end{pmatrix}" />
    <p>
      The weights α (alpha) and β (beta) are called <strong>amplitudes</strong>. They are complex numbers — each has a
      size and an angle.
    </p>

    <h2 id="born-rule">Amplitudes become probabilities</h2>
    <p>
      Amplitudes are not probabilities themselves, but they tell you the probabilities. This is the
      <strong>Born rule</strong>:
    </p>
    <Tex display expr="P(0) = |\alpha|^2, \qquad P(1) = |\beta|^2, \qquad |\alpha|^2 + |\beta|^2 = 1" />
    <p>
      For example, the state <span class="ket">0.6|0⟩ + 0.8|1⟩</span> gives 0 with probability 0.6² = 36% and 1 with
      probability 0.8² = 64%. The last condition (the probabilities add up to 1) is why a valid state always has
      “length” one.
    </p>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>State</th><th>α</th><th>β</th><th>P(0)</th><th>P(1)</th></tr>
        </thead>
        <tbody>
          <tr><td class="ket">|0⟩</td><td>1</td><td>0</td><td>100%</td><td>0%</td></tr>
          <tr><td class="ket">|1⟩</td><td>0</td><td>1</td><td>0%</td><td>100%</td></tr>
          <tr><td class="ket">|+⟩</td><td>1/√2</td><td>1/√2</td><td>50%</td><td>50%</td></tr>
          <tr><td class="ket">|−⟩</td><td>1/√2</td><td>−1/√2</td><td>50%</td><td>50%</td></tr>
          <tr><td class="ket">0.6|0⟩ + 0.8|1⟩</td><td>0.6</td><td>0.8</td><td>36%</td><td>64%</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="try-it">Try it: flip and split a qubit</h2>
    <p>
      Below is a live qubit. The arrow shows its state (the next lesson explains the sphere in detail). Press
      <strong>X</strong> to flip <span class="ket">|0⟩</span> into <span class="ket">|1⟩</span> — the quantum NOT. Press
      <strong>H</strong> to put it into an equal superposition, then <strong>Measure</strong> a few times after resetting.
    </p>
    <QubitLab heading="A single qubit" :gates="['X', 'H', 'Z']" />

    <h2 id="why-complex">Why the minus sign matters</h2>
    <p>
      Look at <span class="ket">|+⟩</span> and <span class="ket">|−⟩</span> in the table. They give exactly the same
      measurement statistics — 50/50 — yet they are different states. The only difference is the sign (more generally,
      the <strong>phase</strong>) of β.
    </p>
    <p>
      You can see the difference by applying one more gate. Hadamard turns <span class="ket">|+⟩</span> into
      <span class="ket">|0⟩</span> but turns <span class="ket">|−⟩</span> into <span class="ket">|1⟩</span>: the
      amplitudes add up in one case and cancel in the other. That adding and cancelling is called
      <strong>interference</strong>, and it is the engine behind every quantum algorithm.
    </p>
    <KeyIdea title="Try this" tone="note">
      <p>In the widget above: Reset → H → Z → H. You end at |1⟩, not |0⟩ — the Z gate only changed the phase, but that was enough.</p>
    </KeyIdea>

    <h2 id="not-a-hidden-coin">Superposition is not a hidden coin</h2>
    <p>
      A tempting picture is a coin under a cup: it is “really” heads or tails, we just do not know which. If qubits worked
      like that, <span class="ket">|+⟩</span> and <span class="ket">|−⟩</span> would be the same thing — both just
      “unknown, 50/50” — and the experiment above could not tell them apart. It can, so superposition is something richer
      than ignorance.
    </p>

    <h2 id="summary">Summary</h2>
    <ul>
      <li>A qubit has two basis states, <span class="ket">|0⟩</span> and <span class="ket">|1⟩</span>.</li>
      <li>Its general state is <span class="ket">α|0⟩ + β|1⟩</span> with complex amplitudes α and β.</li>
      <li>Measurement gives 0 with probability |α|² and 1 with probability |β|².</li>
      <li>The phase of the amplitudes is invisible in a single measurement but changes what later gates do.</li>
    </ul>
    <p>Next, we turn those two amplitudes into a single point you can see and rotate: the Bloch sphere.</p>
  </LessonShell>
</template>
