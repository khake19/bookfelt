import type { EntryCardData } from "@/features/entries/components/EntryCard";

export const MOCK_ENTRIES: EntryCardData[] = [
  {
    id: "bf-1",
    bookId: "mock-book-1",
    title: "The Three-Body Problem",
    author: "Liu Cixin",
    chapter: "Chapter 12",
    date: "2 days ago",
    dateTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    snippet:
      "No, emptiness is not nothingness. Emptiness is a type of existence. You must use this existential emptiness to fill yourself.",
    reaction: "This hit hard. The idea that emptiness is still something...",
    // emotionId: "mock-emotion-id", // Note: Would need real UUID in production
  },
  {
    id: "bf-2",
    bookId: "mock-book-2",
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    chapter: "Chapter 6",
    date: "4 days ago",
    dateTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    snippet:
      "Death exists, not as the opposite but as a part of life.",
    reaction: "Murakami makes grief feel so quiet and ordinary.",
    // emotionId: "mock-emotion-id",
  },
  {
    id: "bf-3",
    bookId: "mock-book-3",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    chapter: "Chapter 2",
    date: "1 week ago",
    dateTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    snippet:
      "How do you cause people to believe in an imagined order? First, you never admit that the order is imagined.",
    reaction:
      "Makes me question every institution I take for granted. What else is just a shared story?",
    // emotionId: "mock-emotion-id",
  },
  {
    id: "bf-4",
    bookId: "mock-book-1",
    title: "The Three-Body Problem",
    author: "Liu Cixin",
    chapter: "Chapter 8",
    date: "1 week ago",
    dateTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    snippet:
      "The universe is a dark forest. Every civilization is an armed hunter stalking through the trees...",
    reaction: "The dark forest theory is terrifying but weirdly beautiful.",
    // emotionId: "mock-emotion-id",
  },
  {
    id: "bf-5",
    bookId: "mock-book-4",
    title: "When Breath Becomes Air",
    author: "Paul Kalanithi",
    chapter: "Part II",
    date: "2 weeks ago",
    dateTimestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
    snippet:
      "You can't ever reach perfection, but you can believe in an asymptote toward which you are ceaselessly striving.",
    reaction: "Reading this while healthy feels like a privilege I don't deserve.",
    // emotionId: "mock-emotion-id",
  },
];
