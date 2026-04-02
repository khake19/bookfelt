'use client'

// import Image from 'next/image' // Uncomment when adding real screenshots
import { DownloadCTA } from './DownloadCTA'
import { trackEvent } from '@/lib/posthog'

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-secondary via-background to-background pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              One tap. That's the whole journal entry.
            </h1>
            <p className="text-xl md:text-2xl text-muted leading-relaxed">
              Bookfelt is the reading journal that goes beyond notes—record your
              emotional journey through every book. Works offline, syncs
              automatically when online.
            </p>
            <div className="pt-4">
              <DownloadCTA />
            </div>
          </div>

          {/* Hero Video */}
          <div className="relative animate-slide-up flex justify-center">
            {/* Device Frame */}
            <div className="relative max-w-sm">
              {/* Phone bezel/frame */}
              <div className="relative bg-gradient-to-b from-foreground/90 to-foreground rounded-[3rem] p-3 shadow-2xl">
                {/* Screen */}
                <div className="relative bg-background rounded-[2.5rem] overflow-hidden">
                  {/* Notch (optional - can remove if not needed) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/90 rounded-b-3xl z-10" />

                  {/* Video content */}
                  <div className="relative aspect-[9/19.5] bg-background">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onPlay={() => trackEvent('video_played', { location: 'hero', video: 'hero-demo' })}
                    >
                      <source src="/videos/hero-demo.mp4" type="video/mp4" />
                      {/* Fallback for browsers that don't support video */}
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <p className="text-muted font-mono text-sm px-4 text-center">
                          Your browser doesn't support video playback
                        </p>
                      </div>
                    </video>
                  </div>
                </div>
              </div>

              {/* Reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/5 to-background/10 rounded-[3rem] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
    </section>
  )
}
