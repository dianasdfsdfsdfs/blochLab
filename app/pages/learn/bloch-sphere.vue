<script setup lang="ts">
const faq = [
  {
    q: 'Why are |0⟩ and |1⟩ opposite each other on the Bloch sphere instead of at right angles?',
    a: 'In the state formula the angle θ appears as θ/2. States that can be told apart perfectly (orthogonal states, like |0⟩ and |1⟩) are 90° apart in the underlying vector space, which becomes 180° — opposite points — on the sphere. That is why |+⟩ and |−⟩ are also opposite each other.',
  },
  {
    q: 'What is inside the Bloch sphere?',
    a: 'Points on the surface are pure states. Points inside the sphere (the “Bloch ball”) are mixed states: statistical mixtures, or a qubit that is entangled with something else. The centre is the completely mixed state — a fair coin with no phase information at all.',
  },
  {
    q: 'Can the Bloch sphere show two or more qubits?',
    a: 'Only partly. You can draw one sphere per qubit as long as the qubits are not entangled. For entangled qubits the individual arrows shrink towards the centre, because the information lives in the correlations between qubits rather than in any single one.',
  },
  {
    q: 'Who is the Bloch sphere named after?',
    a: 'Felix Bloch, the Swiss-American physicist who shared the 1952 Nobel Prize in Physics for nuclear magnetic resonance. The same picture was used for spin and for polarisation of light (where it is called the Poincaré sphere) long before quantum computing.',
  },
]
</script>

<template>
  <LessonShell
    slug="bloch-sphere"
    seo-title="The Bloch sphere explained — interactive 3D visualization"
    description="Learn the Bloch sphere step by step: how every qubit state becomes a point on a sphere, what the angles θ and φ mean, how to read probabilities and phase, and why quantum gates are rotations. Includes an interactive 3D Bloch sphere."
    short-answer="The Bloch sphere is a way to picture any state of a single qubit as a point on a ball. The north pole is |0⟩, the south pole is |1⟩, the latitude sets the measurement probabilities, the longitude is the phase, and every single-qubit gate is a rotation of the sphere."
    :faq="faq"
  >
    <h2 id="from-two-numbers-to-one-point">From two complex numbers to one point</h2>
    <p>
      In the <NuxtLink to="/learn/what-is-a-qubit">previous lesson</NuxtLink> a qubit was two complex amplitudes,
      <span class="ket">α|0⟩ + β|1⟩</span>. That sounds like four real numbers, but two of them are not free:
    </p>
    <ul>
      <li>the probabilities must add up to one, |α|² + |β|² = 1;</li>
      <li>multiplying the whole state by a common phase (a <strong>global phase</strong>) changes nothing you could ever measure.</li>
    </ul>
    <p>That leaves exactly <strong>two angles</strong>, and any state can be written as</p>
    <Tex display expr="|\psi\rangle = \cos\frac{\theta}{2}\,|0\rangle \;+\; e^{i\varphi}\,\sin\frac{\theta}{2}\,|1\rangle" />
    <p>
      Two angles are exactly what you need to name a point on the surface of a sphere — like latitude and longitude on a
      globe. That sphere is the <strong>Bloch sphere</strong>.
    </p>

    <h2 id="angles">What θ and φ mean</h2>
    <ul>
      <li>
        <strong>θ (theta)</strong> is measured down from the north pole, from 0° to 180°. It sets the balance between
        <span class="ket">|0⟩</span> and <span class="ket">|1⟩</span>: θ = 0° is <span class="ket">|0⟩</span>, θ = 180° is
        <span class="ket">|1⟩</span>, θ = 90° (the equator) is an even 50/50 split.
      </li>
      <li>
        <strong>φ (phi)</strong> is the angle around the vertical axis, from 0° to 360°. It is the
        <strong>relative phase</strong> between the two amplitudes. It does not change the odds of measuring 0 or 1, but it
        changes how the qubit responds to later gates.
      </li>
    </ul>
    <p>Drag the sliders and watch the arrow, the amplitudes and the probabilities change together:</p>
    <BlochExplorer />

    <h2 id="probabilities">Reading probabilities from the picture</h2>
    <p>The height of the arrow tip tells you the odds directly. If the tip is at height z (from −1 to +1):</p>
    <Tex display expr="P(0) = \cos^2\frac{\theta}{2} = \frac{1+z}{2}, \qquad P(1) = \sin^2\frac{\theta}{2} = \frac{1-z}{2}" />
    <p>
      So at the north pole (z = 1) you always measure 0, on the equator (z = 0) it is a coin flip, and the closer the arrow
      points down, the more likely a 1 becomes. In the explorer, the dashed cyan ring marks the arrow’s latitude.
    </p>

    <h2 id="cardinal-states">The six states worth remembering</h2>
    <p>The points where the three axes cross the sphere have their own names:</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>State</th><th>Formula</th><th>Where</th><th>(x, y, z)</th></tr>
        </thead>
        <tbody>
          <tr><td class="ket">|0⟩</td><td>|0⟩</td><td>north pole</td><td>(0, 0, 1)</td></tr>
          <tr><td class="ket">|1⟩</td><td>|1⟩</td><td>south pole</td><td>(0, 0, −1)</td></tr>
          <tr><td class="ket">|+⟩</td><td>(|0⟩ + |1⟩)/√2</td><td>equator, +X</td><td>(1, 0, 0)</td></tr>
          <tr><td class="ket">|−⟩</td><td>(|0⟩ − |1⟩)/√2</td><td>equator, −X</td><td>(−1, 0, 0)</td></tr>
          <tr><td class="ket">|+i⟩</td><td>(|0⟩ + i|1⟩)/√2</td><td>equator, +Y</td><td>(0, 1, 0)</td></tr>
          <tr><td class="ket">|−i⟩</td><td>(|0⟩ − i|1⟩)/√2</td><td>equator, −Y</td><td>(0, −1, 0)</td></tr>
        </tbody>
      </table>
    </div>
    <p>The general conversion from angles to coordinates is the usual one for a sphere:</p>
    <Tex display expr="x = \sin\theta\cos\varphi,\qquad y = \sin\theta\sin\varphi,\qquad z = \cos\theta" />
    <KeyIdea>
      <p>
        Opposite points are states that can be told apart perfectly. <span class="ket">|0⟩</span> and <span class="ket">|1⟩</span>
        are opposite, and so are <span class="ket">|+⟩</span> and <span class="ket">|−⟩</span>. That is why θ appears as θ/2
        in the formula.
      </p>
    </KeyIdea>

    <h2 id="gates-are-rotations">Gates are rotations</h2>
    <p>
      The real power of the picture: every operation you can do on one qubit is a <strong>rotation of the sphere</strong>
      around some axis. The X gate turns it 180° around the X axis, Z turns it 180° around the vertical axis, and the
      Hadamard gate turns it 180° around the diagonal between X and Z. While a gate runs below, its rotation axis lights up
      in cyan and the tip leaves a trail.
    </p>
    <QubitLab heading="Rotate the sphere with gates" />
    <p>
      Notice that Z, S and T never change P(0) and P(1): they spin the arrow around the vertical axis, so its height stays
      the same and only the phase changes. The <NuxtLink to="/learn/quantum-gates">quantum gates lesson</NuxtLink> goes
      through each gate in detail.
    </p>

    <h2 id="limits">What the Bloch sphere cannot show</h2>
    <p>
      The sphere describes exactly <strong>one qubit</strong>. Two qubits need four complex amplitudes, and once they are
      <em>entangled</em> no pair of separate arrows can describe them — each individual qubit’s arrow shrinks into the
      inside of its sphere. Points inside the sphere are called mixed states. We will meet them again in the entanglement
      lesson.
    </p>

    <h2 id="summary">Summary</h2>
    <ul>
      <li>Every pure state of one qubit is a point on the surface of the Bloch sphere.</li>
      <li>North pole = <span class="ket">|0⟩</span>, south pole = <span class="ket">|1⟩</span>, equator = 50/50 superpositions.</li>
      <li>Latitude (θ) sets the probabilities: P(0) = (1 + z)/2. Longitude (φ) is the relative phase.</li>
      <li>Single-qubit gates are rotations of the sphere.</li>
    </ul>
  </LessonShell>
</template>
