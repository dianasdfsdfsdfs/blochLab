<script setup lang="ts">
// Deterministic star field so server and client render the same markup.
let seed = 11
const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const stars = Array.from({ length: 70 }, () => ({
  left: `${(rnd() * 100).toFixed(2)}%`,
  top: `${(rnd() * 100).toFixed(2)}%`,
  size: `${(rnd() * 1.6 + 0.6).toFixed(1)}px`,
  delay: `${(rnd() * 5).toFixed(1)}s`,
}))
</script>

<template>
  <div class="space" aria-hidden="true">
    <div class="nebula n1" />
    <div class="nebula n2" />
    <div class="nebula n3" />
    <div class="stars">
      <span
        v-for="(s, i) in stars"
        :key="i"
        class="star"
        :style="{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }"
      />
    </div>
    <div class="vignette" />
  </div>
</template>

<style scoped>
.space {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(1200px 700px at 78% -10%, #1b1146 0%, rgba(7, 6, 26, 0) 60%),
    linear-gradient(180deg, #0a0823 0%, #07061a 45%, #060517 100%);
}
.nebula {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  will-change: transform;
  animation: drift 28s ease-in-out infinite alternate;
}
.n1 {
  width: 70vmax;
  height: 70vmax;
  left: -25vmax;
  top: -25vmax;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.7) 0%, rgba(124, 58, 237, 0) 62%);
}
.n2 {
  width: 60vmax;
  height: 60vmax;
  right: -22vmax;
  top: 10vh;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 62%);
  animation-duration: 34s;
  animation-delay: -10s;
}
.n3 {
  width: 55vmax;
  height: 55vmax;
  left: 20vw;
  bottom: -30vmax;
  background: radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, rgba(192, 132, 252, 0) 62%);
  animation-duration: 40s;
  animation-delay: -18s;
}
@keyframes drift {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(4vw, -3vh, 0) scale(1.1); }
  100% { transform: translate3d(-3vw, 4vh, 0) scale(0.95); }
}
.star {
  position: absolute;
  border-radius: 50%;
  background: #e9e3ff;
  animation: twinkle 4.5s ease-in-out infinite alternate;
}
@keyframes twinkle {
  from { opacity: 0.12; }
  to { opacity: 0.85; }
}
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 55%, rgba(3, 2, 12, 0.55) 100%);
}
</style>
