import { describe, expect, it } from 'vitest'
import { canonicalUrl, movedTo, plumcastHref } from './redirects'

/** Where `url` goes (null: shown here). */
const at = (url: string) => {
  const u = new URL(url)
  return movedTo({ hostname: u.hostname, pathname: u.pathname, search: u.search, hash: u.hash })
}

describe('movedTo', () => {
  it('sends old BarMint links (site root and /barmint) to barmint.mrvoje.com, keeping ? and #', () => {
    expect(at('https://mrvoje.com/#s=eyJtb2RlIjoiYmFyY29kZSJ9')).toBe('https://barmint.mrvoje.com/#s=eyJtb2RlIjoiYmFyY29kZSJ9')
    expect(at('https://mrvoje.com/#impressum')).toBe('https://barmint.mrvoje.com/#impressum')
    expect(at('https://mrvoje.com/#datenschutz')).toBe('https://barmint.mrvoje.com/#datenschutz')
    expect(at('https://mrvoje.com/?s=abc')).toBe('https://barmint.mrvoje.com/?s=abc')
    expect(at('https://mrvoje.com/barmint')).toBe('https://barmint.mrvoje.com/')
    expect(at('https://mrvoje.com/barmint#s=abc')).toBe('https://barmint.mrvoje.com/#s=abc')
    expect(at('https://mrvoje.com/barmint?s=abc')).toBe('https://barmint.mrvoje.com/?s=abc')
    expect(at('http://localhost:4200/barmint/')).toBe('https://barmint.mrvoje.com/')
  })

  it('moves the Plumcast page to plumcast.mrvoje.com on the live site only', () => {
    expect(at('https://mrvoje.com/plumcast')).toBe('https://plumcast.mrvoje.com/')
    expect(at('https://mrvoje.com/plumcast/')).toBe('https://plumcast.mrvoje.com/')
    expect(at('http://localhost:5173/plumcast')).toBeNull()
  })

  it('on plumcast.mrvoje.com shows only the start page; other paths belong to mrvoje.com', () => {
    expect(at('https://plumcast.mrvoje.com/')).toBeNull()
    expect(at('https://plumcast.mrvoje.com/index.html')).toBeNull()
    expect(at('https://plumcast.mrvoje.com/projects')).toBe('https://mrvoje.com/projects')
    expect(at('https://plumcast.mrvoje.com/barmint#s=x')).toBe('https://barmint.mrvoje.com/#s=x')
  })

  it('leaves portfolio pages alone', () => {
    expect(at('https://mrvoje.com/')).toBeNull()
    expect(at('https://mrvoje.com/projects')).toBeNull()
    expect(at('https://mrvoje.com/#about')).toBeNull()
    expect(at('http://localhost:5173/')).toBeNull()
  })
})

describe('plumcastHref', () => {
  it('is the subdomain on the live site and the route locally', () => {
    expect(plumcastHref('mrvoje.com')).toBe('https://plumcast.mrvoje.com/')
    expect(plumcastHref('localhost')).toBe('/plumcast')
  })
})

describe('canonicalUrl', () => {
  it('names the real address, whichever host served the page', () => {
    expect(canonicalUrl('mrvoje.com', '/')).toBe('https://mrvoje.com/')
    expect(canonicalUrl('white-tree-0d25f690f.6.azurestaticapps.net', '/projects?x=1#top')).toBe('https://mrvoje.com/projects')
    expect(canonicalUrl('mrvoje.com', '/privacy/')).toBe('https://mrvoje.com/privacy')
    expect(canonicalUrl('plumcast.mrvoje.com', '/')).toBe('https://plumcast.mrvoje.com/')
    expect(canonicalUrl('localhost', '/plumcast')).toBe('https://plumcast.mrvoje.com/')
  })
})
