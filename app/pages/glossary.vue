<script setup lang="ts">
import { GLOSSARY } from '~/data/glossary'
import { lessonBySlug } from '~/data/lessons'

const { siteUrl } = useRuntimeConfig().public
const base = siteUrl.replace(/\/$/, '')

useSeoMeta({
  title: 'Quantum computing glossary — key terms explained simply',
  description:
    'Plain-language definitions of quantum computing terms: qubit, superposition, amplitude, phase, Bloch sphere, measurement, Hadamard gate, CNOT, entanglement, Bell state and more.',
})
useHead({
  link: [{ rel: 'canonical', href: `${base}/glossary` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'Bloch Lab quantum computing glossary',
        url: `${base}/glossary`,
        hasDefinedTerm: GLOSSARY.map(t => ({
          '@type': 'DefinedTerm',
          name: t.term,
          description: t.definition,
          url: `${base}/glossary#${t.id}`,
        })),
      }),
    },
  ],
})
</script>

<template>
  <div class="container page">
    <header class="section-head">
      <span class="eyebrow">Glossary</span>
      <h1 class="grad-text">Quantum words, explained simply.</h1>
      <p>Short definitions you can come back to. Each one links to the lesson that explains it with 3D.</p>
    </header>
    <nav class="index" aria-label="Terms">
      <a v-for="t in GLOSSARY" :key="t.id" :href="`#${t.id}`">{{ t.term }}</a>
    </nav>
    <dl class="terms">
      <div v-for="t in GLOSSARY" :id="t.id" :key="t.id" class="term glass">
        <dt>{{ t.term }}</dt>
        <dd>
          <p>{{ t.definition }}</p>
          <NuxtLink v-if="t.lesson && lessonBySlug(t.lesson)?.ready" :to="`/learn/${t.lesson}`" class="more">
            Learn more: {{ lessonBySlug(t.lesson)?.title }} →
          </NuxtLink>
        </dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  padding-top: clamp(32px, 6vw, 64px);
  padding-bottom: 40px;
}
h1 {
  font-size: clamp(36px, 5.5vw, 60px);
  font-weight: 700;
  padding-bottom: 0.06em;
}
.index {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}
.index a {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(201, 184, 255, 0.18);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
  color: #e3dcff;
  font-size: 14px;
  line-height: 1.3;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.index a:hover,
.index a:focus-visible {
  background: rgba(124, 58, 237, 0.22);
  border-color: rgba(192, 132, 252, 0.6);
  color: #fff;
}
.terms {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
}
.term {
  border-radius: 18px;
  padding: 20px 22px;
  scroll-margin-top: 90px;
}
.term:target {
  border-color: rgba(192, 132, 252, 0.7);
  box-shadow: 0 0 40px -12px rgba(168, 85, 247, 0.8);
}
dt {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
  color: var(--ink-strong);
  margin-bottom: 6px;
}
dd {
  margin: 0;
}
dd p {
  color: #cdc7ee;
  line-height: 1.7;
}
.more {
  display: inline-block;
  margin-top: 10px;
  font-size: 14px;
  color: var(--lilac);
}
</style>
