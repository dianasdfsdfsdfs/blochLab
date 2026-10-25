<script setup lang="ts">
import { LESSONS } from '~/data/lessons'
import { GLOSSARY } from '~/data/glossary'

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
const NuxtLinkC = resolveComponent('NuxtLink')
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="container hero">
      <div class="hero-copy">
        <div class="pill glass">
          <span class="dot" />
          Quantum computing, visualized
        </div>
        <h1 class="grad-text">See a qubit think.</h1>
        <p class="lead">
          Bloch Lab explains quantum computing with interactive 3D. Rotate a real qubit, apply quantum gates and watch
          measurement happen — no math background needed to start.
        </p>
        <div class="cta">
          <NuxtLink to="/learn/what-is-a-qubit" class="btn btn-primary">Start learning</NuxtLink>
          <NuxtLink to="/playground" class="btn btn-ghost">Open the Playground</NuxtLink>
        </div>
        <ul class="facts">
          <li>Free, no account</li>
          <li>Interactive 3D</li>
          <li>Beginner friendly</li>
        </ul>
      </div>
      <QubitLab class="hero-lab" />
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(32px, 5vw, 56px);
  padding-top: clamp(20px, 3vw, 36px);
  padding-bottom: clamp(56px, 8vw, 96px);
}
.hero-copy {
  flex: 1 1 420px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.hero-lab {
  flex: 1 1 440px;
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
  font-size: clamp(46px, 7.5vw, 88px);
  line-height: 1;
  letter-spacing: -0.04em;
  padding-bottom: 0.06em;
}
.lead {
  font-size: clamp(17px, 2vw, 19px);
  line-height: 1.6;
  color: var(--muted);
  max-width: 520px;
}
.cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.cta .btn {
  min-height: 54px;
  padding: 0 26px;
}
.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
  color: var(--muted-2);
}
.facts li::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 50%;
  background: var(--lilac);
  vertical-align: middle;
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
  margin-top: 4px;
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
