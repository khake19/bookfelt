import { createHttpClient } from "../http/client";

// --- Types ---

export interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  pageCount?: number;
  imageLinks?: { smallThumbnail?: string; thumbnail?: string };
  industryIdentifiers?: Array<{ type: string; identifier: string }>;
  publisher?: string;
  publishedDate?: string;
}

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}

export interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

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

// --- Client ---

const googleBooksClient = createHttpClient({
  baseURL: "https://www.googleapis.com/books/v1",
  timeout: 10_000,
});

// --- Converter ---

function toGoogleBook(volume: GoogleBooksVolume): GoogleBook {
  const info = volume.volumeInfo;
  const isbn =
    info.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier ??
    info.industryIdentifiers?.[0]?.identifier;

  const rawCover =
    info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
  const coverUrl = rawCover?.replace("http://", "https://");

  return {
    id: volume.id,
    title: info.title,
    authors: info.authors ?? ["Unknown author"],
    description: info.description,
    pageCount: info.pageCount,
    coverUrl,
    isbn,
    publisher: info.publisher,
    publishedDate: info.publishedDate,
  };
}

// --- API ---

const MAX_RESULTS = 15;

export async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  if (!query.trim()) return [];

  const { data } = await googleBooksClient.get<GoogleBooksResponse>(
    "/volumes",
    {
      params: {
        q: query,
        maxResults: MAX_RESULTS,
        printType: "books",
      },
    },
  );

  if (!data.items) return [];
  return data.items.map(toGoogleBook);
}
