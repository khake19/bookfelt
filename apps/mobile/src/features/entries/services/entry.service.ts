import { database, EntryModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";
import type { Entry } from "../types/entry";
import {
  entryModelToEntry,
  entryToCreateRaw,
  entryUpdatesToRaw,
} from "../converters/entry.converter";

const entriesCollection = database.get<EntryModel>("entries");

// ── Reads ────────────────────────────────────────────────────────

export async function fetchEntries(bookId?: string): Promise<Entry[]> {
  const query = bookId
    ? entriesCollection.query(Q.where("book_id", bookId))
    : entriesCollection.query();

  const records = await query.fetch();
  return records.map(entryModelToEntry);
}

export function subscribeToEntries(cb: () => void): () => void {
  return entriesCollection.experimentalSubscribe(cb);
}

// ── Writes ───────────────────────────────────────────────────────

export async function addEntry(
  entry: Omit<Entry, "id" | "createdAt">,
): Promise<void> {
  try {
    await database.write(async () => {
      await entriesCollection.create((record: EntryModel) => {
        const fields = entryToCreateRaw(entry, record.id);
        Object.assign(record._raw, fields);
      });
    });
  } catch (error) {
    console.error("addEntry failed:", error);
  }
}

export async function removeEntry(entryId: string): Promise<void> {
  try {
    await database.write(async () => {
      const record = await entriesCollection.find(entryId);
      await record.markAsDeleted();
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
