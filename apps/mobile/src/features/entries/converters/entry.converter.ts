import type { EntryModel } from "@bookfelt/database";
import type { Entry } from "@/features/entries/types/entry";

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
  if ("bookId" in updates && updates.bookId) raw.book_id = updates.bookId;
  if ("bookTitle" in updates && updates.bookTitle)
    raw.book_title = updates.bookTitle;
  if ("chapter" in updates) raw.chapter = updates.chapter ?? null;
  if ("page" in updates) raw.page = updates.page ?? null;
  if ("percent" in updates) raw.percent = updates.percent ?? null;
  if ("snippet" in updates) raw.snippet = updates.snippet ?? null;
  if ("emotionId" in updates) raw.emotion_id = updates.emotionId ?? null;
  if ("reflection" in updates) raw.reflection = updates.reflection ?? null;
  if ("reflectionUri" in updates)
    raw.reflection_uri = updates.reflectionUri ?? null;
  if ("setting" in updates) raw.setting = updates.setting ?? null;
  if ("date" in updates && updates.date) raw.date = updates.date;
  return raw;
}
