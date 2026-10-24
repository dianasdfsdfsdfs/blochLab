<script setup lang="ts">
const faq = [
  {
    q: 'Why are quantum gates reversible?',
    a: 'Quantum gates are unitary matrices: they preserve the total probability, and every unitary U has an inverse U† that undoes it. On the Bloch sphere this is obvious — every rotation can be undone by rotating back. Measurement is the one operation that is not reversible.',
  },
  {
    q: 'How many different single-qubit gates are there?',
    a: 'Infinitely many: any rotation of the Bloch sphere, by any angle around any axis, is a valid gate. X, Y, Z, H, S and T are simply the most common named ones. Rotations by an arbitrary angle are written Rx(θ), Ry(θ) and Rz(θ).',
  },
  {
    q: 'What is a universal gate set?',
    a: 'A small set of gates that can approximate any quantum operation to any accuracy when combined. A standard example is {H, T, CNOT}: H and T alone can approximate any single-qubit rotation, and adding the two-qubit CNOT gate makes the set universal for any number of qubits.',
  },
  {
    q: 'What is the difference between the Hadamard gate and a NOT gate?',
    a: 'The NOT gate (X) swaps |0⟩ and |1⟩ — a 180° turn around the X axis. The Hadamard gate turns 180° around the diagonal between X and Z, so it moves the poles onto the equator: |0⟩ becomes the superposition |+⟩. Both are their own inverse.',
  },
]
</script>

<template>
  <LessonShell
    slug="quantum-gates"
    seo-title="Quantum gates explained: X, Y, Z, Hadamard, S and T on the Bloch sphere"
    description="A visual guide to single-qubit quantum gates. See the Pauli X, Y, Z gates, the Hadamard gate and the S and T phase gates as rotations of the Bloch sphere, with their matrices and an interactive 3D simulator."
    short-answer="A quantum gate is an operation that changes a qubit’s state. For a single qubit every gate is a rotation of the Bloch sphere: X, Y and Z turn it 180° around their own axes, Hadamard turns it 180° around the diagonal between X and Z, and S and T add 90° and 45° of phase."
    :faq="faq"
  >
    <h2 id="gates-are-matrices">Gates are matrices — and rotations</h2>
    <p>
      Mathematically, a gate on one qubit is a 2×2 matrix U that multiplies the state vector:
      <span class="ket">|ψ'⟩ = U|ψ⟩</span>. Not every matrix is allowed — it must be <strong>unitary</strong>, which means it
      keeps the total probability equal to 1 and can always be undone.
    </p>
    <p>
      On the <NuxtLink to="/learn/bloch-sphere">Bloch sphere</NuxtLink> that rule has a beautiful meaning:
      <strong>every single-qubit gate is a rotation</strong> of the sphere around some axis by some angle. Press any gate
      below; its rotation axis lights up in cyan while it acts.
    </p>
    <QubitLab heading="All six gates" />

    <h2 id="overview">The six gates at a glance</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Gate</th><th>Axis</th><th>Angle</th><th>|0⟩ becomes</th><th>Changes P(0)?</th></tr>
        </thead>
        <tbody>
          <tr><td>X</td><td>X</td><td>180°</td><td class="ket">|1⟩</td><td>yes</td></tr>
          <tr><td>Y</td><td>Y</td><td>180°</td><td class="ket">i|1⟩</td><td>yes</td></tr>
          <tr><td>Z</td><td>Z</td><td>180°</td><td class="ket">|0⟩</td><td>no</td></tr>
          <tr><td>H</td><td>(X + Z)/√2</td><td>180°</td><td class="ket">|+⟩</td><td>yes</td></tr>
          <tr><td>S</td><td>Z</td><td>90°</td><td class="ket">|0⟩</td><td>no</td></tr>
          <tr><td>T</td><td>Z</td><td>45°</td><td class="ket">|0⟩</td><td>no</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="pauli-x">Pauli-X: the quantum NOT</h2>
    <Tex display expr="X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \qquad X|0\rangle = |1\rangle,\quad X|1\rangle = |0\rangle" />
    <p>
      X swaps the two amplitudes. On the sphere it is a half turn around the X axis, which carries the north pole to the
      south pole. It is the direct analogue of the classical NOT gate.
    </p>

    <h2 id="pauli-y">Pauli-Y</h2>
    <Tex display expr="Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}" />
    <p>
      A half turn around the Y axis. Like X it flips <span class="ket">|0⟩</span> and <span class="ket">|1⟩</span>, but it also
      changes the phase. In fact Y = i·X·Z exactly.
    </p>

    <h2 id="pauli-z">Pauli-Z: the phase flip</h2>
    <Tex display expr="Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}, \qquad Z|+\rangle = |-\rangle" />
    <p>
      Z leaves <span class="ket">|0⟩</span> alone and flips the sign of <span class="ket">|1⟩</span>. On the sphere it is a half
      turn around the vertical axis: the poles do not move and the probabilities never change, but a state on the equator
      swings to the opposite side.
    </p>

    <h2 id="hadamard">The Hadamard gate</h2>
    <Tex display expr="H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}, \qquad H|0\rangle = |+\rangle,\quad H|1\rangle = |-\rangle" />
    <p>
      The most used gate in quantum computing. It is a half turn around the diagonal axis halfway between X and Z, so it
      swaps the vertical axis with the X axis: poles go to the equator and back. Starting from <span class="ket">|0⟩</span> it
      creates an equal superposition, which is why almost every algorithm begins with a layer of H gates.
    </p>
    <KeyIdea>
      <p>Because H swaps the Z and X axes, sandwiching a gate between two H’s swaps its role: H·Z·H = X and H·X·H = Z.</p>
    </KeyIdea>

    <h2 id="s-gate">The S gate</h2>
    <Tex display expr="S = \begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix}, \qquad S|+\rangle = |{+i}\rangle" />
    <p>
      A quarter turn around the vertical axis: it adds a 90° phase to <span class="ket">|1⟩</span>. Two S gates make a Z.
    </p>

    <h2 id="t-gate">The T gate</h2>
    <Tex display expr="T = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix}" />
    <p>
      An eighth of a turn around the vertical axis (45° of phase). Two T gates make an S. Together with H, the T gate can
      approximate any single-qubit rotation, which makes it essential for universal quantum computing.
    </p>

    <h2 id="order-matters">Order matters</h2>
    <p>
      Rotations in 3D do not commute, so neither do gates. Starting from <span class="ket">|0⟩</span>:
    </p>
    <ul>
      <li>H, then Z → <span class="ket">|−⟩</span></li>
      <li>Z, then H → <span class="ket">|+⟩</span></li>
    </ul>
    <p>Try both in the widget above (press Reset between them) and compare where the arrow ends up.</p>

    <h2 id="undo">Every gate can be undone</h2>
    <p>
      Because gates are rotations, you can always rotate back. X, Y, Z and H are their own inverses — apply them twice and
      you are back where you started. S needs three more S gates (or one S†), and T needs seven more T gates (or one T†).
      Measurement is the only step in a quantum program that cannot be reversed.
    </p>

    <h2 id="summary">Summary</h2>
    <ul>
      <li>A single-qubit gate is a unitary 2×2 matrix, and on the Bloch sphere it is a rotation.</li>
      <li>X, Y, Z are half turns around the three axes; H is a half turn around the X–Z diagonal.</li>
      <li>Z, S and T only change the phase — they spin the arrow around the vertical axis.</li>
      <li>Gates do not commute: their order changes the result.</li>
    </ul>
  </LessonShell>
</template>
