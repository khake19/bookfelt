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
  emotion_id: string | null;
  reflection: string | null;
  reflection_uri: string | null;
  setting: string | null;
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
    emotionId: record.emotionId ?? undefined,
    reflection: record.reflection ?? undefined,
    reflectionUri: record.reflectionUri ?? undefined,
    setting: record.setting ?? undefined,
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
    emotion_id: entry.emotionId ?? null,
    reflection: entry.reflection ?? null,
    reflection_uri: entry.reflectionUri ?? null,
    setting: entry.setting ?? null,
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
  if (updates.emotionId !== undefined) raw.emotion_id = updates.emotionId ?? null;
  if (updates.reflection !== undefined)
    raw.reflection = updates.reflection ?? null;
  if (updates.reflectionUri !== undefined) raw.reflection_uri = updates.reflectionUri ?? null;
  if (updates.setting !== undefined) raw.setting = updates.setting ?? null;
  if (updates.date !== undefined) raw.date = updates.date;
  return raw;
}
