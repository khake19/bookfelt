import { callEdgeFunction } from "@/lib/edge-functions";

// --- Types ---

export interface GoogleBook {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  pageCount?: number;
  coverUrl?: string;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
}

// --- API ---

export async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  if (!query.trim()) return [];

  return callEdgeFunction<GoogleBook[]>({
    functionName: "google-books",
    body: { query },
  });
}

export async function searchGoogleBooksByIsbn(
  isbn: string,
): Promise<GoogleBook | null> {
  return callEdgeFunction<GoogleBook | null>({
    functionName: "google-books",
    body: { isbn },
  });
}
