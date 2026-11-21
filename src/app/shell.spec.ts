import { ErrorHandler } from '@angular/core'
import { Router } from '@angular/router'
import { TestBed } from '@angular/core/testing'
import { render, screen } from '@testing-library/angular'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { configFor } from './app.config'
import { routesFor } from './app.routes'
import { Shell } from './shell'

/** The real app (router, error handler) opened at `url`; `host` picks the routes of that domain. */
const open = async (url: string, host = 'localhost') => {
  history.replaceState(null, '', url)
  const view = await render(Shell, { providers: configFor(routesFor(host)).providers })
  await TestBed.inject(Router).navigateByUrl(url)
  await view.fixture.whenStable()
  return view
}

const APK = 'https://github.com/hrvojehorvat/plumcast/releases/latest/download/plumcast.apk'

describe('Shell', () => {
  it('shows the portfolio home with the project list', async () => {
    await open('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Software development and AI/)
    expect(document.title).toBe('Mrvoje · Software development & AI')
    expect(screen.getByRole('link', { name: 'Mrvoje (home)' })).toHaveAttribute('href', '/')
  })

  it('links the projects to their own addresses, in their colours', async () => {
    const user = userEvent.setup()
    await open('/')
    await user.click(screen.getByRole('link', { name: 'Projects' }))
    expect(await screen.findByRole('heading', { name: 'Projects', level: 1 })).toBeInTheDocument()
    // TestBed uses a mock browser location, so check the router's URL.
    expect(TestBed.inject(Router).url).toBe('/projects')

    const barmint = screen.getByRole('link', { name: /BarMint/ })
    expect(barmint).toHaveAttribute('href', 'https://barmint.mrvoje.com/')
    expect(barmint).toHaveClass('theme-mint')
    // Local dev: the Plumcast page is the /plumcast route (on mrvoje.com it's plumcast.mrvoje.com).
    const plumcast = screen.getByRole('link', { name: /Plumcast/ })
    expect(plumcast).toHaveAttribute('href', '/plumcast')
    expect(plumcast).toHaveClass('theme-purple')
  })

  it('has its own Impressum and privacy policy', async () => {
    const user = userEvent.setup()
    await open('/')
    expect(screen.getByRole('link', { name: 'Impressum' })).toHaveAttribute('href', '/impressum')
    await user.click(screen.getByRole('link', { name: 'Impressum' }))
    expect(await screen.findByRole('heading', { name: 'Impressum', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/§ 25 MedienG/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'hmrvoje@gmail.com' })).toHaveAttribute('href', 'mailto:hmrvoje@gmail.com')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://mrvoje.com/impressum')

    await user.click(screen.getByRole('link', { name: 'Privacy' }))
    expect(await screen.findByRole('heading', { name: 'Privacy policy', level: 1 })).toBeInTheDocument()
    expect(document.title).toBe('Privacy policy · Mrvoje')
    expect(screen.getByRole('heading', { name: 'Hosting and server logs' })).toBeInTheDocument()
  })

  it('shows the Plumcast page with the download links', async () => {
    await open('/plumcast')
    expect(await screen.findByRole('heading', { name: 'Plumcast', level: 1 })).toBeInTheDocument()
    expect(document.title).toMatch(/^Plumcast/)
    for (const link of screen.getAllByRole('link', { name: /Download for Android/ })) {
      expect(link).toHaveAttribute('href', APK)
    }
    expect(screen.getAllByText('mrvoje.com/plumcast.apk').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'No content included' })).toBeInTheDocument()
  })

  it('on plumcast.mrvoje.com the start page is the Plumcast page', async () => {
    await open('/', 'plumcast.mrvoje.com')
    expect(await screen.findByRole('heading', { name: 'Plumcast', level: 1 })).toBeInTheDocument()
    expect(document.title).toMatch(/^Plumcast/)
  })

  it('shows a recovery screen instead of a blank page', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const view = await open('/projects')
    view.fixture.debugElement.injector.get(ErrorHandler).handleError(new Error('boom'))
    await view.fixture.whenStable()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start page' })).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('keeps the app running on harmless global browser errors', async () => {
    const view = await open('/')
    window.dispatchEvent(new ErrorEvent('error', { message: 'ResizeObserver loop completed with undelivered notifications' }))
    await view.fixture.whenStable()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
