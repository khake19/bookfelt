import type { Metadata } from 'next'
import { Lora, Source_Sans_3, Courier_Prime } from 'next/font/google'
import { PostHogProvider } from '@/components/PostHogProvider'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  variable: '--font-courier-prime',
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Bookfelt - Capture Your Reading Journey',
    template: '%s | Bookfelt',
  },
  description:
    'Capture your thoughts and feelings as you read. Reading journal that works offline and automatically syncs across devices. Track your emotional journey through every book.',
  keywords: [
    'reading journal',
    'offline reading journal',
    'book tracking',
    'emotion tracking',
    'audio book notes',
    'voice reflections',
    'book diary',
    'offline-first app',
    'private reading journal',
  ],
  authors: [{ name: 'Bookfelt' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bookfelt.app',
    title: 'Bookfelt - Capture Your Reading Journey',
    description:
      'The reading journal that tracks your emotional journey through every book.',
    siteName: 'Bookfelt',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bookfelt - Capture Your Reading Journey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bookfelt - Capture Your Reading Journey',
    description:
      'The reading journal that tracks your emotional journey through every book.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${sourceSans.variable} ${courierPrime.variable}`}
    >
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
