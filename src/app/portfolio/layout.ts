import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { SITE } from '../../site'
import { SITE_URL, isPlumcastHost } from '../redirects'
import { MrvojeLogo } from './logo'

/** Portfolio frame: header with navigation, page content, footer. Neutral colours (no project accent). */
@Component({
  selector: 'app-portfolio-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MrvojeLogo, RouterLink, RouterLinkActive, RouterOutlet],
  host: { class: 'relative block min-h-screen overflow-x-hidden' },
  template: `
    <!-- ambient background -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10">
      <div
        class="absolute -top-48 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-neutral-300/50 via-neutral-200/30 to-transparent dark:from-white/[0.07] dark:via-white/[0.03] blur-3xl"
      ></div>
    </div>

    <header
      class="sticky top-0 z-20 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl"
    >
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        @let logoLook =
          'group -mx-1 rounded-md px-1 py-1.5 text-neutral-900 dark:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400';
        @let navLook =
          'rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white';
        <!-- On plumcast.mrvoje.com the portfolio is another site: normal links to mrvoje.com. -->
        @if (otherHost) {
          <a [href]="site + '/'" [attr.aria-label]="name + ' (home)'" [class]="logoLook"><app-mrvoje-logo class="h-[22px]" /></a>
          <nav aria-label="Main" class="flex items-center gap-1">
            <a [href]="site + '/projects'" [class]="navLook">Projects</a>
          </nav>
        } @else {
          <a routerLink="/" [attr.aria-label]="name + ' (home)'" [class]="logoLook"><app-mrvoje-logo class="h-[22px]" /></a>
          <nav aria-label="Main" class="flex items-center gap-1">
            <a
              routerLink="/projects"
              routerLinkActive="bg-black/[0.06] dark:bg-white/10 text-neutral-900 dark:text-white"
              ariaCurrentWhenActive="page"
              [class]="navLook"
              >Projects</a
            >
          </nav>
        }
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
      <router-outlet />

      <footer class="mt-24 flex flex-col items-center gap-3 text-xs text-neutral-400 sm:flex-row sm:justify-between">
        <span>© {{ year }} {{ name }}</span>
        <nav aria-label="Legal" class="flex gap-4">
          @let legalLook = 'hover:text-neutral-700 dark:hover:text-neutral-200';
          @if (otherHost) {
            <a [href]="site + '/impressum'" [class]="legalLook">Impressum</a>
            <a [href]="site + '/privacy'" [class]="legalLook">Privacy</a>
          } @else {
            <a routerLink="/impressum" [class]="legalLook">Impressum</a>
            <a routerLink="/privacy" [class]="legalLook">Privacy</a>
          }
        </nav>
      </footer>
    </main>
  `,
})
export class PortfolioLayout {
  protected readonly name = SITE.name
  protected readonly year = new Date().getFullYear()
  protected readonly otherHost = isPlumcastHost()
  protected readonly site = SITE_URL

  constructor() {
    // The portfolio is English.
    document.documentElement.lang = 'en'
  }
}
