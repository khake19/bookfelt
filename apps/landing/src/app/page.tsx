import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { AppPreview } from '@/components/AppPreview'
import { Features } from '@/components/Features'
import { Differentiation } from '@/components/Differentiation'
import { Pricing } from '@/components/Pricing'
import { FAQ } from '@/components/FAQ'
import { DownloadCTA } from '@/components/DownloadCTA'
import { Footer } from '@/components/Footer'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'Bookfelt',
  operatingSystem: 'iOS, Android',
  applicationCategory: 'Books',
  description:
    'Capture your thoughts and feelings as you read. The reading journal that tracks your emotional journey through every book.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '100',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navigation />
      <main>
        <Hero />
        <AppPreview />
        <Features />
        <Differentiation />
        <Pricing />
        <FAQ />

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-b from-background to-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground font-serif mb-6">
              Start capturing your reading journey today
            </h2>
            <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
              Join readers who are discovering deeper connections with every book they read.
            </p>
            <div className="flex justify-center">
              <DownloadCTA variant="beta" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
