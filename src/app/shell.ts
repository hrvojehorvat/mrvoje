import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'
import { canonicalUrl } from './redirects'
import { AppFailure, Recovery } from './recovery'

/** Root component: the routed page (portfolio or a project), or the recovery screen after an error. */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Recovery, RouterOutlet],
  template: `
    @if (failure.failed()) {
      <app-recovery />
    } @else {
      <router-outlet />
    }
  `,
})
export class Shell {
  protected readonly failure = inject(AppFailure)

  constructor() {
    // One index.html serves two domains, so the canonical link is set per page here.
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((e) => {
        if (e instanceof NavigationEnd) setCanonical(canonicalUrl(location.hostname, e.urlAfterRedirects))
      })
  }
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.append(link)
  }
  link.href = href
}
