import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "@nozbe/watermelondb";
import type { BookModel } from "@bookfelt/database";
import type { EntryModel } from "@bookfelt/database";
import type { SettingModel } from "@bookfelt/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRecord = any;

const MIGRATION_FLAG = "wmdb_migration_complete";

interface ZustandPersistedLibrary {
  state: {
    books: Array<{
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
      status: string;
      addedAt: number;
      firstImpression?: string;
      finalThought?: string;
      exitNote?: string;
      summary?: string;
    }>;
    primaryReadId: string | null;
  };
}

interface ZustandPersistedEntries {
  state: {
    entries: Array<{
      id: string;
      bookId: string;
      bookTitle: string;
      chapter?: string;
      page?: string;
      percent?: string;
      snippet?: string;
      feeling?: string;
      reflection?: string;
      audioUri?: string;
      date: number;
      createdAt: number;
    }>;
  };
}

export async function migrateFromAsyncStorage(
  db: Database,
): Promise<void> {
  const done = await AsyncStorage.getItem(MIGRATION_FLAG);
  if (done === "true") return;

  const [libraryRaw, entriesRaw] = await Promise.all([
    AsyncStorage.getItem("bookfelt-library"),
    AsyncStorage.getItem("bookfelt-entries"),
  ]);

  if (!libraryRaw && !entriesRaw) {
    await AsyncStorage.setItem(MIGRATION_FLAG, "true");
    return;
  }

  const library: ZustandPersistedLibrary | null = libraryRaw
    ? JSON.parse(libraryRaw)
    : null;
  const entriesData: ZustandPersistedEntries | null = entriesRaw
    ? JSON.parse(entriesRaw)
    : null;

  const books = library?.state?.books ?? [];
  const entries = entriesData?.state?.entries ?? [];
  const primaryReadId = library?.state?.primaryReadId ?? null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const batchOps: any[] = [];

  await db.write(async () => {
    const booksCollection = db.get<BookModel>("books");
    const entriesCollection = db.get<EntryModel>("entries");
    const settingsCollection = db.get<SettingModel>("settings");

    for (const book of books) {
      batchOps.push(
        booksCollection.prepareCreate((record: BookModel) => {
          const raw: RawRecord = record._raw;
          raw.id = book.id;
          raw.original_id = book.id;
          raw.title = book.title;
          raw.authors_json = JSON.stringify(book.authors ?? []);
          raw.description = book.description ?? null;
          raw.page_count = book.pageCount ?? null;
          raw.cover_url = book.coverUrl ?? null;
          raw.isbn = book.isbn ?? null;
          raw.publisher = book.publisher ?? null;
          raw.published_date = book.publishedDate ?? null;
          raw.source = book.source;
          raw.status = book.status;
          raw.added_at = book.addedAt;
          raw.first_impression = book.firstImpression ?? null;
          raw.final_thought = book.finalThought ?? null;
          raw.exit_note = book.exitNote ?? null;
          raw.summary = book.summary ?? null;
        }),
      );
    }

    for (const entry of entries) {
      batchOps.push(
        entriesCollection.prepareCreate((record: EntryModel) => {
          const raw: RawRecord = record._raw;
          raw.id = entry.id;
          raw.original_id = entry.id;
          raw.book_id = entry.bookId;
          raw.book_title = entry.bookTitle;
          raw.chapter = entry.chapter ?? null;
          raw.page = entry.page ?? null;
          raw.percent = entry.percent ?? null;
          raw.snippet = entry.snippet ?? null;
          raw.feeling = entry.feeling ?? null;
          raw.reflection = entry.reflection ?? null;
          raw.audio_uri = entry.audioUri ?? null;
          raw.date = entry.date;
          raw.entry_created_at = entry.createdAt;
        }),
      );
    }

    if (primaryReadId) {
      batchOps.push(
        settingsCollection.prepareCreate((record: SettingModel) => {
          const raw: RawRecord = record._raw;
          raw.key = "primary_read_id";
          raw.value = primaryReadId;
        }),
      );
    }

    await db.batch(...batchOps);
  });

  await AsyncStorage.setItem(MIGRATION_FLAG, "true");
}
