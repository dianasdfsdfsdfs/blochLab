<script setup lang="ts">
import { LESSONS } from '~/data/lessons'
import { GLOSSARY } from '~/data/glossary'
import type { GateKey } from '~/lib/quantum'

const { siteUrl } = useRuntimeConfig().public

useSeoMeta({
  title: 'See a qubit think — learn quantum computing in 3D',
  titleTemplate: '%s',
  description:
    'Bloch Lab explains quantum computing with interactive 3D. Rotate a qubit on the Bloch sphere, apply quantum gates and watch measurement happen. Free, no account, beginner friendly.',
  ogTitle: 'Bloch Lab — learn quantum computing visually',
  ogDescription: 'Interactive 3D Bloch sphere, quantum gates and measurement explained simply.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl.replace(/\/$/, '')}/` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Bloch Lab',
        url: siteUrl,
        description: 'Learn quantum computing visually with an interactive 3D Bloch sphere.',
        inLanguage: 'en',
      }),
    },
  ],
})

const glossaryPreview = GLOSSARY.slice(0, 12)

// One qubit shared by the 3D lab and the "What am I looking at?" guide,
// so the guide's "try it" buttons move the arrow on the sphere.
const q = useQubit()
const lab = ref<{ $el: HTMLElement } | null>(null)

function showLab() {
  const el = lab.value?.$el
  if (!el) return
  const r = el.getBoundingClientRect()
  const sphereBottom = r.top + Math.min(r.height, 560)
  if (r.top < 64 || sphereBottom > window.innerHeight) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function tryIt(seq: ('reset' | 'measure' | GateKey)[]) {
  showLab()
  for (const s of seq) {
    if (s === 'reset') q.reset()
    else if (s === 'measure') q.measure()
    else q.gate(s)
  }
}
const NuxtLinkC = resolveComponent('NuxtLink')
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="container hero">
      <div class="hero-title">
        <div class="pill glass">
          <span class="dot" />
          Quantum computing, visualized
        </div>
        <h1 class="grad-text">See a qubit think.</h1>
      </div>

      <QubitLab ref="lab" class="hero-lab" :qubit="q" />

      <div class="guide glass" aria-labelledby="guide-title">
        <h2 id="guide-title" class="guide-title">What am I looking at?</h2>
        <p class="guide-intro">
          This is a <strong>Bloch sphere</strong> — a map of every state one <strong>qubit</strong> (a quantum bit) can be in.
          The glowing arrow shows the qubit right now.
        </p>
        <ul class="guide-list">
          <li>
            <span class="g-icon i-poles" aria-hidden="true">0<small>1</small></span>
            <div>
              <h3>Top is |0⟩, bottom is |1⟩</h3>
              <p>They are the qubit’s version of a normal bit’s 0 and 1. When you measure, the qubit always answers 0 or 1.</p>
            </div>
          </li>
          <li>
            <span class="g-icon i-vert" aria-hidden="true">↕</span>
            <div>
              <h3>Up and down = the odds</h3>
              <p>The higher the arrow, the more likely you get 0. On the equator it’s a 50/50 coin flip.</p>
              <div class="try">
                <button type="button" @click="tryIt(['reset', 'H'])">Try H → 50/50</button>
                <button type="button" @click="tryIt(['reset', 'X'])">Try X → always 1</button>
              </div>
            </div>
          </li>
          <li>
            <span class="g-icon i-around" aria-hidden="true">↻</span>
            <div>
              <h3>Around the equator = the phase</h3>
              <p>
                Turning sideways doesn’t change the odds, but it changes how the qubit reacts to the next gate.
                |+⟩, |−⟩, |+i⟩ and |−i⟩ are all 50/50 states — the sign is their phase.
              </p>
              <div class="try">
                <button type="button" @click="tryIt(['reset', 'H', 'Z'])">Try H, then Z → |+⟩ to |−⟩</button>
              </div>
            </div>
          </li>
          <li>
            <span class="g-icon i-gate" aria-hidden="true">G</span>
            <div>
              <h3>Gates are moves</h3>
              <p>
                Each button turns the arrow around an axis — that is a <strong>quantum gate</strong>. A quantum program is
                a sequence of gates, and at the end you <strong>measure</strong>: the arrow jumps to 0 or 1.
              </p>
              <div class="try">
                <button type="button" @click="tryIt(['measure'])">Measure now</button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div class="hero-cta">
        <NuxtLink to="/learn/bloch-sphere" class="btn btn-primary">Full Bloch sphere lesson</NuxtLink>
        <NuxtLink to="/learn/what-is-a-qubit" class="btn btn-ghost">Start from the basics</NuxtLink>
      </div>
    </section>

    <!-- LEARNING PATH -->
    <section id="learn" class="container section">
      <div class="section-head">
        <span class="eyebrow">Learning path</span>
        <h2>From one qubit to entanglement, step by step.</h2>
        <p>Seven short lessons. Each one opens with a plain answer, then lets you play with the idea in 3D.</p>
      </div>
      <div class="cards">
        <component
          :is="l.ready ? NuxtLinkC : 'div'"
          v-for="l in LESSONS"
          :key="l.slug"
          :to="l.ready ? `/learn/${l.slug}` : undefined"
          class="card glass"
          :class="{ soon: !l.ready }"
        >
          <span class="num">{{ l.number }}</span>
          <span class="card-title">{{ l.title }}</span>
          <span class="card-text">{{ l.blurb }}</span>
          <span v-if="!l.ready" class="badge">Coming soon</span>
        </component>
        <NuxtLink to="/playground" class="card card-accent">
          <span class="num">Then</span>
          <span class="card-title">Build your own circuits →</span>
          <span class="card-text">Put everything together in the Playground.</span>
        </NuxtLink>
      </div>
    </section>

    <!-- HOW A LESSON WORKS -->
    <section class="container section how">
      <div class="section-head">
        <span class="eyebrow">How it works</span>
        <h2>Every lesson works the same way.</h2>
      </div>
      <div class="steps">
        <div class="step glass">
          <span class="step-n s1">1</span>
          <h3>Read the short answer</h3>
          <p>Each page starts with a plain two-sentence explanation. No jargon until you need it.</p>
        </div>
        <div class="step glass">
          <span class="step-n s2">2</span>
          <h3>See it move in 3D</h3>
          <p>Interactive scenes show what the formula is actually doing. Every symbol is explained in words.</p>
        </div>
        <div class="step glass">
          <span class="step-n s3">3</span>
          <h3>Try it yourself</h3>
          <p>Play with the gates right inside the lesson, then experiment freely in the Playground.</p>
        </div>
      </div>
    </section>

    <!-- PLAYGROUND TEASER -->
    <section class="container section">
      <div class="teaser glass">
        <div class="teaser-copy">
          <span class="eyebrow cyan">Playground</span>
          <h2>Build circuits. Watch every qubit move.</h2>
          <p>
            Put gates on a wire, press play and follow each step on the Bloch sphere. Multi-qubit circuits and
            entanglement are next on the roadmap.
          </p>
          <NuxtLink to="/playground" class="btn btn-primary">Open the Playground</NuxtLink>
        </div>
        <div class="teaser-art" aria-hidden="true">
          <div class="mini-circuit">
            <span class="q q0">q0</span>
            <span class="q q1">q1</span>
            <i class="w w0" />
            <i class="w w1" />
            <b class="g h">H</b>
            <i class="ctl" />
            <i class="ctl-line" />
            <b class="tgt">+</b>
            <b class="m m0" />
            <b class="m m1" />
          </div>
          <div class="hist">
            <div class="col"><span>50%</span><i class="bar b-a" /><em>00</em></div>
            <div class="col"><span class="z">0%</span><i class="bar b-z" /><em>01</em></div>
            <div class="col"><span class="z">0%</span><i class="bar b-z" /><em>10</em></div>
            <div class="col"><span>50%</span><i class="bar b-b" /><em>11</em></div>
          </div>
          <p class="caption">H + CNOT makes an entangled Bell pair: you only ever see 00 or 11.</p>
        </div>
      </div>
    </section>

    <!-- GLOSSARY -->
    <section class="container section glossary">
      <div class="section-head">
        <span class="eyebrow">Glossary</span>
        <h2>Quantum words, explained simply.</h2>
      </div>
      <div class="chips">
        <NuxtLink v-for="t in glossaryPreview" :key="t.id" :to="`/glossary#${t.id}`" class="chip glass">{{ t.term }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
    'title lab'
    'guide lab'
    'cta   lab';
  grid-template-rows: auto auto 1fr;
  column-gap: clamp(28px, 4vw, 56px);
  row-gap: 22px;
  padding-top: clamp(20px, 3vw, 36px);
  padding-bottom: clamp(56px, 8vw, 96px);
}
.hero-title {
  grid-area: title;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}
.hero-lab {
  grid-area: lab;
  align-self: start;
  scroll-margin-top: 84px;
}
.guide {
  grid-area: guide;
  min-width: 0;
}
.hero-cta {
  grid-area: cta;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-self: start;
}
.hero-cta .btn {
  min-height: 50px;
}
.pill {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 14px;
  color: #d9cfff;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 12px var(--cyan);
}
h1 {
  font-weight: 700;
  font-size: clamp(42px, 5vw, 66px);
  line-height: 1;
  letter-spacing: -0.04em;
  padding-bottom: 0.06em;
}

/* the "What am I looking at?" guide */
.guide {
  border-radius: 24px;
  padding: clamp(18px, 2.4vw, 24px);
  background: linear-gradient(150deg, rgba(124, 58, 237, 0.16), rgba(59, 130, 246, 0.06) 60%, rgba(255, 255, 255, 0.02));
  border-color: rgba(192, 132, 252, 0.24);
}
.guide-title {
  font-size: clamp(20px, 2vw, 24px);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}
.guide-intro {
  font-size: 15px;
  line-height: 1.6;
  color: var(--muted);
  margin-bottom: 14px;
}
.guide-intro strong,
.guide-list strong {
  color: var(--ink-strong);
  font-weight: 600;
}
.guide-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.guide-list li {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.guide-list h3 {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink-strong);
  margin-bottom: 2px;
}
.guide-list p {
  font-size: 14px;
  line-height: 1.55;
  color: #bdb6e2;
}
.g-icon {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-size: 17px;
  color: #fff;
  position: relative;
}
.i-poles {
  background: linear-gradient(180deg, #a855f7, #3b82f6);
  font-size: 13px;
  line-height: 1;
  grid-template-rows: auto auto;
  align-content: center;
  gap: 1px;
}
.i-poles small {
  font-size: 11px;
  opacity: 0.85;
}
.i-vert {
  background: rgba(124, 58, 237, 0.35);
  box-shadow: inset 0 0 0 1px rgba(192, 132, 252, 0.5);
}
.i-around {
  background: rgba(34, 211, 238, 0.18);
  box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.5);
  color: var(--cyan);
}
.i-gate {
  background: linear-gradient(140deg, #7c3aed, #a855f7);
  box-shadow: 0 0 16px -4px rgba(168, 85, 247, 0.9);
}
.try {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.try button {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(192, 132, 252, 0.4);
  background: rgba(124, 58, 237, 0.16);
  color: #eadfff;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.try button:hover {
  background: rgba(124, 58, 237, 0.34);
  border-color: rgba(192, 132, 252, 0.8);
  transform: translateY(-1px);
}
.try button:active {
  transform: translateY(0) scale(0.98);
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'title'
      'lab'
      'guide'
      'cta';
    grid-template-rows: auto;
  }
}

/* cards */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.card {
  position: relative;
  border-radius: 22px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--ink);
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}
a.card:hover {
  color: var(--ink);
  transform: translateY(-4px);
  border-color: rgba(192, 132, 252, 0.45);
  box-shadow: 0 20px 60px -24px rgba(124, 58, 237, 0.7);
}
.card.soon {
  opacity: 0.6;
}
.num {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--lilac);
}
.card-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 22px;
  letter-spacing: -0.02em;
}
.card-text {
  font-size: 15px;
  line-height: 1.55;
  color: #b1abd6;
}
.badge {
  align-self: flex-start;
  /* pin every "Coming soon" badge to the bottom of its card so they line up */
  margin-top: auto;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  color: var(--muted-2);
}
.card-accent {
  background: linear-gradient(140deg, rgba(124, 58, 237, 0.55), rgba(59, 130, 246, 0.45));
  border: 1px solid rgba(201, 184, 255, 0.35);
  justify-content: space-between;
}
.card-accent .num,
.card-accent .card-text {
  color: #e9ddff;
}

/* steps */
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.step {
  border-radius: 22px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.step h3 {
  font-size: 21px;
  font-weight: 600;
}
.step p {
  font-size: 15px;
  color: #b1abd6;
}
.step-n {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  color: #e9ddff;
}
.s1 { background: rgba(124, 58, 237, 0.28); }
.s2 { background: rgba(168, 85, 247, 0.28); }
.s3 { background: rgba(59, 130, 246, 0.28); }

/* teaser */
.teaser {
  border-radius: 32px;
  padding: clamp(24px, 5vw, 56px);
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  align-items: center;
}
.teaser-copy {
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-start;
}
.teaser-copy h2 {
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 700;
}
.teaser-copy p {
  font-size: 17px;
  color: var(--muted);
}
.eyebrow.cyan {
  color: var(--cyan);
}
.teaser-art {
  flex: 1 1 380px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.mini-circuit {
  position: relative;
  height: 150px;
  border-radius: 20px;
  background: rgba(5, 4, 20, 0.6);
  border: 1px solid var(--line);
}
.mini-circuit .q {
  position: absolute;
  left: 20px;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--muted-2);
}
.q0 { top: 32px; }
.q1 { top: 100px; }
.w {
  position: absolute;
  left: 56px;
  right: 20px;
  height: 1px;
  background: rgba(201, 184, 255, 0.35);
}
.w0 { top: 43px; }
.w1 { top: 111px; }
.g.h {
  position: absolute;
  left: 18%;
  top: 21px;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-weight: 500;
  background: linear-gradient(140deg, #7c3aed, #a855f7);
  box-shadow: 0 0 24px -4px rgba(168, 85, 247, 0.8);
}
.ctl {
  position: absolute;
  left: calc(42% - 7px);
  top: 36px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 14px var(--cyan);
}
.ctl-line {
  position: absolute;
  left: calc(42% - 1px);
  top: 43px;
  width: 2px;
  height: 68px;
  background: var(--cyan);
}
.tgt {
  position: absolute;
  left: calc(42% - 14px);
  top: 97px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--cyan);
  background: #0a0823;
  color: var(--cyan);
  display: grid;
  place-items: center;
  font-size: 20px;
  line-height: 1;
  font-weight: 400;
}
.m {
  position: absolute;
  left: 68%;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(201, 184, 255, 0.4);
  background: #120e33 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='18' viewBox='0 0 26 18'%3E%3Cpath d='M3 16 A10 10 0 0 1 23 16' fill='none' stroke='%23C9B8FF' stroke-width='1.8'/%3E%3Cline x1='13' y1='16' x2='20' y2='5' stroke='%23C9B8FF' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E") center / 26px 18px no-repeat;
}
.m0 { top: 21px; }
.m1 { top: 89px; }
.hist {
  display: flex;
  gap: 14px;
  align-items: flex-end;
  height: 150px;
  padding: 0 6px;
}
.col {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #e9ddff;
}
.col .z {
  color: var(--faint);
}
.col em {
  font-style: normal;
  color: #b1abd6;
  font-size: 14px;
}
.bar {
  width: 100%;
  border-radius: 10px 10px 0 0;
}
.b-a {
  height: 62%;
  background: linear-gradient(180deg, #c084fc, #7c3aed);
  box-shadow: 0 0 30px -8px rgba(192, 132, 252, 0.8);
}
.b-b {
  height: 62%;
  background: linear-gradient(180deg, #22d3ee, #3b82f6);
  box-shadow: 0 0 30px -8px rgba(34, 211, 238, 0.7);
}
.b-z {
  height: 3px;
  background: rgba(201, 184, 255, 0.25);
}
.caption {
  font-size: 14px;
  color: var(--muted-2);
}

/* glossary */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  padding: 11px 18px;
  border-radius: 999px;
  font-size: 15px;
  color: #e3dcff;
  transition: background 0.2s, border-color 0.2s;
}
.chip:hover {
  background: rgba(124, 58, 237, 0.22);
  border-color: rgba(192, 132, 252, 0.6);
  color: #fff;
}

@media (max-width: 640px) {
  .hero-lab {
    margin: 0 calc(var(--gutter) * -0.5);
  }
  .card,
  .step {
    padding: 22px;
  }
}
</style>
