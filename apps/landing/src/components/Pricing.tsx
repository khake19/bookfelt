import { HiCheck, HiX } from 'react-icons/hi'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for casual readers',
    features: [
      { name: 'Works completely offline', included: true },
      { name: 'Unlimited text entries', included: true },
      { name: 'Automatic cloud backup & sync', included: true },
      { name: 'Emotional arc tracking', included: true },
      { name: '15 audio transcriptions total', included: true },
      { name: '3 bookends (first impression, final thought, exit note)', included: true },
      { name: '1 AI summary per book', included: true },
      { name: 'Unlimited audio transcriptions', included: false },
      { name: 'Unlimited bookends', included: false },
      { name: 'Unlimited AI summaries', included: false },
      { name: 'Cloud sync for audio files', included: false },
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$3.99',
    period: '/month',
    yearlyPrice: '$29.99/year',
    description: 'For dedicated readers',
    features: [
      { name: 'Works completely offline', included: true },
      { name: 'Unlimited text entries', included: true },
      { name: 'Automatic cloud backup & sync', included: true },
      { name: 'Emotional arc tracking', included: true },
      { name: 'Unlimited audio transcriptions', included: true },
      { name: 'Unlimited bookends', included: true },
      { name: 'Unlimited AI summaries', included: true },
      { name: 'Cloud sync for audio files', included: true },
      { name: 'Priority support', included: true },
      { name: 'Early access to new features', included: true },
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
]

export function Pricing() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Start free and upgrade when you're ready for unlimited features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg p-8 border-2 ${
                tier.highlighted
                  ? 'border-primary bg-card shadow-xl scale-105'
                  : 'border-border bg-card'
              }`}
            >
              {tier.highlighted && (
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-primary-foreground bg-primary rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-foreground mb-2">
                {tier.name}
              </h3>
              <p className="text-muted mb-6">{tier.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {tier.price}
                </span>
                <span className="text-muted ml-2">{tier.period}</span>
                {tier.yearlyPrice && (
                  <p className="text-sm text-muted mt-1">{tier.yearlyPrice}</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    {feature.included ? (
                      <HiCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <HiX className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        feature.included ? 'text-foreground' : 'text-muted line-through'
                      }
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#download"
                className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  tier.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-foreground/10 text-foreground hover:bg-foreground/20'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted mt-8">
          All plans include a 5-entry minimum for AI summary generation to ensure
          quality.
        </p>
      </div>
    </section>
  )
}
