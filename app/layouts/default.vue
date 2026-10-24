<template>
  <div class="shell">
    <SpaceBackground />
    <a href="#main" class="skip-link">Skip to content</a>
    <SiteNav />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main {
  position: relative;
  flex: 1;
}
.skip-link {
  position: absolute;
  left: 16px;
  top: -60px;
  z-index: 100;
  padding: 10px 16px;
  border-radius: 10px;
  background: var(--violet);
  color: #fff;
}
.skip-link:focus {
  top: 12px;
}
</style>
