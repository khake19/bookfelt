'use client'

import { useState } from 'react'
import { HiMail, HiCheckCircle } from 'react-icons/hi'
import { trackEvent } from '@/lib/posthog'
import { useSectionTracking } from '@/hooks/useSectionTracking'

export function Waitlist() {
  const sectionRef = useSectionTracking('waitlist')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // TODO: Replace with your preferred email service
      // Options: Mailchimp, ConvertKit, Supabase, etc.

      // For now, just simulate success
      // When you're ready to connect a real service, replace this with:
      // const response = await fetch('/api/waitlist', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // })

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      // Track successful waitlist signup
      trackEvent('waitlist_submitted', { email })

      setStatus('success')
      setMessage("You're on the list! We'll notify you when Bookfelt launches.")
      setEmail('')

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    }
  }

  return (
    <section id="waitlist" ref={sectionRef} className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block px-4 py-2 mb-6 bg-primary/10 text-primary rounded-full text-sm font-semibold">
            Coming Soon
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Be the first to know when we launch
          </h2>

          <p className="text-xl text-muted mb-8">
            Join the waitlist and get early access when Bookfelt becomes available
            on iOS and Android.
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center space-x-3 p-6 bg-accent/10 text-accent rounded-lg animate-fade-in">
              <HiCheckCircle className="w-6 h-6" />
              <p className="font-medium">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="relative flex-1">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={status === 'loading'}
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-4 text-destructive text-sm animate-fade-in">
              {message}
            </p>
          )}

          <p className="mt-6 text-sm text-muted">
            No spam, ever. Just a heads up when we launch. 🚀
          </p>
        </div>
      </div>
    </section>
  )
}
