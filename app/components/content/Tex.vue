<script setup lang="ts">
import katex from 'katex'

const props = defineProps<{ expr: string; display?: boolean }>()
const html = computed(() =>
  katex.renderToString(props.expr, { displayMode: !!props.display, throwOnError: false, output: 'htmlAndMathml' }),
)
</script>

<template>
  <div v-if="display" class="tex-block" v-html="html" />
  <span v-else class="tex" v-html="html" />
</template>

<style scoped>
.tex-block {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 18px 20px;
  margin: 8px 0;
  border-radius: 16px;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(192, 132, 252, 0.18);
}
</style>
