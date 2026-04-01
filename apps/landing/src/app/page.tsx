import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { AppPreview } from '@/components/AppPreview'
import { Features } from '@/components/Features'
import { Differentiation } from '@/components/Differentiation'
import { Pricing } from '@/components/Pricing'
import { FAQ } from '@/components/FAQ'
import { Waitlist } from '@/components/Waitlist'
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
        <Waitlist />
      </main>
      <Footer />
    </>
  )
}
