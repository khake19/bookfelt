import { database, BookModel, SettingModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";
import type { Book, LibraryBook, ReadingStatus } from "../types/book";
import {
  bookModelToLibraryBook,
  bookToCreateRaw,
  bookUpdatesToRaw,
} from "../converters/book.converter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRecord = any;

const booksCollection = database.get<BookModel>("books");
const settingsCollection = database.get<SettingModel>("settings");

// ── Private helpers ──────────────────────────────────────────────

async function getPrimaryReadSetting(): Promise<SettingModel | null> {
  const settings = await settingsCollection
    .query(Q.where("key", "primary_read_id"))
    .fetch();
  return settings[0] ?? null;
}

async function upsertPrimaryRead(value: string | null): Promise<void> {
  const setting = await getPrimaryReadSetting();
  if (setting) {
    await setting.update(() => {
      const raw: RawRecord = setting._raw;
      raw.value = value;
    });
  } else if (value) {
    await settingsCollection.create((record: SettingModel) => {
      const raw: RawRecord = record._raw;
      raw.key = "primary_read_id";
      raw.value = value;
    });
  }
}

// ── Reads ────────────────────────────────────────────────────────

export async function fetchAllBooks(): Promise<LibraryBook[]> {
  const records = await booksCollection.query().fetch();
  return records.map(bookModelToLibraryBook);
}

export function subscribeToBooksCollection(cb: () => void): () => void {
  return booksCollection.experimentalSubscribe(cb);
}

export async function fetchPrimaryReadId(): Promise<string | null> {
  const records = await settingsCollection
    .query(Q.where("key", "primary_read_id"))
    .fetch();
  return records[0]?.value ?? null;
}

export function subscribeToSettings(cb: () => void): () => void {
  return settingsCollection.experimentalSubscribe(cb);
}

// ── Writes ───────────────────────────────────────────────────────

export async function addBook(
  book: Book,
  status: ReadingStatus,
): Promise<void> {
  try {
    const existing = await booksCollection.find(book.id).catch(() => null);
    if (existing) return;

    await database.write(async () => {
      const readingBooks = await booksCollection
        .query(Q.where("status", "reading"))
        .fetch();
      const currentPrimary = await getPrimaryReadSetting();
      const hasPrimary = !!currentPrimary?.value;
      const shouldSetPrimary = readingBooks.length === 0 && !hasPrimary;

      const fields = bookToCreateRaw(book, status);
      await booksCollection.create((record: BookModel) => {
        Object.assign(record._raw, fields);
      });

      if (shouldSetPrimary) {
        await upsertPrimaryRead(book.id);
      }
    });
  } catch (error) {
    console.error("addBook failed:", error);
  }
}

export async function removeBook(bookId: string): Promise<void> {
  try {
    await database.write(async () => {
      const record = await booksCollection.find(bookId);
      const primarySetting = await getPrimaryReadSetting();
      const isPrimary = primarySetting?.value === bookId;

      await record.markAsDeleted();

      if (isPrimary) {
        const nextReading = await booksCollection
          .query(Q.where("status", "reading"))
          .fetch();
        await upsertPrimaryRead(nextReading[0]?.id ?? null);
      }
    });
  } catch (error) {
    console.error("removeBook failed:", error);
  }
}

export async function updateBookStatus(
  bookId: string,
  status: ReadingStatus,
): Promise<void> {
  try {
    await database.write(async () => {
      const record = await booksCollection.find(bookId);
      await record.update(() => {
        const raw: RawRecord = record._raw;
        raw.status = status;
      });

      const primarySetting = await getPrimaryReadSetting();
      const currentPrimary = primarySetting?.value ?? null;

      if (status === "reading") {
        if (!currentPrimary) {
          await upsertPrimaryRead(bookId);
        }
      } else if (
        (status === "finished" || status === "paused" || status === "dnf") &&
        currentPrimary === bookId
      ) {
        const nextReading = await booksCollection
          .query(
            Q.where("status", "reading"),
            Q.where("id", Q.notEq(bookId)),
          )
          .fetch();
        await upsertPrimaryRead(nextReading[0]?.id ?? null);
      }
    });
  } catch (error) {
    console.error("updateStatus failed:", error);
  }
}

export async function updateBook(
  bookId: string,
  updates: Partial<LibraryBook>,
): Promise<void> {
  try {
    await database.write(async () => {
      const record = await booksCollection.find(bookId);
      const fields = bookUpdatesToRaw(updates);
      await record.update(() => {
        Object.assign(record._raw, fields);
      });
    });
  } catch (error) {
    console.error("updateBook failed:", error);
  }
}

export async function setPrimaryRead(bookId: string): Promise<void> {
  try {
    await database.write(async () => {
      await upsertPrimaryRead(bookId);
    });
  } catch (error) {
    console.error("setPrimaryRead failed:", error);
  }
}
