export interface Entry {
  id: string;
  bookId: string;
  bookTitle: string;
  chapter?: string;
  page?: string;
  percent?: string;
  snippet?: string;
  emotionId?: string;
  reflection?: string;
  reflectionUri?: string;
  setting?: string;
  date: number;
  createdAt: number;
  needsTranscription?: boolean;
}
