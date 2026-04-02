'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/posthog'

export function useSectionTracking(sectionName: string) {
  const ref = useRef<HTMLElement>(null)
  const hasTracked = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || hasTracked.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked.current) {
          trackEvent('section_viewed', {
            section: sectionName,
            timestamp: Date.now(),
          })
          hasTracked.current = true
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of section is visible
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [sectionName])

  return ref
}
