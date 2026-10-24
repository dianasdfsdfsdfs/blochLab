import { LESSONS } from '../../app/data/lessons'

export default defineEventHandler(event => {
  const { siteUrl } = useRuntimeConfig().public
  const base = siteUrl.replace(/\/$/, '')
  const today = new Date().toISOString().slice(0, 10)
  const paths = ['/', '/learn', ...LESSONS.filter(l => l.ready).map(l => `/learn/${l.slug}`), '/playground', '/glossary']
  const urls = paths
    .map(p => `  <url><loc>${base}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
