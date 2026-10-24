<script setup lang="ts">
const gid = `bm-${useId()}`
</script>

<template>
  <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#C084FC" />
        <stop offset="1" stop-color="#3B82F6" />
      </linearGradient>
    </defs>
    <circle cx="17" cy="17" r="14" fill="none" :stroke="`url(#${gid})`" stroke-width="2" />
    <ellipse cx="17" cy="17" rx="14" ry="4.5" fill="none" stroke="rgba(201,184,255,.5)" stroke-width="1.2" />
    <line x1="17" y1="17" x2="25" y2="7" stroke="#F3EEFF" stroke-width="2.2" stroke-linecap="round" />
    <circle cx="25" cy="7" r="2.8" fill="#F3EEFF" />
  </svg>
</template>
