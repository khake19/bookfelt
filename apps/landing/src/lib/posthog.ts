import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!apiKey || !host) {
    console.warn('[PostHog] Missing API key or host')
    return
  }

  posthog.init(apiKey, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll manually capture page views
    capture_pageleave: true,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug()
      }
    },
  })
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return
  posthog.capture(eventName, properties)
}

export function trackPageView(pageName: string) {
  if (typeof window === 'undefined') return
  posthog.capture('$pageview', { page: pageName })
}

export { posthog }
