import { map, shareReplay } from "rxjs";
import type { Observable } from "rxjs";
import { database, BookModel, SettingModel } from "@bookfelt/database";
import { Q } from "@nozbe/watermelondb";
import type { Book, LibraryBook, ReadingStatus } from "@/features/books/types/book";
import {
  bookModelToLibraryBook,
  bookToCreateRaw,
  bookUpdatesToRaw,
} from "@/features/books/converters/book.converter";
import { deleteAudioFiles } from "@/lib/audio-sync";

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
    await setting.update((record) => {
      record.value = value;
    });
  } else if (value) {
    await settingsCollection.create((record: SettingModel) => {
      record.key = "primary_read_id";
      record.value = value;
    });
  }
}

// ── Observables ─────────────────────────────────────────────────

export const books$: Observable<LibraryBook[]> = booksCollection
  .query()
  .observeWithColumns(["status", "title", "cover_url", "first_impression", "final_thought", "exit_note", "summary", "first_impression_audio_uri", "final_thought_audio_uri", "exit_note_audio_uri"])
  .pipe(
    map((records) => records.map(bookModelToLibraryBook)),
    shareReplay(1),
  );

export const primaryReadId$: Observable<string | null> = settingsCollection
  .query(Q.where("key", "primary_read_id"))
  .observeWithColumns(["value"])
  .pipe(
    map((records) => records[0]?.value ?? null),
    shareReplay(1),
  );

// ── Reads ────────────────────────────────────────────────────────

export async function fetchBook(bookId: string): Promise<LibraryBook | null> {
  try {
    const record = await booksCollection.find(bookId);
    return bookModelToLibraryBook(record);
  } catch {
    return null;
  }
}

// ── Writes ───────────────────────────────────────────────────────

export async function addBook(
  book: Book,
  status: ReadingStatus,
): Promise<string | null> {
  try {
    const existing = await booksCollection
      .query(Q.where("original_id", book.id))
      .fetch();
    if (existing.length > 0) return existing[0].id;

    return await database.write(async () => {
      const readingBooks = await booksCollection
        .query(Q.where("status", "reading"))
        .fetch();
      const currentPrimary = await getPrimaryReadSetting();
      const hasPrimary = !!currentPrimary?.value;
      const shouldSetPrimary = readingBooks.length === 0 && !hasPrimary;

      const fields = bookToCreateRaw(book, status);
      const created = await booksCollection.create((record: BookModel) => {
        Object.assign(record._raw, fields);
      });

      if (shouldSetPrimary) {
        await upsertPrimaryRead(created.id);
      }

      return created.id;
    });
  } catch (error) {
    console.error("addBook failed:", error);
    return null;
  }
}

export async function removeBook(bookId: string): Promise<void> {
  try {
    const record = await booksCollection.find(bookId);
    const entries = await record.entries.fetch();

    const allUris: (string | null)[] = [
      record.firstImpressionAudioUri,
      record.finalThoughtAudioUri,
      record.exitNoteAudioUri,
      ...entries.map((e: any) => e.reflectionUri as string | null),
    ];
    await deleteAudioFiles(allUris);

    await database.write(async () => {
      const freshRecord = await booksCollection.find(bookId);
      const primarySetting = await getPrimaryReadSetting();
      const isPrimary = primarySetting?.value === bookId;

      const freshEntries = await freshRecord.entries.fetch();
      for (const entry of freshEntries) {
        await entry.markAsDeleted();
      }
      await freshRecord.markAsDeleted();

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
      await record.update((rec) => {
        // Use decorated property setters to trigger change tracking
        if ("title" in updates) rec.title = updates.title!;
        if ("authors" in updates) rec.authors = updates.authors!;
        if ("description" in updates) rec.description = updates.description ?? null;
        if ("pageCount" in updates) rec.pageCount = updates.pageCount ?? null;
        if ("coverUrl" in updates) rec.coverUrl = updates.coverUrl ?? null;
        if ("isbn" in updates) rec.isbn = updates.isbn ?? null;
        if ("publisher" in updates) rec.publisher = updates.publisher ?? null;
        if ("publishedDate" in updates) rec.publishedDate = updates.publishedDate ?? null;
        if ("firstImpression" in updates) rec.firstImpression = updates.firstImpression ?? null;
        if ("finalThought" in updates) rec.finalThought = updates.finalThought ?? null;
        if ("exitNote" in updates) rec.exitNote = updates.exitNote ?? null;
        if ("summary" in updates) rec.summary = updates.summary ?? null;
        if ("firstImpressionAudioUri" in updates) rec.firstImpressionAudioUri = updates.firstImpressionAudioUri ?? null;
        if ("finalThoughtAudioUri" in updates) rec.finalThoughtAudioUri = updates.finalThoughtAudioUri ?? null;
        if ("exitNoteAudioUri" in updates) rec.exitNoteAudioUri = updates.exitNoteAudioUri ?? null;
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

// ── Onboarding ──────────────────────────────────────────────────

const ONBOARDING_KEY = "onboarding_step";

export async function getOnboardingStep(): Promise<number> {
  const settings = await settingsCollection
    .query(Q.where("key", ONBOARDING_KEY))
    .fetch();
  const value = settings[0]?.value;
  return value ? parseInt(value, 10) : 0;
}

export async function setOnboardingStep(step: number): Promise<void> {
  try {
    await database.write(async () => {
      const settings = await settingsCollection
        .query(Q.where("key", ONBOARDING_KEY))
        .fetch();
      const existing = settings[0];
      if (existing) {
        await existing.update((record) => {
          record.value = String(step);
        });
      } else {
        await settingsCollection.create((record: SettingModel) => {
          record.key = ONBOARDING_KEY;
          record.value = String(step);
        });
      }
    });
  } catch (error) {
    console.error("setOnboardingStep failed:", error);
  }
}

export const onboardingStep$: Observable<number> = settingsCollection
  .query(Q.where("key", ONBOARDING_KEY))
  .observeWithColumns(["value"])
  .pipe(
    map((records) => {
      const value = records[0]?.value;
      return value ? parseInt(value, 10) : 0;
    }),
    shareReplay(1),
  );
