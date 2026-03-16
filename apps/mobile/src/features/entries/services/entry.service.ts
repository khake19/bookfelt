import { map } from "rxjs";
import type { Observable } from "rxjs";
import { database, EntryModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";
import type { Entry } from "../types/entry";
import {
  entryModelToEntry,
  entryToCreateRaw,
  entryUpdatesToRaw,
} from "../converters/entry.converter";
import { deleteAudioFiles } from "../../../lib/audio-sync";

const entriesCollection = database.get<EntryModel>("entries");

// ── Reads ────────────────────────────────────────────────────────

export function observeRecentEntries(limit: number): Observable<Entry[]> {
  return entriesCollection
    .query(
      Q.sortBy("date", Q.desc),
      Q.sortBy("entry_created_at", Q.desc),
      Q.take(limit),
    )
    .observe()
    .pipe(map((records) => records.map(entryModelToEntry)));
}

export function observeEntries(bookId?: string): Observable<Entry[]> {
  const query = bookId
    ? entriesCollection.query(Q.where("book_id", bookId))
    : entriesCollection.query();

  return query.observe().pipe(map((records) => records.map(entryModelToEntry)));
}

export async function fetchEntries(bookId: string): Promise<Entry[]> {
  const records = await entriesCollection
    .query(Q.where("book_id", bookId))
    .fetch();
  return records.map(entryModelToEntry);
}

// ── Writes ───────────────────────────────────────────────────────

export async function addEntry(
  entry: Omit<Entry, "id" | "createdAt">,
): Promise<string | null> {
  try {
    const record = await database.write(async () => {
      return entriesCollection.create((record: EntryModel) => {
        const fields = entryToCreateRaw(entry, record.id);
        Object.assign(record._raw, fields);
      });
    });
    return record.id;
  } catch (error) {
    console.error("addEntry failed:", error);
    return null;
  }
}

export async function removeEntry(entryId: string): Promise<void> {
  try {
    const record = await entriesCollection.find(entryId);
    await deleteAudioFiles([record.reflectionUri]);

    await database.write(async () => {
      const fresh = await entriesCollection.find(entryId);
      await fresh.markAsDeleted();
    });
  } catch (error) {
    console.error("removeEntry failed:", error);
  }
}

export async function updateEntry(
  entryId: string,
  updates: Partial<Entry>,
): Promise<void> {
  try {
    await database.write(async () => {
      const record = await entriesCollection.find(entryId);
      const fields = entryUpdatesToRaw(updates);
      await record.update(() => {
        Object.assign(record._raw, fields);
      });
    });
  } catch (error) {
    console.error("updateEntry failed:", error);
  }
}
