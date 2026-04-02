'use client'

import { FaApple, FaGooglePlay } from 'react-icons/fa'
import { trackEvent } from '@/lib/posthog'

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || '#waitlist'
const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL || '#waitlist'

interface DownloadCTAProps {
  variant?: 'default' | 'coming-soon'
}

export function DownloadCTA({ variant = 'coming-soon' }: DownloadCTAProps) {
  if (variant === 'coming-soon') {
    return (
      <div id="download" className="flex flex-col sm:flex-row gap-4">
        {/* App Store Button - Coming Soon */}
        <a
          href="#waitlist"
          onClick={() => trackEvent('download_cta_clicked', { platform: 'ios', variant: 'coming_soon' })}
          className="inline-flex items-center justify-center px-6 py-3 bg-foreground/10 text-foreground border-2 border-foreground/20 rounded-lg font-medium hover:bg-foreground/20 transition-all shadow-lg cursor-pointer"
        >
          <FaApple className="w-6 h-6 mr-3" />
          <div className="text-left">
            <div className="text-xs">Coming Soon on</div>
            <div className="text-lg font-semibold">App Store</div>
          </div>
        </a>

        {/* Google Play Button - Join Beta */}
        <a
          href="#waitlist"
          onClick={() => trackEvent('download_cta_clicked', { platform: 'android', variant: 'beta' })}
          className="inline-flex items-center justify-center px-6 py-3 bg-foreground/10 text-foreground border-2 border-foreground/20 rounded-lg font-medium hover:bg-foreground/20 transition-all shadow-lg cursor-pointer"
        >
          <FaGooglePlay className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="text-xs">Join the Beta on</div>
            <div className="text-lg font-semibold">Google Play</div>
          </div>
        </a>
      </div>
    )
  }

  // Default variant with actual links (for when apps are live)
  return (
    <div id="download" className="flex flex-col sm:flex-row gap-4">
      {/* App Store Button */}
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-all hover:scale-105 shadow-lg"
      >
        <FaApple className="w-6 h-6 mr-3" />
        <div className="text-left">
          <div className="text-xs">Download on the</div>
          <div className="text-lg font-semibold">App Store</div>
        </div>
      </a>

      {/* Google Play Button */}
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-all hover:scale-105 shadow-lg"
      >
        <FaGooglePlay className="w-5 h-5 mr-3" />
        <div className="text-left">
          <div className="text-xs">Get it on</div>
          <div className="text-lg font-semibold">Google Play</div>
        </div>
      </a>
    </div>
  )
}
