<script setup lang="ts">
withDefaults(defineProps<{ title?: string; tone?: 'idea' | 'note' }>(), { title: 'Key idea', tone: 'idea' })
</script>

<template>
  <aside class="key" :class="tone">
    <span class="k-title">{{ title }}</span>
    <div class="k-body"><slot /></div>
  </aside>
</template>

<style scoped>
.key {
  position: relative;
  margin: 28px 0;
  padding: 20px 22px;
  border-radius: 18px;
  background: linear-gradient(140deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.1));
  border: 1px solid rgba(192, 132, 252, 0.3);
}
.key.note {
  background: rgba(34, 211, 238, 0.06);
  border-color: rgba(34, 211, 238, 0.25);
}
.k-title {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--lilac);
}
.note .k-title {
  color: var(--cyan);
}
.k-body :deep(p) {
  margin: 0;
  color: var(--ink);
}
.k-body :deep(p + p) {
  margin-top: 10px;
}
</style>
