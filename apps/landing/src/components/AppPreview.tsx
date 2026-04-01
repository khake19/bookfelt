// import Image from 'next/image' // Uncomment when adding real screenshots

const screenshots = [
  {
    src: '/images/screenshots/feature-1.png',
    alt: 'Bookfelt app showing entry creation',
    caption: 'Capture thoughts with voice or text',
  },
  {
    src: '/images/screenshots/feature-2.png',
    alt: 'Bookfelt app showing emotional arc visualization',
    caption: 'Track your emotional journey',
  },
  {
    src: '/images/screenshots/feature-3.png',
    alt: 'Bookfelt app showing bookends feature',
    caption: 'First impressions and final thoughts',
  },
]

export function AppPreview() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            See Bookfelt in action
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            A glimpse into how Bookfelt helps you capture and explore your
            reading experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-xl">
                {/* Placeholder - user will provide real screenshots */}
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-muted font-mono text-sm">
                      Screenshot {index + 1}
                    </p>
                    <p className="text-muted-foreground font-mono text-xs mt-2">
                      (Placeholder)
                    </p>
                  </div>
                </div>
                {/*
                When user provides screenshots, replace above with:
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  fill
                  className="object-cover"
                />
                */}
              </div>
              <p className="text-center text-muted font-medium">
                {screenshot.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
