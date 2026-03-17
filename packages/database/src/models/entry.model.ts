import { Model } from "@nozbe/watermelondb";
import { field, text, relation, date } from "@nozbe/watermelondb/decorators";

export class EntryModel extends Model {
  static override table = "entries";
  static override associations = {
    books: { type: "belongs_to" as const, key: "book_id" },
  };

  @text("original_id") originalId!: string;
  @text("book_id") bookId!: string;
  @text("book_title") bookTitle!: string;
  @text("chapter") chapter!: string | null;
  @text("page") page!: string | null;
  @text("percent") percent!: string | null;
  @text("snippet") snippet!: string | null;
  @text("feeling") feeling!: string | null;
  @text("reflection") reflection!: string | null;
  @text("reflection_uri") reflectionUri!: string | null;
  @text("setting") setting!: string | null;
  @field("date") date!: number;
  @field("entry_created_at") entryCreatedAt!: number;
  @date("updated_at") updatedAt!: number;

  @relation("books", "book_id") book: any;
}
