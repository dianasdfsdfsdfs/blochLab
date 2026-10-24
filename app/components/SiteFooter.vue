<template>
  <footer class="footer">
    <div class="container inner">
      <div class="about">
        <NuxtLink to="/" class="brand"><BrandMark /> Bloch Lab</NuxtLink>
        <p>Learn quantum computing visually — interactive 3D, plain-language explanations, no account needed.</p>
      </div>
      <nav aria-label="Footer" class="cols">
        <div>
          <span class="h">Learn</span>
          <NuxtLink to="/learn/what-is-a-qubit">What is a qubit?</NuxtLink>
          <NuxtLink to="/learn/bloch-sphere">The Bloch sphere</NuxtLink>
          <NuxtLink to="/learn">All lessons</NuxtLink>
        </div>
        <div>
          <span class="h">Tools</span>
          <NuxtLink to="/playground">Playground</NuxtLink>
          <NuxtLink to="/glossary">Glossary</NuxtLink>
        </div>
      </nav>
    </div>
    <div class="container legal">© {{ new Date().getFullYear() }} Bloch Lab</div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid rgba(201, 184, 255, 0.12);
  padding: 48px 0 32px;
  margin-top: 40px;
  background: linear-gradient(180deg, rgba(7, 6, 26, 0), rgba(7, 6, 26, 0.6));
}
.inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 32px;
}
.about {
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--muted-2);
  font-size: 15px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
}
.cols {
  display: flex;
  gap: 56px;
  flex-wrap: wrap;
}
.cols div {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 15px;
}
.h {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--faint);
  font-weight: 600;
}
.legal {
  margin-top: 36px;
  font-size: 13px;
  color: var(--faint);
}
</style>
