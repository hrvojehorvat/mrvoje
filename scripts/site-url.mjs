// Fills %SITE_URL% in dist/index.html (Open Graph tags) after `ng build`.
// Angular has no env substitution for index.html, so this small step does it.
// Source: the SITE_URL environment variable (set in CI), else empty.
import { readFileSync, writeFileSync } from 'node:fs'

const url = (process.env.SITE_URL ?? '').trim().replace(/\/+$/, '')
if (url && !/^https:\/\/[^\s"'<>]+$/.test(url)) {
  console.error(`SITE_URL must be an https:// address, got: ${url}`)
  process.exit(1)
}

const file = 'dist/index.html'
const html = readFileSync(file, 'utf8')
writeFileSync(file, html.replaceAll('%SITE_URL%', url))
console.log(`site-url: ${url || '(empty, relative preview URLs)'}`)
