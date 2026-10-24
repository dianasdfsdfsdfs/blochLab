// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://blochlab.spaceexplorer.wiki'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },

  components: [{ path: '~/components', pathPrefix: false }],

  css: ['katex/dist/katex.min.css', '~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · Bloch Lab',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#07061A' },
        { name: 'color-scheme', content: 'dark' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${process.env.NUXT_APP_BASE_URL || '/'}favicon.svg` },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    public: { siteUrl },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      // write /learn.html instead of /learn/index.html so GitHub Pages serves /learn without a redirect
      autoSubfolderIndex: false,
      routes: ['/', '/sitemap.xml', '/robots.txt'],
    },
  },

  experimental: {
    // keep all page data inside the HTML (no _payload.json folders next to pages)
    payloadExtraction: false,
  },

  vite: {
    optimizeDeps: {
      include: [
        'katex',
        'three',
        'three/addons/lines/Line2.js',
        'three/addons/lines/LineGeometry.js',
        'three/addons/lines/LineMaterial.js',
        'three/addons/renderers/CSS2DRenderer.js',
      ],
    },
  },
})
