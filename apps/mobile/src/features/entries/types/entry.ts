export interface Entry {
  id: string;
  bookId: string;
  bookTitle: string;
  chapter?: string;
  page?: string;
  percent?: string;
  snippet: string;
  feeling?: string;
  reflection?: string;
  date: number;
  createdAt: number;
}
