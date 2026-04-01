import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Bookfelt collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Privacy Policy
          </h1>

          <p className="text-muted mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Introduction
              </h2>
              <p className="text-muted leading-relaxed">
                Bookfelt ("we", "our", or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our mobile
                application and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Information We Collect
              </h2>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Account Information
              </h3>
              <ul className="list-disc list-inside text-muted space-y-2 mb-4">
                <li>Email address (for account creation and authentication)</li>
                <li>Google account information (if you sign in with Google)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-2">
                Content You Create
              </h3>
              <ul className="list-disc list-inside text-muted space-y-2 mb-4">
                <li>
                  Reading journal entries (text snippets, bookends, reflections)
                </li>
                <li>Voice recordings and their AI-generated transcriptions</li>
                <li>Book information (titles, authors, reading progress)</li>
                <li>Emotional tags and reading arc data</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-2">
                Usage Information
              </h3>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>App usage analytics (via PostHog)</li>
                <li>Device information and crash reports</li>
                <li>Subscription status (via RevenueCat)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>To provide and maintain the Bookfelt service</li>
                <li>To sync your reading journal across devices</li>
                <li>
                  To transcribe voice recordings using OpenAI Whisper (audio is
                  not stored by OpenAI)
                </li>
                <li>
                  To generate AI summaries of your books using OpenAI GPT-4o-mini
                </li>
                <li>
                  To process subscription payments and manage Premium features
                </li>
                <li>To improve our app and develop new features</li>
                <li>To communicate with you about your account and support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Third-Party Services
              </h2>
              <p className="text-muted mb-4">We use the following services:</p>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>
                  <strong>Supabase:</strong> Database and authentication (data
                  stored securely with encryption)
                </li>
                <li>
                  <strong>OpenAI:</strong> Audio transcription (Whisper) and
                  summary generation (GPT-4o-mini)
                </li>
                <li>
                  <strong>RevenueCat:</strong> Subscription management and payment
                  processing
                </li>
                <li>
                  <strong>PostHog:</strong> Privacy-focused analytics
                </li>
                <li>
                  <strong>Google Sign-In:</strong> OAuth authentication (optional)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Data Security
              </h2>
              <p className="text-muted leading-relaxed">
                We use industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>End-to-end encryption for cloud sync</li>
                <li>Secure HTTPS connections for all data transmission</li>
                <li>
                  Your journal entries are stored securely and never used to train
                  AI models
                </li>
                <li>Audio files are stored locally and optionally synced to cloud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Your Rights (GDPR/CCPA)
              </h2>
              <p className="text-muted mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Access your personal data</li>
                <li>Request deletion of your account and all associated data</li>
                <li>Export your reading journal entries</li>
                <li>Opt out of analytics tracking</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              <p className="text-muted mt-4">
                To exercise these rights, please contact us at{' '}
                <a
                  href="mailto:privacy@bookfelt.app"
                  className="text-primary hover:underline"
                >
                  privacy@bookfelt.app
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Children's Privacy
              </h2>
              <p className="text-muted leading-relaxed">
                Bookfelt is not intended for children under 13. We do not
                knowingly collect personal information from children under 13. If
                you believe we have collected information from a child under 13,
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Changes to This Policy
              </h2>
              <p className="text-muted leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Contact Us
              </h2>
              <p className="text-muted leading-relaxed">
                If you have questions about this Privacy Policy, please contact us
                at{' '}
                <a
                  href="mailto:privacy@bookfelt.app"
                  className="text-primary hover:underline"
                >
                  privacy@bookfelt.app
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
