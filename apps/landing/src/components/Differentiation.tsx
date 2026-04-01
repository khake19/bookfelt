import { HiCheckCircle } from 'react-icons/hi'

const comparisons = [
  {
    title: 'vs Goodreads',
    description:
      'More than star ratings—capture your emotional journey through every book. Works offline, automatically syncs when online.',
  },
  {
    title: 'vs Note-taking apps',
    description:
      'Purpose-built for readers, not generic notes. Track emotions, bookends, and reading arcs. Never lose your data with automatic cloud backup.',
  },
  {
    title: 'vs Physical journals',
    description:
      'The intimacy of pen and paper meets the convenience of an app. Voice transcription, search, and automatic cloud sync across devices.',
  },
]

export function Differentiation() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Bookfelt?
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Bookfelt is built from the ground up for readers who want to go
            deeper than simple ratings and reviews.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {comparisons.map((comparison, index) => (
            <div
              key={index}
              className="flex flex-col items-start space-y-4 p-6 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center space-x-2">
                <HiCheckCircle className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-bold text-foreground">
                  {comparison.title}
                </h3>
              </div>
              <p className="text-muted leading-relaxed">
                {comparison.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
