import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: "books",
      columns: [
        { name: "original_id", type: "string" },
        { name: "title", type: "string" },
        { name: "authors_json", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "page_count", type: "number", isOptional: true },
        { name: "cover_url", type: "string", isOptional: true },
        { name: "isbn", type: "string", isOptional: true },
        { name: "publisher", type: "string", isOptional: true },
        { name: "published_date", type: "string", isOptional: true },
        { name: "source", type: "string" },
        { name: "status", type: "string" },
        { name: "added_at", type: "number" },
        { name: "first_impression", type: "string", isOptional: true },
        { name: "final_thought", type: "string", isOptional: true },
        { name: "exit_note", type: "string", isOptional: true },
        { name: "summary", type: "string", isOptional: true },
      ],
    }),
    tableSchema({
      name: "entries",
      columns: [
        { name: "original_id", type: "string" },
        { name: "book_id", type: "string", isIndexed: true },
        { name: "book_title", type: "string" },
        { name: "chapter", type: "string", isOptional: true },
        { name: "page", type: "string", isOptional: true },
        { name: "percent", type: "string", isOptional: true },
        { name: "snippet", type: "string", isOptional: true },
        { name: "feeling", type: "string", isOptional: true },
        { name: "reflection", type: "string", isOptional: true },
        { name: "audio_uri", type: "string", isOptional: true },
        { name: "date", type: "number", isIndexed: true },
        { name: "entry_created_at", type: "number", isIndexed: true },
      ],
    }),
    tableSchema({
      name: "settings",
      columns: [
        { name: "key", type: "string", isIndexed: true },
        { name: "value", type: "string", isOptional: true },
      ],
    }),
  ],
});
