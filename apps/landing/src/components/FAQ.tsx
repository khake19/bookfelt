'use client'

import { useState } from 'react'
import { HiChevronDown } from 'react-icons/hi'
import { trackEvent } from '@/lib/posthog'
import { useSectionTracking } from '@/hooks/useSectionTracking'

const faqs = [
  {
    question: 'Does Bookfelt work offline?',
    answer:
      "Yes! Bookfelt works completely offline. Your entire reading journal is stored on your device, so you can write entries anytime, anywhere—even on flights or in areas without internet. When you're back online, everything automatically syncs to the cloud and across your devices.",
  },
  {
    question: 'Is Bookfelt free?',
    answer:
      'Yes! Bookfelt has a free tier that includes 15 audio transcriptions, 3 bookends, and 1 AI summary per book. Premium ($3.99/month or $29.99/year) unlocks unlimited transcriptions, bookends, and summaries, plus cloud sync for audio files.',
  },
  {
    question: 'How does audio transcription work?',
    answer:
      'Bookfelt uses OpenAI Whisper to transcribe your voice reflections into text. Simply tap the microphone icon while creating an entry, record your thoughts, and the app will automatically transcribe them for you. Note: Transcription requires internet connection. Free users get 15 transcriptions total, while Premium users get unlimited.',
  },
  {
    question: 'What are bookends?',
    answer:
      'Bookends are three special moments in your reading journey: First Impression (when you start a book), Final Thought (when you finish), and Exit Note (if you decide not to finish). They help you capture the beginning and end of your experience with each book. Free users can create 3 bookends total across all books, while Premium users have unlimited.',
  },
  {
    question: 'How does cloud sync work?',
    answer:
      'Your journal automatically syncs to the cloud when you have an internet connection. This means your entries are safely backed up and available across all your devices. Everything is encrypted and stored securely via Supabase. You never have to think about it—it just works.',
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Your journal is stored locally on your device and automatically backed up to secure, encrypted cloud storage when online. AI summaries are generated server-side but we never store or train on your personal content. See our Privacy Policy for full details.',
  },
]

export function FAQ() {
  const sectionRef = useSectionTracking('faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    const isOpening = openIndex !== index
    if (isOpening) {
      trackEvent('faq_item_clicked', {
        question: faqs[index].question,
        index,
      })
    }
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Everything you need to know about Bookfelt
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden bg-card"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <h3 className="text-lg font-semibold text-foreground pr-8">
                  {faq.question}
                </h3>
                <HiChevronDown
                  className={`w-5 h-5 text-muted flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-muted leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
