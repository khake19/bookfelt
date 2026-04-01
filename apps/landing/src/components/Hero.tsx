// import Image from 'next/image' // Uncomment when adding real screenshots
import { DownloadCTA } from './DownloadCTA'

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-secondary via-background to-background pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Capture your thoughts and feelings as you read.
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

          {/* Hero Image */}
          <div className="relative animate-slide-up">
            <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-2xl">
              {/* Placeholder - user will provide real screenshot */}
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted font-mono text-sm">
                    Hero Screenshot
                  </p>
                  <p className="text-muted-foreground font-mono text-xs mt-2">
                    (Placeholder)
                  </p>
                </div>
              </div>
              {/*
              When user provides screenshot, replace above with:
              <Image
                src="/images/screenshots/hero.png"
                alt="Bookfelt app screenshot showing emotional journey"
                fill
                className="object-cover"
                priority
              />
              */}
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
