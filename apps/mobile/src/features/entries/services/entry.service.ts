import { database, EntryModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";
import type { Observable } from "rxjs";
import { map } from "rxjs";
import { deleteAudioFiles } from "@/lib/audio-sync";
import {
  entryModelToEntry
} from "@/features/entries/converters/entry.converter";
import type { Entry } from "@/features/entries/types/entry";
import { AnalyticsEvents } from "@bookfelt/core";
import { getAnalytics } from "@/services/posthog";

const entriesCollection = database.get<EntryModel>("entries");

// ── Reads ────────────────────────────────────────────────────────

export function observeRecentEntries(limit: number): Observable<Entry[]> {
  return entriesCollection
    .query(
      Q.sortBy("date", Q.desc),
      Q.sortBy("entry_created_at", Q.desc),
      Q.take(limit),
    )
    .observeWithColumns(["updated_at"])
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
    .observeWithColumns(["updated_at"])
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
        // Mark for transcription if audio exists but no transcription yet
        rec.needsTranscription = !!entry.reflectionUri && !entry.reflection;
      });
    });

    // Track analytics
    getAnalytics().track(
      AnalyticsEvents.entryCreated(
        record.id,
        entry.bookId,
        entry.bookTitle,
        !!entry.reflectionUri,
        !!entry.emotionId,
        !!entry.snippet,
        !!entry.reflection,
        !!entry.setting
      )
    );

    return record.id;
  } catch (error) {
    console.error("addEntry failed:", error);
    return null;
  }
}

export async function removeEntry(entryId: string): Promise<void> {
  try {
    const record = await entriesCollection.find(entryId);

    // Track analytics before deletion
    getAnalytics().track(
      AnalyticsEvents.entryRemoved(record.id, record.bookId, !!record.reflectionUri)
    );

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
      const hadAudio = !!record.reflectionUri;

      await record.update((rec) => {
        // Use decorated property setters to trigger change tracking
        if ("bookId" in updates && updates.bookId) rec.bookId = updates.bookId;
        if ("bookTitle" in updates && updates.bookTitle)
          rec.bookTitle = updates.bookTitle;
        if ("chapter" in updates) rec.chapter = updates.chapter ?? null;
        if ("page" in updates) rec.page = updates.page ?? null;
        if ("percent" in updates) rec.percent = updates.percent ?? null;
        if ("snippet" in updates) rec.snippet = updates.snippet ?? null;
        if ("emotionId" in updates) rec.emotionId = updates.emotionId ?? null;
        if ("reflection" in updates)
          rec.reflection = updates.reflection ?? null;
        if ("reflectionUri" in updates)
          rec.reflectionUri = updates.reflectionUri ?? null;
        if ("setting" in updates) rec.setting = updates.setting ?? null;
        if ("date" in updates && updates.date) rec.date = updates.date;
        if ("needsTranscription" in updates)
          rec.needsTranscription = updates.needsTranscription ?? false;
      });

      // Track analytics
      getAnalytics().track(
        AnalyticsEvents.entryUpdated(
          record.id,
          record.bookId,
          Object.keys(updates),
          !hadAudio && !!record.reflectionUri,
          hadAudio && !record.reflectionUri
        )
      );
    });
  } catch (error) {
    console.error("updateEntry failed:", error);
  }
}
