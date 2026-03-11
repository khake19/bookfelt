import type { EntryModel } from "@bookfelt/database";
import type { Entry } from "../types/entry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRecord = any;

export interface EntryRawFields {
  original_id: string;
  book_id: string;
  book_title: string;
  chapter: string | null;
  page: string | null;
  percent: string | null;
  snippet: string | null;
  feeling: string | null;
  reflection: string | null;
  audio_uri: string | null;
  date: number;
  entry_created_at: number;
}

export function entryModelToEntry(record: EntryModel): Entry {
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

export function entryToCreateRaw(
  entry: Omit<Entry, "id" | "createdAt">,
  generatedId: string,
): EntryRawFields {
  return {
    original_id: generatedId,
    book_id: entry.bookId,
    book_title: entry.bookTitle,
    chapter: entry.chapter ?? null,
    page: entry.page ?? null,
    percent: entry.percent ?? null,
    snippet: entry.snippet ?? null,
    feeling: entry.feeling ?? null,
    reflection: entry.reflection ?? null,
    audio_uri: entry.audioUri ?? null,
    date: entry.date,
    entry_created_at: Date.now(),
  };
}

export function entryUpdatesToRaw(
  updates: Partial<Entry>,
): Partial<Record<string, unknown>> {
  const raw: Record<string, unknown> = {};
  if (updates.bookId !== undefined) raw.book_id = updates.bookId;
  if (updates.bookTitle !== undefined) raw.book_title = updates.bookTitle;
  if (updates.chapter !== undefined) raw.chapter = updates.chapter ?? null;
  if (updates.page !== undefined) raw.page = updates.page ?? null;
  if (updates.percent !== undefined) raw.percent = updates.percent ?? null;
  if (updates.snippet !== undefined) raw.snippet = updates.snippet ?? null;
  if (updates.feeling !== undefined) raw.feeling = updates.feeling ?? null;
  if (updates.reflection !== undefined)
    raw.reflection = updates.reflection ?? null;
  if (updates.audioUri !== undefined) raw.audio_uri = updates.audioUri ?? null;
  if (updates.date !== undefined) raw.date = updates.date;
  return raw;
}
