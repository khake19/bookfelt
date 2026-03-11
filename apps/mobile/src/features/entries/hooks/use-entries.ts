import { useState, useEffect, useCallback, useMemo } from "react";
import { database, EntryModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";
import type { Entry } from "../types/entry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRecord = any;

function toEntry(record: EntryModel): Entry {
  return {
    id: record.id,
    bookId: record.bookId,
    bookTitle: record.bookTitle,
    chapter: record.chapter ?? undefined,
    page: record.page ?? undefined,
    percent: record.percent ?? undefined,
    snippet: record.snippet ?? undefined,
    feeling: record.feeling ?? undefined,
    reflection: record.reflection ?? undefined,
    audioUri: record.audioUri ?? undefined,
    date: record.date,
    createdAt: record.entryCreatedAt,
  };
}

const entriesCollection = database.get<EntryModel>("entries");

export function useEntries(bookId?: string) {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const fetchEntries = () => {
      const query = bookId
        ? entriesCollection.query(Q.where("book_id", bookId))
        : entriesCollection.query();

      query.fetch().then((records) => setEntries(records.map(toEntry)));
    };
    fetchEntries();
    const unsubscribe = entriesCollection.experimentalSubscribe(fetchEntries);
    return unsubscribe;
  }, [bookId]);

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) => b.date - a.date || b.createdAt - a.createdAt,
      ),
    [entries],
  );

  const addEntry = useCallback(
    async (entry: Omit<Entry, "id" | "createdAt">) => {
      try {
        await database.write(async () => {
          await entriesCollection.create((record: EntryModel) => {
            const raw: RawRecord = record._raw;
            raw.original_id = record.id;
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
            raw.entry_created_at = Date.now();
          });
        });
      } catch (error) {
        console.error("addEntry failed:", error);
      }
    },
    [],
  );

  const removeEntry = useCallback(async (entryId: string) => {
    try {
      await database.write(async () => {
        const record = await entriesCollection.find(entryId);
        await record.markAsDeleted();
      });
    } catch (error) {
      console.error("removeEntry failed:", error);
    }
  }, []);

  const updateEntry = useCallback(
    async (entryId: string, updates: Partial<Entry>) => {
      try {
        await database.write(async () => {
          const record = await entriesCollection.find(entryId);
          await record.update(() => {
            const raw: RawRecord = record._raw;
            if (updates.bookId !== undefined) raw.book_id = updates.bookId;
            if (updates.bookTitle !== undefined)
              raw.book_title = updates.bookTitle;
            if (updates.chapter !== undefined)
              raw.chapter = updates.chapter ?? null;
            if (updates.page !== undefined) raw.page = updates.page ?? null;
            if (updates.percent !== undefined)
              raw.percent = updates.percent ?? null;
            if (updates.snippet !== undefined)
              raw.snippet = updates.snippet ?? null;
            if (updates.feeling !== undefined)
              raw.feeling = updates.feeling ?? null;
            if (updates.reflection !== undefined)
              raw.reflection = updates.reflection ?? null;
            if (updates.audioUri !== undefined)
              raw.audio_uri = updates.audioUri ?? null;
            if (updates.date !== undefined) raw.date = updates.date;
          });
        });
      } catch (error) {
        console.error("updateEntry failed:", error);
      }
    },
    [],
  );

  return { entries: sorted, addEntry, removeEntry, updateEntry };
}
