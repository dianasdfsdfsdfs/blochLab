// GitHub Pages: if both `learn.html` and a `learn/` folder exist, a request for
// /learn may be redirected to /learn/. Put a copy at learn/index.html so both work.
import { readdirSync, statSync, existsSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const root = '.output/public'
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (existsSync(`${p}.html`) && !existsSync(join(p, 'index.html'))) {
        copyFileSync(`${p}.html`, join(p, 'index.html'))
        console.log('copied', `${p}.html`, '->', join(p, 'index.html'))
      }
      walk(p)
    }
  }
}
walk(root)
