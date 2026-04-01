import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Tagline */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
              Bookfelt
            </h3>
            <p className="text-muted text-sm">
              Capture your thoughts and feelings as you read.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted hover:text-primary transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted hover:text-primary transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted hover:text-primary transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Download */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Get the App</h4>
            <p className="text-muted text-sm mb-4">
              Available on iOS and Android
            </p>
            <a
              href="#download"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors text-sm"
            >
              Download Now
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted text-sm">
            &copy; {currentYear} Bookfelt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
