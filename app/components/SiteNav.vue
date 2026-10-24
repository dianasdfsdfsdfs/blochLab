<script setup lang="ts">
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (open.value = false))

const links = [
  { to: '/learn', label: 'Learn' },
  { to: '/playground', label: 'Playground' },
  { to: '/glossary', label: 'Glossary' },
]
</script>

<template>
  <header class="nav-wrap">
    <div class="container nav">
      <NuxtLink to="/" class="brand" aria-label="Bloch Lab home">
        <BrandMark />
        <span>Bloch Lab</span>
      </NuxtLink>

      <nav class="links" aria-label="Main">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="link">{{ l.label }}</NuxtLink>
        <NuxtLink to="/learn/bloch-sphere" class="btn btn-primary nav-cta">Start learning</NuxtLink>
      </nav>

      <button
        type="button"
        class="burger"
        :aria-expanded="open"
        aria-controls="mobile-menu"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        @click="open = !open"
      >
        <span :class="{ x: open }" />
      </button>
    </div>

    <Transition name="drop">
      <nav v-if="open" id="mobile-menu" class="mobile glass" aria-label="Mobile">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="m-link">{{ l.label }}</NuxtLink>
        <NuxtLink to="/learn/bloch-sphere" class="btn btn-primary">Start learning</NuxtLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.nav-wrap {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(7, 6, 26, 0.9);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(201, 184, 255, 0.08);
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 72px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 21px;
  letter-spacing: -0.02em;
}
.links {
  display: flex;
  align-items: center;
  gap: 28px;
  font-size: 15px;
}
.link {
  color: #cfc6f5;
}
.link.router-link-active {
  color: #fff;
}
.nav-cta {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 15px;
}
.burger {
  display: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  position: relative;
}
.burger span,
.burger span::before,
.burger span::after {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 2px;
  border-radius: 2px;
  background: var(--ink);
  transition: transform 0.25s, opacity 0.2s, top 0.25s;
}
.burger span {
  top: 21px;
}
.burger span::before,
.burger span::after {
  content: '';
  left: 0;
}
.burger span::before {
  top: -7px;
}
.burger span::after {
  top: 7px;
}
.burger span.x {
  background: transparent;
}
.burger span.x::before {
  top: 0;
  transform: rotate(45deg);
}
.burger span.x::after {
  top: 0;
  transform: rotate(-45deg);
}
.mobile {
  display: none;
}

@media (max-width: 760px) {
  .links {
    display: none;
  }
  .burger {
    display: block;
  }
  .mobile {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0 var(--gutter) 16px;
    padding: 14px;
    border-radius: 20px;
  }
  .m-link {
    padding: 12px 10px;
    font-size: 17px;
    color: var(--ink);
    border-radius: 10px;
  }
  .m-link.router-link-active {
    background: rgba(124, 58, 237, 0.18);
  }
  .mobile .btn {
    margin-top: 6px;
  }
}
.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
