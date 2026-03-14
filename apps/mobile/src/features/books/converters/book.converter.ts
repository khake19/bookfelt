import type { BookModel } from "@bookfelt/database";
import type { Book, LibraryBook, ReadingStatus } from "../types/book";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawRecord = any;

export interface BookRawFields {
  original_id: string;
  title: string;
  authors_json: string;
  description: string | null;
  page_count: number | null;
  cover_url: string | null;
  isbn: string | null;
  publisher: string | null;
  published_date: string | null;
  source: "google" | "manual";
  status: ReadingStatus;
  added_at: number;
}

export function bookModelToLibraryBook(record: BookModel): LibraryBook {
  return {
    id: record.id,
    originalId: record.originalId,
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
    firstImpressionAudioUri: record.firstImpressionAudioUri ?? undefined,
    finalThoughtAudioUri: record.finalThoughtAudioUri ?? undefined,
    exitNoteAudioUri: record.exitNoteAudioUri ?? undefined,
  };
}

export function bookToCreateRaw(book: Book, status: ReadingStatus): BookRawFields {
  return {
    original_id: book.id,
    title: book.title,
    authors_json: JSON.stringify(book.authors ?? []),
    description: book.description ?? null,
    page_count: book.pageCount ?? null,
    cover_url: book.coverUrl ?? null,
    isbn: book.isbn ?? null,
    publisher: book.publisher ?? null,
    published_date: book.publishedDate ?? null,
    source: book.source,
    status,
    added_at: Date.now(),
  };
}

export function bookUpdatesToRaw(
  updates: Partial<LibraryBook>,
): Partial<Record<string, unknown>> {
  const raw: Record<string, unknown> = {};
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
  if (updates.summary !== undefined) raw.summary = updates.summary ?? null;
  if (updates.firstImpressionAudioUri !== undefined)
    raw.first_impression_audio_uri = updates.firstImpressionAudioUri ?? null;
  if (updates.finalThoughtAudioUri !== undefined)
    raw.final_thought_audio_uri = updates.finalThoughtAudioUri ?? null;
  if (updates.exitNoteAudioUri !== undefined)
    raw.exit_note_audio_uri = updates.exitNoteAudioUri ?? null;
  return raw;
}
