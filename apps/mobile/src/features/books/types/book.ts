export interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  pageCount?: number;
  coverUrl?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  source: "google" | "manual";
}

export type ReadingStatus = "reading" | "want-to-read" | "finished";

export interface LibraryBook extends Book {
  status: ReadingStatus;
  addedAt: number;
}
