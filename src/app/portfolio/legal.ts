import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { LEGAL } from '../../legal'
import { Card } from '../ui/card'

/** Owner's name, address and email, shown on both legal pages. */
@Component({
  selector: 'app-legal-address',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p>
      {{ L.name }}<br />
      {{ L.street }}<br />
      {{ L.city }}<br />
      {{ L.country }}<br />
      <br />
      Email: <a [href]="'mailto:' + L.email">{{ L.email }}</a>
    </p>
  `,
})
export class LegalAddress {
  protected readonly L = LEGAL
}

/** Heading and card around a legal text: `<app-legal-page heading="…">sections</app-legal-page>`. */
@Component({
  selector: 'app-legal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card],
  host: { class: 'block' },
  template: `
    <section class="pt-16 sm:pt-24 pb-10">
      <h1 class="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
        {{ heading() }}
      </h1>
    </section>
    <div
      appCard
      class="max-w-3xl p-6 sm:p-10 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300 [&_a]:text-neutral-900 dark:[&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutral-900 dark:[&_h2]:text-white [&_section+section]:mt-7"
    >
      <ng-content />
    </div>
  `,
})
export class LegalPage {
  readonly heading = input.required<string>()
}

@Component({
  selector: 'app-impressum',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalPage, LegalAddress],
  host: { class: 'block' },
  template: `
    <app-legal-page heading="Impressum">
      <section>
        <h2>Owner and publisher</h2>
        <app-legal-address />
      </section>
      <section>
        <h2>Legal basis</h2>
        <p>
          Information pursuant to § 5 ECG and § 25 MedienG (Austria) and § 5 DDG (Germany). Responsible for content:
          {{ name }}, address as above.
        </p>
      </section>
      <section>
        <h2>Purpose of this site</h2>
        <p>
          Personal website (mrvoje.com, plumcast.mrvoje.com): the owner's work in software development and AI, and the
          projects built along the way. BarMint (barmint.mrvoje.com) and Plumcast are projects of the same owner.
        </p>
      </section>
      <section>
        <h2>Links</h2>
        <p>
          This site links to other websites, such as GitHub. Their operators alone are responsible for their content. No
          unlawful content was apparent when the links were set; links are removed as soon as any becomes known.
        </p>
      </section>
    </app-legal-page>
  `,
})
export class Impressum {
  protected readonly name = LEGAL.name
}

@Component({
  selector: 'app-privacy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalPage, LegalAddress],
  host: { class: 'block' },
  template: `
    <app-legal-page heading="Privacy policy">
      <section>
        <h2>In short</h2>
        <p>
          This site (mrvoje.com and plumcast.mrvoje.com) only shows information. There are no cookies, no tracking, no
          analytics, no forms, no external fonts or scripts, and nothing is stored in your browser.
        </p>
      </section>
      <section>
        <h2>Controller</h2>
        <app-legal-address />
      </section>
      <section>
        <h2>Hosting and server logs</h2>
        <p>
          The site is hosted on Microsoft Azure (Static Web Apps). Content is delivered through Microsoft's worldwide
          network; the site is managed in the US region (East US 2). When you open it, Microsoft processes technically
          necessary data such as your IP address, time, requested file and browser identifier to deliver the page and
          protect it from abuse. The legal basis is Art. 6(1)(f) GDPR (legitimate interest in secure operation).
          Microsoft acts as a processor under its Data Protection Addendum (DPA). Data is transferred to the USA in the
          process; Microsoft is certified under the EU-US Data Privacy Framework (adequacy decision, Art. 45 GDPR).
          These logs are not analysed.
        </p>
      </section>
      <section>
        <h2>Downloads and links to GitHub</h2>
        <p>
          The Plumcast download (also via mrvoje.com/plumcast.apk) and the source code links lead to GitHub, operated by
          GitHub, Inc. (USA). When you follow them, GitHub processes your data under its own
          <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
            >privacy statement</a
          >. BarMint (barmint.mrvoje.com) has its own privacy policy.
        </p>
      </section>
      <section>
        <h2>Email</h2>
        <p>
          If you send an email, your address and message are used only to reply and are deleted once they are no longer
          needed (Art. 6(1)(f) GDPR).
        </p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>
          You have the right of access, rectification, erasure, restriction of processing, data portability and
          objection (Art. 15–21 GDPR), and the right to lodge a complaint with a data protection supervisory authority,
          in Austria the Datenschutzbehörde (dsb.gv.at). Write to the email address above.
        </p>
      </section>
      <section>
        <h2>Last updated</h2>
        <p>{{ updated }}</p>
      </section>
    </app-legal-page>
  `,
})
export class Privacy {
  protected readonly updated = LEGAL.updated
}
