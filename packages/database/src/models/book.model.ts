import { Model } from "@nozbe/watermelondb";
import { field, text, json, children } from "@nozbe/watermelondb/decorators";

const sanitizeAuthors = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw;
  return [];
};

export class BookModel extends Model {
  static override table = "books";
  static override associations = {
    entries: { type: "has_many" as const, foreignKey: "book_id" },
  };

  @text("original_id") originalId!: string;
  @text("title") title!: string;
  @json("authors_json", sanitizeAuthors) authors!: string[];
  @text("description") description!: string | null;
  @field("page_count") pageCount!: number | null;
  @text("cover_url") coverUrl!: string | null;
  @text("isbn") isbn!: string | null;
  @text("publisher") publisher!: string | null;
  @text("published_date") publishedDate!: string | null;
  @text("source") source!: "google" | "manual";
  @text("status") status!: string;
  @field("added_at") addedAt!: number;
  @text("first_impression") firstImpression!: string | null;
  @text("final_thought") finalThought!: string | null;
  @text("exit_note") exitNote!: string | null;
  @text("summary") summary!: string | null;
  @text("first_impression_audio_uri") firstImpressionAudioUri!: string | null;
  @text("final_thought_audio_uri") finalThoughtAudioUri!: string | null;
  @text("exit_note_audio_uri") exitNoteAudioUri!: string | null;
  @field("date_finished") dateFinished!: number | null;

  @children("entries") entries: any;
}
