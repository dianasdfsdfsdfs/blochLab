<script setup lang="ts">
import { LESSONS } from '~/data/lessons'

const { siteUrl } = useRuntimeConfig().public
useSeoMeta({
  title: 'Learn quantum computing — free interactive lessons',
  description:
    'Free beginner lessons on quantum computing: qubits, the Bloch sphere, measurement and quantum gates, each explained in plain language with interactive 3D.',
})
useHead({ link: [{ rel: 'canonical', href: `${siteUrl.replace(/\/$/, '')}/learn` }] })
const NuxtLinkC = resolveComponent('NuxtLink')
</script>

<template>
  <div class="container page">
    <header class="section-head">
      <span class="eyebrow">Learning path</span>
      <h1 class="grad-text">Learn quantum computing, one picture at a time.</h1>
      <p>Short lessons in order. Each starts with a two-sentence answer and lets you play with the idea in 3D.</p>
    </header>
    <ol class="list">
      <li v-for="l in LESSONS" :key="l.slug">
        <component :is="l.ready ? NuxtLinkC : 'div'" :to="l.ready ? `/learn/${l.slug}` : undefined" class="row glass" :class="{ soon: !l.ready }">
          <span class="num">{{ l.number }}</span>
          <span class="txt">
            <span class="title">{{ l.title }}</span>
            <span class="blurb">{{ l.blurb }}</span>
          </span>
          <span class="go">{{ l.ready ? '→' : 'Soon' }}</span>
        </component>
      </li>
    </ol>
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
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 22px 24px;
  border-radius: 20px;
  color: var(--ink);
  transition: transform 0.2s, border-color 0.2s;
}
a.row:hover {
  color: var(--ink);
  transform: translateX(4px);
  border-color: rgba(192, 132, 252, 0.5);
}
.row.soon {
  opacity: 0.55;
}
.num {
  font-family: var(--font-mono);
  color: var(--lilac);
  font-size: 15px;
}
.txt {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 21px;
}
.blurb {
  font-size: 15px;
  color: #b1abd6;
}
.go {
  font-size: 14px;
  color: var(--muted-2);
}
</style>
