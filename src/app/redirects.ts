/**
 * Addresses of the site and its projects, and the redirects between them.
 *   mrvoje.com           portfolio (this app)
 *   plumcast.mrvoje.com  the Plumcast page (this app too: a second domain of the same Azure app)
 *   barmint.mrvoje.com   BarMint (its own app, repo hrvojehorvat/barmint)
 */
export const HOSTS = { site: 'mrvoje.com', plumcast: 'plumcast.mrvoje.com', barmint: 'barmint.mrvoje.com' } as const

export const SITE_URL = `https://${HOSTS.site}`
export const PLUMCAST_URL = `https://${HOSTS.plumcast}/`
export const BARMINT_URL = `https://${HOSTS.barmint}/`

type Address = Pick<Location, 'hostname' | 'pathname' | 'search' | 'hash'>

/**
 * Where an address has moved to (a full page load), or null to show it here. `?…` and `#…` are kept:
 * BarMint keeps its form data there (`#s=…`, older links `?s=…`).
 * - BarMint lived at the site root (`/#s=…`, `/?s=…`, `/#impressum`), then at `/barmint`: both go to its own domain.
 * - On plumcast.mrvoje.com only the start page is the Plumcast page; other paths belong to mrvoje.com.
 * - On mrvoje.com, `/plumcast` goes to plumcast.mrvoje.com. (Elsewhere, e.g. localhost, the page stays at /plumcast.)
 */
export function movedTo({ hostname, pathname, search, hash }: Address): string | null {
  const keep = search + hash
  const atRoot = pathname === '/' || pathname === '/index.html'
  if (/^\/barmint(\/|$)/.test(pathname)) return BARMINT_URL + keep
  if (hostname === HOSTS.plumcast) return atRoot ? null : SITE_URL + pathname + keep
  const oldBarMintLink = /^#(s=|impressum$|datenschutz$)/.test(hash) || new URLSearchParams(search).has('s')
  if (atRoot && oldBarMintLink) return BARMINT_URL + keep
  if (hostname === HOSTS.site && /^\/plumcast\/?$/.test(pathname)) return PLUMCAST_URL + keep
  return null
}

/** Sends a moved address to its new place before the app starts. True when it did (don't bootstrap). */
export function redirectIfMoved(loc: Address & Pick<Location, 'replace'> = location): boolean {
  const to = movedTo(loc)
  if (to) loc.replace(to)
  return to !== null
}

/** True on plumcast.mrvoje.com: the app shows only the Plumcast page. */
export const isPlumcastHost = (hostname = location.hostname) => hostname === HOSTS.plumcast

/**
 * The one real address of a page (for <link rel="canonical">), whichever host served it: the site is
 * also reachable at its *.azurestaticapps.net default host. `path` is the router URL; ?… and #… are dropped.
 */
export function canonicalUrl(hostname: string, path: string): string {
  const page = path.split(/[?#]/)[0]
  if (isPlumcastHost(hostname) || /^\/plumcast\/?$/.test(page)) return PLUMCAST_URL
  return SITE_URL + (page === '/' ? '/' : page.replace(/\/+$/, ''))
}

/** Link to the Plumcast page: its own domain on the live site, the /plumcast route elsewhere (local dev). */
export const plumcastHref = (hostname = location.hostname) => (hostname === HOSTS.site ? PLUMCAST_URL : '/plumcast')
