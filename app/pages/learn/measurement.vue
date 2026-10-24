<script setup lang="ts">
const faq = [
  {
    q: 'Why does measuring a qubit destroy its superposition?',
    a: 'A measurement in the computational basis has only two possible results, 0 and 1, and quantum mechanics says that right after you see a result the qubit is in the matching state |0⟩ or |1⟩. This “collapse” is part of the rules of the theory and is confirmed by every experiment: measure again immediately and you get the same answer.',
  },
  {
    q: 'Can’t we just copy a qubit and measure the copies?',
    a: 'No. The no-cloning theorem shows that no physical process can make an exact copy of an unknown quantum state. To learn the probabilities you have to prepare the same state again and again and measure each fresh copy — that is what “shots” are.',
  },
  {
    q: 'Is the result of a quantum measurement truly random?',
    a: 'Quantum mechanics only predicts probabilities. Experiments testing Bell’s inequalities have ruled out a broad class of “hidden variable” explanations in which the outcome was secretly fixed in advance by local information, which is why quantum devices are used as certified random number generators.',
  },
  {
    q: 'How many shots do I need?',
    a: 'It depends on how precisely you want the probability. The statistical error shrinks like 1/√N: with 100 shots of a 50/50 state you typically see 50 ± 5 zeros, with 1000 shots about 500 ± 16. Real quantum computers often use thousands of shots per circuit.',
  },
]
</script>

<template>
  <LessonShell
    slug="measurement"
    seo-title="Quantum measurement explained: collapse, Born rule and shots"
    description="What happens when you measure a qubit? Learn the Born rule, wavefunction collapse and why quantum programs are run many times (shots) — with an interactive simulator that measures a qubit 1000 times."
    short-answer="Measuring a qubit gives one classical bit: 0 with probability |α|², or 1 with probability |β|². Afterwards the qubit is left in the state you saw, so the superposition is gone — which is why quantum programs are run many times (shots) to reveal the probabilities."
    :faq="faq"
  >
    <h2 id="one-shot">One measurement, one bit</h2>
    <p>
      However rich a qubit’s state is, a measurement gives you a single 0 or 1. Which one you get is random, with odds set
      by the <strong>Born rule</strong>:
    </p>
    <Tex display expr="P(0) = |\alpha|^2 = \cos^2\frac{\theta}{2}, \qquad P(1) = |\beta|^2 = \sin^2\frac{\theta}{2}" />
    <p>
      On the Bloch sphere that is simply the height of the arrow: the higher it points, the more likely a 0.
    </p>

    <h2 id="shots">Shots: repeat to see the probabilities</h2>
    <p>
      A single result tells you almost nothing about the state — a 0 could come from <span class="ket">|0⟩</span> or from a
      state that gives 0 only 1% of the time. So quantum computers <strong>prepare the same state and measure it many
      times</strong>. Each repetition is called a <strong>shot</strong>. Try it: prepare a state with the slider, then run
      shots and watch the bars approach the predicted value (the white line).
    </p>
    <ShotsLab />
    <KeyIdea>
      <p>
        Probabilities are a property of many runs, not of one. With 10 shots the bars jump around; with 1000 they settle
        close to the prediction. The typical error shrinks like 1/√N.
      </p>
    </KeyIdea>

    <h2 id="collapse">Collapse: the state changes when you look</h2>
    <p>
      Measurement is not a passive look. If you measure and see 0, the qubit is now <span class="ket">|0⟩</span>; see 1 and it
      is <span class="ket">|1⟩</span>. On the sphere the arrow snaps to a pole — that flash you see when you press
      <strong>Measure</strong>. Measure again straight away and you will get the same answer every time, because the
      superposition is gone.
    </p>
    <QubitLab heading="Measure, then measure again" :gates="['H', 'X', 'Z']" />
    <p>
      Try: Reset → H → Measure → Measure → Measure. The first result is a coin flip; every one after it repeats it.
    </p>

    <h2 id="phase-is-invisible">Measurement cannot see the phase — unless you rotate first</h2>
    <p>
      <span class="ket">|+⟩</span> and <span class="ket">|−⟩</span> both sit on the equator, so both give 50/50 results.
      A measurement along the vertical axis cannot tell them apart. But you can <em>rotate before you measure</em>:
      applying H turns <span class="ket">|+⟩</span> into <span class="ket">|0⟩</span> and <span class="ket">|−⟩</span> into
      <span class="ket">|1⟩</span>. Then a measurement tells them apart with certainty.
    </p>
    <p>
      This trick — rotate the question you want to ask onto the vertical axis, then measure — is used everywhere in
      quantum computing. It is called <strong>measuring in a different basis</strong>.
    </p>
    <KeyIdea title="Try this" tone="note">
      <p>Reset → H → Z → H → Measure. You will always get 1. Without the Z you would always get 0.</p>
    </KeyIdea>

    <h2 id="summary">Summary</h2>
    <ul>
      <li>A measurement returns one bit; the odds are |α|² for 0 and |β|² for 1.</li>
      <li>After measuring, the qubit is in the state you observed (collapse).</li>
      <li>To learn the probabilities, prepare and measure many times — shots.</li>
      <li>Phase is invisible to a direct measurement, but rotating first (for example with H) makes it visible.</li>
    </ul>
  </LessonShell>
</template>
