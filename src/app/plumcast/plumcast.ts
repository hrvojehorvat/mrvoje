import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import {
  LucideCalendarDays,
  LucideCheck,
  LucideClapperboard,
  LucideCopy,
  LucideDownload,
  LucideExternalLink,
  LucideGamepad2,
  LucideHistory,
  LucideListVideo,
  LucideMic,
  LucideSearch,
  LucideShieldCheck,
  LucideTv,
} from '@lucide/angular'
import { Card } from '../ui/card'
import { PlumcastLogo } from './logo'

const REPO = 'https://github.com/hrvojehorvat/plumcast'

/** Download links. The short link is a redirect in public/staticwebapp.config.json (easy to type on a TV remote). */
export const PLUMCAST_LINKS = {
  apk: `${REPO}/releases/latest/download/plumcast.apk`,
  short: 'mrvoje.com/plumcast.apk',
  releases: `${REPO}/releases`,
  source: REPO,
}

/** Plumcast project page (/plumcast): what it is, screenshots, download and install guide. */
@Component({
  selector: 'app-plumcast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Card,
    PlumcastLogo,
    LucideCalendarDays,
    LucideCheck,
    LucideClapperboard,
    LucideCopy,
    LucideDownload,
    LucideExternalLink,
    LucideGamepad2,
    LucideHistory,
    LucideListVideo,
    LucideMic,
    LucideSearch,
    LucideShieldCheck,
    LucideTv,
  ],
  host: { class: 'theme-purple block' },
  templateUrl: './plumcast.html',
})
export class Plumcast {
  protected readonly links = PLUMCAST_LINKS
  protected readonly copied = signal(false)

  protected readonly features = [
    { icon: 'tv', title: 'Live TV', text: 'Channels by category, what is on now and next, and a small live preview next to the list.' },
    { icon: 'history', title: 'Catch-up', text: 'Missed something? Replays of the last days, per channel or as one list of everything that aired.' },
    { icon: 'guide', title: 'TV guide', text: 'A timeline of programmes per category. Past ones with a replay start right from the guide.' },
    { icon: 'films', title: 'Films and series', text: 'Posters, details, seasons and episodes. Continues where you stopped.' },
    { icon: 'search', title: 'Search', text: 'One search across channels, films, series and programmes, or just inside the category you are in.' },
    { icon: 'remote', title: 'Made for the remote', text: 'Every screen works with the D-pad: OK opens, Back goes one step back. Also fine with touch.' },
    { icon: 'playlist', title: 'Your playlist', text: 'Xtream Codes login, an M3U link or an M3U file. Several playlists, switch any time.' },
    { icon: 'private', title: 'Private', text: 'No account, no ads, no tracking. English, German and Croatian.' },
  ] as const

  /** Plum, the voice assistant: what it understands, shown next to its screenshot. */
  protected readonly plumPoints = [
    'Live channels, replays, films, series and categories, from one sentence.',
    'Knows when something aired: today, yesterday, a weekday, the evening or an exact time.',
    'One clear match starts right away; several come as a short list to choose from.',
    'Speech is recognized by the device’s own speech service. Plumcast itself sends nothing anywhere.',
  ] as const
  protected readonly plumShot = {
    src: 'media/plumcast/tv-plum-catchup.jpg',
    alt: 'Plum on a TV: replays of a programme from yesterday on several channels, to choose from',
  }

  protected readonly tvShots = [
    { src: 'media/plumcast/tv-live.jpg', alt: 'Live TV on a TV: categories, channels with what is on now, and a small preview' },
    { src: 'media/plumcast/tv-guide.jpg', alt: 'TV guide: channels and programmes on a timeline' },
    { src: 'media/plumcast/tv-catchup.jpg', alt: 'Catch-up: replays of the last 7 days for a channel' },
    { src: 'media/plumcast/tv-movie.jpg', alt: 'A film with poster, details and the Play button' },
    { src: 'media/plumcast/tv-plum-movies.jpg', alt: 'Plum finding films and the matching category' },
  ]
  protected readonly phoneShots = [
    { src: 'media/plumcast/phone-home.jpg', alt: 'Home on a phone: sections, recently added films and series' },
    { src: 'media/plumcast/phone-plum.jpg', alt: 'Plum on a phone' },
  ]

  protected async copyShort() {
    try {
      await navigator.clipboard.writeText(this.links.short)
      this.copied.set(true)
      setTimeout(() => this.copied.set(false), 1600)
    } catch {
      // Clipboard blocked: the link is visible anyway.
    }
  }
}
