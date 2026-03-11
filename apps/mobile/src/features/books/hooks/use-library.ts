import { useState, useEffect, useCallback, useMemo } from "react";
import { database, BookModel, SettingModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";
import type { Book, LibraryBook, ReadingStatus } from "../types/book";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRecord = any;

function toLibraryBook(record: BookModel): LibraryBook {
  return {
    id: record.id,
    title: record.title,
    authors: record.authors,
    description: record.description ?? undefined,
    pageCount: record.pageCount ?? undefined,
    coverUrl: record.coverUrl ?? undefined,
    isbn: record.isbn ?? undefined,
    publisher: record.publisher ?? undefined,
    publishedDate: record.publishedDate ?? undefined,
    source: record.source,
    status: record.status as ReadingStatus,
    addedAt: record.addedAt,
    firstImpression: record.firstImpression ?? undefined,
    finalThought: record.finalThought ?? undefined,
    exitNote: record.exitNote ?? undefined,
    summary: record.summary ?? undefined,
  };
}

const booksCollection = database.get<BookModel>("books");
const settingsCollection = database.get<SettingModel>("settings");

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

export function useLibrary() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [primaryReadId, setPrimaryReadIdState] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = () => {
      booksCollection
        .query()
        .fetch()
        .then((records) => setBooks(records.map(toLibraryBook)));
    };
    fetchBooks();
    const unsubscribe = booksCollection.experimentalSubscribe(fetchBooks);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchPrimary = () => {
      settingsCollection
        .query(Q.where("key", "primary_read_id"))
        .fetch()
        .then((records) => setPrimaryReadIdState(records[0]?.value ?? null));
    };
    fetchPrimary();
    const unsubscribe = settingsCollection.experimentalSubscribe(fetchPrimary);
    return unsubscribe;
  }, []);

  const primaryRead = useMemo(
    () => books.find((b) => b.id === primaryReadId),
    [books, primaryReadId],
  );

  const addBook = useCallback(async (book: Book, status: ReadingStatus) => {
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

        await booksCollection.create((record: BookModel) => {
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
          raw.status = status;
          raw.added_at = Date.now();
        });

        if (shouldSetPrimary) {
          await upsertPrimaryRead(book.id);
        }
      });
    } catch (error) {
      console.error("addBook failed:", error);
    }
  }, []);

  const removeBook = useCallback(async (bookId: string) => {
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
  }, []);

  const updateStatus = useCallback(
    async (bookId: string, status: ReadingStatus) => {
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
            (status === "finished" ||
              status === "paused" ||
              status === "dnf") &&
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
    },
    [],
  );

  const updateBook = useCallback(
    async (bookId: string, updates: Partial<LibraryBook>) => {
      try {
        await database.write(async () => {
          const record = await booksCollection.find(bookId);
          await record.update(() => {
            const raw: RawRecord = record._raw;
            if (updates.title !== undefined) raw.title = updates.title;
            if (updates.authors !== undefined)
              raw.authors_json = JSON.stringify(updates.authors);
            if (updates.description !== undefined)
              raw.description = updates.description ?? null;
            if (updates.pageCount !== undefined)
              raw.page_count = updates.pageCount ?? null;
            if (updates.coverUrl !== undefined)
              raw.cover_url = updates.coverUrl ?? null;
            if (updates.isbn !== undefined) raw.isbn = updates.isbn ?? null;
            if (updates.publisher !== undefined)
              raw.publisher = updates.publisher ?? null;
            if (updates.publishedDate !== undefined)
              raw.published_date = updates.publishedDate ?? null;
            if (updates.firstImpression !== undefined)
              raw.first_impression = updates.firstImpression ?? null;
            if (updates.finalThought !== undefined)
              raw.final_thought = updates.finalThought ?? null;
            if (updates.exitNote !== undefined)
              raw.exit_note = updates.exitNote ?? null;
            if (updates.summary !== undefined)
              raw.summary = updates.summary ?? null;
          });
        });
      } catch (error) {
        console.error("updateBook failed:", error);
      }
    },
    [],
  );

  const setPrimaryRead = useCallback(async (bookId: string) => {
    try {
      await database.write(async () => {
        await upsertPrimaryRead(bookId);
      });
    } catch (error) {
      console.error("setPrimaryRead failed:", error);
    }
  }, []);

  const isInLibrary = useCallback(
    (bookId: string) => books.some((b) => b.id === bookId),
    [books],
  );

  return {
    books,
    primaryRead,
    addBook,
    removeBook,
    updateStatus,
    updateBook,
    setPrimaryRead,
    isInLibrary,
  };
}
