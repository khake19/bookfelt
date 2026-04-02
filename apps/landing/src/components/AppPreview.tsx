'use client'

import Image from 'next/image'
import { trackEvent } from '@/lib/posthog'
import { useSectionTracking } from '@/hooks/useSectionTracking'

export function AppPreview() {
  const sectionRef = useSectionTracking('app-preview')
  const features = [
    {
      numeral: 'i',
      headline: 'Capture the moment, your way',
      description:
        'Tap an emotion. Record your voice. Watch the waveform dance as you speak—then let AI turn it into text. Or just type. Your thoughts, your choice.',
      visual: 'emotion-voice', // Placeholder for emotion chips + waveform animation
    },
    {
      numeral: 'ii',
      headline: 'See how the story made you feel',
      description:
        'Every entry maps to your emotional arc. Watch your journey from enchanted to bittersweet to content—a visual story of how this book changed you.',
      visual: 'emotional-arc', // Placeholder for arc chart with real emotions
    },
    {
      numeral: 'iii',
      headline: 'First page. Last page. Everything between.',
      description:
        'Bookends capture what you felt when you started versus when you finished. See how your thoughts evolved from that first impression to your final takeaway.',
      visual: 'bookends',
    },
  ]

  return (
    <section ref={sectionRef} className="py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mb-24">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground font-serif mb-6 leading-tight">
            More than a reading log.
          </h2>
        </div>

        {/* Alternating Feature Layout */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div
                className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl font-serif text-accent/40 font-light">
                    {feature.numeral}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">
                    {feature.headline}
                  </h3>
                </div>
                <p className="text-lg md:text-xl text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Visual */}
              <div
                className={`relative ${index % 2 === 1 ? 'md:order-1' : ''}`}
              >
                {/* Device Frame */}
                <div className="relative max-w-sm mx-auto">
                  {/* Phone bezel/frame */}
                  <div className="relative bg-gradient-to-b from-foreground/90 to-foreground rounded-[3rem] p-3 shadow-2xl">
                    {/* Screen */}
                    <div className="relative bg-background rounded-[2.5rem] overflow-hidden">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/90 rounded-b-3xl z-10" />

                      {/* Video content */}
                      <div className="relative aspect-[9/19.5] bg-background overflow-hidden">
                        {/* Feature video or placeholder */}
                        {feature.visual === 'emotion-voice' ? (
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            onPlay={() =>
                              trackEvent('video_played', {
                                location: 'features',
                                feature: feature.visual,
                                numeral: feature.numeral,
                              })
                            }
                          >
                            <source src="/videos/02-add-audio-entry.mp4" type="video/mp4" />
                          </video>
                        ) : feature.visual === 'emotional-arc' ? (
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            onPlay={() =>
                              trackEvent('video_played', {
                                location: 'features',
                                feature: feature.visual,
                                numeral: feature.numeral,
                              })
                            }
                          >
                            <source src="/videos/03-add-arc-graph.mp4" type="video/mp4" />
                          </video>
                        ) : feature.visual === 'bookends' ? (
                          <Image
                            src="/images/04-bookends.jpg"
                            alt="Bookfelt bookends feature showing first impression and final thought"
                            fill
                            className="object-cover"
                            onLoad={() =>
                              trackEvent('image_loaded', {
                                location: 'features',
                                feature: feature.visual,
                                numeral: feature.numeral,
                              })
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-accent/10">
                            <div className="text-center">
                              <p className="text-muted font-mono text-sm mb-2">
                                {feature.visual}
                              </p>
                              <p className="text-muted/60 font-mono text-xs">
                                (Screenshot or animation placeholder)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/5 to-background/10 rounded-[3rem] pointer-events-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
