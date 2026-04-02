'use client'

import {
  HiPencilAlt,
  HiBookOpen,
  HiEmojiHappy,
  HiSparkles,
  HiCloud,
  HiShieldCheck,
} from 'react-icons/hi'
import { FeatureCard } from './FeatureCard'
import { useSectionTracking } from '@/hooks/useSectionTracking'

const features = [
  {
    icon: <HiShieldCheck className="w-6 h-6" />,
    title: 'Works Offline',
    description:
      "Journal anywhere, anytime—no internet required. Your entries are saved locally and automatically backed up to the cloud when you're online.",
  },
  {
    icon: <HiPencilAlt className="w-6 h-6" />,
    title: 'Capture Thoughts Your Way',
    description:
      'Write snippets, record voice reflections with AI transcription, and tag your emotions as you read. Writing works offline, transcription needs internet.',
  },
  {
    icon: <HiBookOpen className="w-6 h-6" />,
    title: 'Three Key Moments',
    description:
      'Bookends capture your First Impression, Final Thought, and Exit Note—the moments that define your reading experience.',
  },
  {
    icon: <HiEmojiHappy className="w-6 h-6" />,
    title: 'Visualize Your Journey',
    description:
      'Track your emotional arc through each book. See how your feelings evolved from the first page to the last.',
  },
  {
    icon: <HiSparkles className="w-6 h-6" />,
    title: 'Smart Book Summaries',
    description:
      'Get personalized AI-generated summaries based on your reflections. Requires a minimum of 5 entries for quality.',
  },
  {
    icon: <HiCloud className="w-6 h-6" />,
    title: 'Automatic Cloud Backup',
    description:
      'Your journal automatically syncs across all your devices when online. Never lose your thoughts—everything is backed up securely.',
  },
]

export function Features() {
  const sectionRef = useSectionTracking('features')

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything you need to journal your reading
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Bookfelt combines the intimacy of a personal journal with powerful
            features designed specifically for readers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
