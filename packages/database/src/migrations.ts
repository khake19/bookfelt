import {
  schemaMigrations,
  addColumns,
  createTable,
  unsafeExecuteSql,
} from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 8,
      steps: [
        addColumns({
          table: "entries",
          columns: [{ name: "updated_at", type: "number" }],
        }),
        unsafeExecuteSql(
          "UPDATE entries SET updated_at = (strftime('%s', 'now') * 1000) WHERE updated_at IS NULL;",
        ),
      ],
    },
    {
      toVersion: 7,
      steps: [
        addColumns({
          table: "entries",
          columns: [
            { name: "setting", type: "string", isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 6,
      steps: [
        addColumns({
          table: "entries",
          columns: [
            { name: "reflection_uri", type: "string", isOptional: true },
          ],
        }),
        unsafeExecuteSql(
          "UPDATE entries SET reflection_uri = audio_uri WHERE audio_uri IS NOT NULL;",
        ),
      ],
    },
    {
      toVersion: 5,
      steps: [
        addColumns({
          table: "books",
          columns: [
            { name: "exit_note_audio_uri", type: "string", isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: "books",
          columns: [
            { name: "first_impression_audio_uri", type: "string", isOptional: true },
            { name: "final_thought_audio_uri", type: "string", isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: "emotions",
          columns: [
            { name: "label", type: "string", isIndexed: true },
            { name: "emoji", type: "string" },
            { name: "color", type: "string" },
            { name: "group", type: "string" },
            { name: "sort_order", type: "number" },
          ],
        }),
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS entries_feeling ON entries (feeling);",
        ),
      ],
    },
    {
      toVersion: 2,
      steps: [
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS entries_date ON entries (date);",
        ),
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS entries_entry_created_at ON entries (entry_created_at);",
        ),
      ],
    },
  ],
});
