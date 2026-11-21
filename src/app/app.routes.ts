import type { Route, Routes } from '@angular/router'
import { SITE } from '../site'
import { Home } from './portfolio/home'
import { PortfolioLayout } from './portfolio/layout'
import { ProjectsPage } from './portfolio/projects-page'
import { isPlumcastHost } from './redirects'

const plumcastPage: Route = {
  loadComponent: () => import('./plumcast/plumcast').then((m) => m.Plumcast),
  title: 'Plumcast · IPTV player for Android TV, Fire TV and phones',
}

/**
 * Pages of this app. On plumcast.mrvoje.com (a second domain of the same app) the start page is the
 * Plumcast page and there is nothing else; on mrvoje.com it's the portfolio. BarMint is its own app.
 */
export function routesFor(hostname: string): Routes {
  if (isPlumcastHost(hostname)) {
    return [{ path: '', component: PortfolioLayout, children: [{ path: '', ...plumcastPage }] }, { path: '**', redirectTo: '' }]
  }
  return [
    {
      path: '',
      component: PortfolioLayout,
      children: [
        { path: '', component: Home, title: `${SITE.name} · Software development & AI` },
        { path: 'projects', component: ProjectsPage, title: `Projects · ${SITE.name}` },
        { path: 'impressum', loadComponent: () => import('./portfolio/legal').then((m) => m.Impressum), title: `Impressum · ${SITE.name}` },
        { path: 'privacy', loadComponent: () => import('./portfolio/legal').then((m) => m.Privacy), title: `Privacy policy · ${SITE.name}` },
        // Local dev only: on mrvoje.com, /plumcast redirects to plumcast.mrvoje.com before the app starts.
        { path: 'plumcast', ...plumcastPage },
      ],
    },
    { path: '**', redirectTo: '' },
  ]
}

export const routes = routesFor(location.hostname)
