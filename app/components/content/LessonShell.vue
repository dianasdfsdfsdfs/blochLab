<script setup lang="ts">
import { lessonBySlug, nextLesson, prevLesson } from '~/data/lessons'

export interface FaqItem {
  q: string
  a: string
}

const props = defineProps<{
  slug: string
  /** <title> and H1 can differ: the title is tuned for search. */
  seoTitle: string
  description: string
  shortAnswer: string
  faq?: FaqItem[]
}>()

const lesson = lessonBySlug(props.slug)!
const next = nextLesson(props.slug)
const prev = prevLesson(props.slug)
const { siteUrl } = useRuntimeConfig().public
const route = useRoute()
const url = `${siteUrl.replace(/\/$/, '')}${route.path}`

useSeoMeta({
  title: props.seoTitle,
  description: props.description,
  ogTitle: props.seoTitle,
  ogDescription: props.description,
  ogType: 'article',
  ogUrl: url,
  twitterCard: 'summary_large_image',
})

const ld: Record<string, unknown>[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: props.seoTitle,
    headline: lesson.title,
    description: props.description,
    url,
    inLanguage: 'en',
    educationalLevel: 'Beginner',
    learningResourceType: 'Interactive lesson',
    isAccessibleForFree: true,
    about: lesson.title,
    isPartOf: { '@type': 'WebSite', name: 'Bloch Lab', url: siteUrl },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bloch Lab', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: `${siteUrl.replace(/\/$/, '')}/learn` },
      { '@type': 'ListItem', position: 3, name: lesson.title, item: url },
    ],
  },
]
if (props.faq?.length) {
  ld.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: props.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  })
}

useHead({
  link: [{ rel: 'canonical', href: url }],
  script: ld.map(x => ({ type: 'application/ld+json', innerHTML: JSON.stringify(x) })),
})
</script>

<template>
  <article class="lesson">
    <header class="container head">
      <nav class="crumbs" aria-label="Breadcrumb">
        <NuxtLink to="/">Home</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/learn">Learn</NuxtLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ lesson.title }}</span>
      </nav>
      <span class="eyebrow">Lesson {{ lesson.number }}</span>
      <h1 class="grad-text">{{ lesson.title }}</h1>
      <div class="answer glass">
        <span class="answer-label">Short answer</span>
        <p>{{ shortAnswer }}</p>
      </div>
    </header>

    <div class="container body">
      <slot />
    </div>

    <section v-if="faq?.length" class="container faq">
      <h2>Frequently asked questions</h2>
      <details v-for="f in faq" :key="f.q" class="glass">
        <summary>{{ f.q }}</summary>
        <p>{{ f.a }}</p>
      </details>
    </section>

    <nav class="container pager" aria-label="Lessons">
      <NuxtLink v-if="prev" :to="`/learn/${prev.slug}`" class="pg glass">
        <span class="pg-label">← Previous</span>
        <span class="pg-title">{{ prev.title }}</span>
      </NuxtLink>
      <span v-else />
      <NuxtLink v-if="next && next.ready" :to="`/learn/${next.slug}`" class="pg glass next">
        <span class="pg-label">Next →</span>
        <span class="pg-title">{{ next.title }}</span>
      </NuxtLink>
      <NuxtLink v-else to="/playground" class="pg glass next">
        <span class="pg-label">Next →</span>
        <span class="pg-title">Try the Playground</span>
      </NuxtLink>
    </nav>
  </article>
</template>

<style scoped>
.head {
  max-width: 860px;
  padding-top: clamp(28px, 5vw, 56px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px;
  color: var(--faint);
}
.crumbs a {
  color: var(--muted-2);
}
h1 {
  font-size: clamp(40px, 6.5vw, 72px);
  font-weight: 700;
  letter-spacing: -0.04em;
  padding-bottom: 0.08em;
}
.answer {
  border-radius: 20px;
  padding: 20px 22px;
  border-color: rgba(192, 132, 252, 0.3);
  background: linear-gradient(140deg, rgba(124, 58, 237, 0.22), rgba(59, 130, 246, 0.1));
}
.answer-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--lilac);
}
.answer p {
  font-size: clamp(17px, 2vw, 19px);
  line-height: 1.6;
  color: var(--ink-strong);
}

/* long-form typography */
.body {
  max-width: 860px;
  padding-top: 40px;
  padding-bottom: 24px;
}
.body :deep(h2) {
  margin: 56px 0 16px;
  font-size: clamp(26px, 3.4vw, 36px);
  font-weight: 700;
  scroll-margin-top: 90px;
}
.body :deep(h3) {
  margin: 36px 0 10px;
  font-size: clamp(20px, 2.4vw, 24px);
  font-weight: 600;
  scroll-margin-top: 90px;
}
.body :deep(p),
.body :deep(li) {
  font-size: 17px;
  line-height: 1.75;
  color: #cdc7ee;
}
.body :deep(p) {
  margin: 0 0 16px;
}
.body :deep(ul),
.body :deep(ol) {
  padding-left: 22px;
  margin: 0 0 18px;
}
.body :deep(li) {
  margin-bottom: 6px;
}
.body :deep(strong) {
  color: var(--ink-strong);
  font-weight: 600;
}
.body :deep(.ket),
.body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.92em;
  color: #e9ddff;
  white-space: nowrap;
}
.body :deep(a) {
  color: var(--lilac);
  text-decoration: underline;
  text-decoration-color: rgba(192, 132, 252, 0.4);
  text-underline-offset: 3px;
}
.body :deep(.lab),
.body :deep(.widget) {
  margin: 28px 0;
}
.body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}
.body :deep(.table-wrap) {
  overflow-x: auto;
  margin: 20px 0 24px;
  border-radius: 16px;
  border: 1px solid var(--line);
}
.body :deep(th),
.body :deep(td) {
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(201, 184, 255, 0.1);
  white-space: nowrap;
}
.body :deep(th) {
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted-2);
  background: rgba(255, 255, 255, 0.03);
}
.body :deep(td) {
  color: #ddd6ff;
}
.body :deep(tr:last-child td) {
  border-bottom: none;
}

.faq {
  max-width: 860px;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.faq h2 {
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 700;
  margin-bottom: 10px;
}
details {
  border-radius: 16px;
  padding: 0 20px;
}
summary {
  cursor: pointer;
  padding: 16px 0;
  font-weight: 600;
  font-size: 16px;
  color: var(--ink-strong);
  list-style: none;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
summary::-webkit-details-marker {
  display: none;
}
summary::after {
  content: '+';
  font-family: var(--font-mono);
  color: var(--lilac);
  transition: transform 0.2s;
}
details[open] summary::after {
  transform: rotate(45deg);
}
details p {
  padding-bottom: 16px;
  color: #cdc7ee;
  line-height: 1.7;
}

.pager {
  max-width: 860px;
  padding-top: 48px;
  padding-bottom: 40px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.pg {
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--ink);
  transition: border-color 0.2s, transform 0.2s;
}
.pg:hover {
  color: #fff;
  border-color: rgba(192, 132, 252, 0.5);
  transform: translateY(-2px);
}
.pg.next {
  text-align: right;
}
.pg-label {
  font-size: 13px;
  color: var(--muted-2);
}
.pg-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 18px;
}
@media (max-width: 560px) {
  .pager {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
