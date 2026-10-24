<script setup lang="ts">
const { siteUrl } = useRuntimeConfig().public
const base = siteUrl.replace(/\/$/, '')
const route = useRoute()

useSeoMeta({
  ogSiteName: 'Bloch Lab',
  ogImage: `${base}/og.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'A glowing 3D Bloch sphere with a qubit state arrow',
  twitterImage: `${base}/og.png`,
  ogUrl: () => `${base}${route.path === '/' ? '/' : route.path}`,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
