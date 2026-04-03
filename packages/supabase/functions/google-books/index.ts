import { createClient } from "jsr:@supabase/supabase-js@2";

// --- Types ---

interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  pageCount?: number;
  imageLinks?: { smallThumbnail?: string; thumbnail?: string };
  industryIdentifiers?: Array<{ type: string; identifier: string }>;
  publisher?: string;
  publishedDate?: string;
}

interface GoogleBooksVolume {
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}

interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

interface GoogleBook {
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

interface RequestBody {
  query?: string;
  isbn?: string;
  orderBy?: "relevance" | "newest";
}

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

// --- Helper ---

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- Handler ---

const MAX_RESULTS = 15;

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse("Missing Authorization header", 401);
  }

  // Extract JWT from "Bearer <token>"
  const jwt = authHeader.replace("Bearer ", "");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(jwt);

  if (authError || !user) {
    return errorResponse("Unauthorized", 401);
  }

  // Parse request
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const apiKey = Deno.env.get("GOOGLE_BOOKS_API_KEY");
  if (!apiKey) {
    return errorResponse("Google Books API key not configured", 500);
  }

  // ISBN search
  if (body.isbn) {
    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", `isbn:${body.isbn}`);
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("printType", "books");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      return errorResponse("Google Books API request failed", response.status);
    }

    const data: GoogleBooksResponse = await response.json();
    if (!data.items?.length) {
      return new Response(JSON.stringify(null), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const book = toGoogleBook(data.items[0]);
    // Fallback to OpenLibrary if no cover
    if (!book.coverUrl) {
      book.coverUrl = `https://covers.openlibrary.org/b/isbn/${body.isbn}-L.jpg`;
    }

    return new Response(JSON.stringify(book), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Text search
  if (body.query) {
    const trimmed = body.query.trim();
    if (!trimmed) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL("https://www.googleapis.com/books/v1/volumes");
    url.searchParams.set("q", trimmed);
    url.searchParams.set("maxResults", MAX_RESULTS.toString());
    url.searchParams.set("printType", "books");
    if (body.orderBy) {
      url.searchParams.set("orderBy", body.orderBy);
    }
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      return errorResponse("Google Books API request failed", response.status);
    }

    const data: GoogleBooksResponse = await response.json();
    const books = data.items ? data.items.map(toGoogleBook) : [];

    return new Response(JSON.stringify(books), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return errorResponse("Either 'query' or 'isbn' must be provided", 400);
});
