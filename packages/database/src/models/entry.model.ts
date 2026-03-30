import { Model, type Relation } from "@nozbe/watermelondb";
import { field, text, relation, date } from "@nozbe/watermelondb/decorators";
import type { EmotionModel } from "./emotion.model";

export class EntryModel extends Model {
  static override table = "entries";
  static override associations = {
    books: { type: "belongs_to" as const, key: "book_id" },
    emotions: { type: "belongs_to" as const, key: "emotion_id" },
  };

  @text("original_id") originalId!: string;
  @text("book_id") bookId!: string;
  @text("book_title") bookTitle!: string;
  @text("chapter") chapter!: string | null;
  @text("page") page!: string | null;
  @text("percent") percent!: string | null;
  @text("snippet") snippet!: string | null;
  @text("emotion_id") emotionId!: string | null;
  @text("reflection") reflection!: string | null;
  @text("reflection_uri") reflectionUri!: string | null;
  @text("setting") setting!: string | null;
  @field("date") date!: number;
  @field("entry_created_at") entryCreatedAt!: number;
  @date("updated_at") updatedAt!: number;
  @field("needs_transcription") needsTranscription!: boolean;

  @relation("books", "book_id") book: any;
  @relation("emotions", "emotion_id") emotion!: Relation<EmotionModel>;
}
