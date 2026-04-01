import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
            Page Not Found
          </h2>
          <p className="text-xl text-muted mb-8 max-w-md mx-auto">
            Looks like this page took a different path. Let's get you back on
            track.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
