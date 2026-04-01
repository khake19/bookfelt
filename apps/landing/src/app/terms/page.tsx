import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Bookfelt.',
}

export default function TermsPage() {
  return (
    <>
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Terms of Service
          </h1>

          <p className="text-muted mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Acceptance of Terms
              </h2>
              <p className="text-muted leading-relaxed">
                By accessing or using Bookfelt ("the Service"), you agree to be
                bound by these Terms of Service ("Terms"). If you do not agree to
                these Terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Use of Service
              </h2>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Acceptable Use
              </h3>
              <p className="text-muted mb-4">You agree to use Bookfelt only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>
                  Violate any applicable laws or regulations
                </li>
                <li>
                  Infringe on the intellectual property rights of others
                </li>
                <li>
                  Attempt to gain unauthorized access to the Service or other
                  users' accounts
                </li>
                <li>
                  Upload malicious code or attempt to disrupt the Service
                </li>
                <li>
                  Use the Service to harass, abuse, or harm others
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Account Registration
              </h2>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>
                  You must provide accurate and complete information when creating
                  an account
                </li>
                <li>
                  You are responsible for maintaining the security of your account
                  credentials
                </li>
                <li>
                  You are responsible for all activities that occur under your
                  account
                </li>
                <li>
                  You must be at least 13 years old to use Bookfelt
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Content Ownership
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                <strong>Your Content:</strong> You retain all ownership rights to
                the content you create in Bookfelt (journal entries, reflections,
                bookends, etc.). By using the Service, you grant us a limited
                license to store, process, and display your content solely to
                provide the Service to you.
              </p>
              <p className="text-muted leading-relaxed">
                <strong>Our Content:</strong> The Bookfelt app, including its
                design, code, features, and trademarks, is owned by Bookfelt and
                protected by copyright and intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Subscription Terms
              </h2>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Premium Subscription
              </h3>
              <ul className="list-disc list-inside text-muted space-y-2 mb-4">
                <li>
                  Premium subscriptions are billed monthly ($3.99/month) or yearly
                  ($29.99/year)
                </li>
                <li>
                  Subscriptions automatically renew unless cancelled at least 24
                  hours before the end of the current period
                </li>
                <li>
                  Billing is managed through the App Store (iOS) or Google Play
                  (Android)
                </li>
                <li>
                  You can cancel your subscription at any time through your App
                  Store or Google Play account settings
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-2">
                Refunds
              </h3>
              <p className="text-muted leading-relaxed">
                Refunds are handled by Apple (App Store) or Google (Play Store)
                according to their respective policies. We do not process refunds
                directly. If you cancel your subscription, you will retain Premium
                features until the end of your current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Termination
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account if you
                violate these Terms. You may delete your account at any time
                through the app settings. Upon termination:
              </p>
              <ul className="list-disc list-inside text-muted space-y-2">
                <li>Your access to the Service will be revoked</li>
                <li>
                  Your data will be deleted from our servers within 30 days
                  (unless required by law to retain)
                </li>
                <li>You can export your data before deletion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Limitation of Liability
              </h2>
              <p className="text-muted leading-relaxed">
                Bookfelt is provided "as is" without warranties of any kind. We
                are not liable for any indirect, incidental, special, or
                consequential damages arising from your use of the Service,
                including but not limited to loss of data, profits, or
                opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Data Backup
              </h2>
              <p className="text-muted leading-relaxed">
                While we use cloud sync to back up your data, you are responsible
                for maintaining your own backups. We recommend regularly exporting
                your journal entries. We are not liable for any data loss.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                AI-Generated Content
              </h2>
              <p className="text-muted leading-relaxed">
                AI-generated summaries and transcriptions are provided for
                convenience and may contain errors. You are responsible for
                reviewing and verifying AI-generated content. We do not guarantee
                the accuracy or quality of AI-generated output.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Changes to Terms
              </h2>
              <p className="text-muted leading-relaxed">
                We may update these Terms from time to time. We will notify you of
                significant changes by email or through the app. Your continued
                use of the Service after changes take effect constitutes
                acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Governing Law
              </h2>
              <p className="text-muted leading-relaxed">
                These Terms are governed by and construed in accordance with the
                laws of the United States. Any disputes arising from these Terms
                or the Service shall be resolved through binding arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Contact Us
              </h2>
              <p className="text-muted leading-relaxed">
                If you have questions about these Terms, please contact us at{' '}
                <a
                  href="mailto:support@bookfelt.app"
                  className="text-primary hover:underline"
                >
                  support@bookfelt.app
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
