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
    .observeWithColumns(['updated_at'])
    .pipe(map((records) => records.map(entryModelToEntry)));
}

export function observeEntries(bookId?: string): Observable<Entry[]> {
  const query = bookId
    ? entriesCollection.query(
        Q.where("book_id", bookId),
        Q.sortBy("date", Q.desc),
        Q.sortBy("entry_created_at", Q.desc),
      )
    : entriesCollection.query(
        Q.sortBy("date", Q.desc),
        Q.sortBy("entry_created_at", Q.desc),
      );

  return query
    .observeWithColumns(['updated_at'])
    .pipe(map((records) => records.map(entryModelToEntry)));
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
      return entriesCollection.create((rec: EntryModel) => {
        rec.originalId = rec.id;
        rec.bookId = entry.bookId;
        rec.bookTitle = entry.bookTitle;
        rec.chapter = entry.chapter ?? null;
        rec.page = entry.page ?? null;
        rec.percent = entry.percent ?? null;
        rec.snippet = entry.snippet ?? null;
        rec.emotionId = entry.emotionId ?? null;
        rec.reflection = entry.reflection ?? null;
        rec.reflectionUri = entry.reflectionUri ?? null;
        rec.setting = entry.setting ?? null;
        rec.date = entry.date;
        rec.entryCreatedAt = Date.now();
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
      await record.update((rec) => {
        if (updates.bookId !== undefined) rec.bookId = updates.bookId;
        if (updates.bookTitle !== undefined) rec.bookTitle = updates.bookTitle;
        if (updates.chapter !== undefined) rec.chapter = updates.chapter ?? null;
        if (updates.page !== undefined) rec.page = updates.page ?? null;
        if (updates.percent !== undefined) rec.percent = updates.percent ?? null;
        if (updates.snippet !== undefined) rec.snippet = updates.snippet ?? null;
        if (updates.emotionId !== undefined) rec.emotionId = updates.emotionId ?? null;
        if (updates.reflection !== undefined) rec.reflection = updates.reflection ?? null;
        if (updates.reflectionUri !== undefined) rec.reflectionUri = updates.reflectionUri ?? null;
        if (updates.setting !== undefined) rec.setting = updates.setting ?? null;
        if (updates.date !== undefined) rec.date = updates.date;
      });
    });
  } catch (error) {
    console.error("updateEntry failed:", error);
  }
}
