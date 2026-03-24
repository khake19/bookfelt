import {
  schemaMigrations,
  addColumns,
  createTable,
  unsafeExecuteSql,
} from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 11,
      steps: [
        addColumns({
          table: "emotions",
          columns: [
            { name: "control", type: "number" },
          ],
        }),
        // Initialize with default value (will be updated by seed)
        unsafeExecuteSql(
          "UPDATE emotions SET control = 0.5 WHERE control IS NULL;",
        ),
      ],
    },
    {
      toVersion: 10,
      steps: [
        addColumns({
          table: "emotions",
          columns: [
            { name: "category", type: "string" },
          ],
        }),
        // Set default category to neutral (will be updated by seed)
        unsafeExecuteSql(
          "UPDATE emotions SET category = 'neutral' WHERE category IS NULL;",
        ),
      ],
    },
    {
      toVersion: 9,
      steps: [
        // Add valence and intensity to emotions
        addColumns({
          table: "emotions",
          columns: [
            { name: "valence", type: "number" },
            { name: "intensity", type: "number" },
          ],
        }),
        // Initialize with default values (will be updated by seed)
        unsafeExecuteSql(
          "UPDATE emotions SET valence = 0, intensity = 0.5 WHERE valence IS NULL;",
        ),
        // Add emotion_id column to entries
        addColumns({
          table: "entries",
          columns: [
            { name: "emotion_id", type: "string", isOptional: true },
          ],
        }),
        // Migrate feeling labels to emotion_id UUIDs
        unsafeExecuteSql(
          "UPDATE entries SET emotion_id = (SELECT id FROM emotions WHERE emotions.label = entries.feeling) WHERE feeling IS NOT NULL;",
        ),
        // Create temp table without feeling column
        unsafeExecuteSql(`
          CREATE TABLE entries_new (
            id TEXT PRIMARY KEY NOT NULL,
            original_id TEXT NOT NULL,
            book_id TEXT NOT NULL,
            book_title TEXT NOT NULL,
            chapter TEXT,
            page TEXT,
            percent TEXT,
            snippet TEXT,
            emotion_id TEXT,
            reflection TEXT,
            reflection_uri TEXT,
            setting TEXT,
            date INTEGER NOT NULL,
            entry_created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            _changed TEXT NOT NULL,
            _status TEXT NOT NULL
          );
        `),
        // Copy data from old table to new
        unsafeExecuteSql(`
          INSERT INTO entries_new
          SELECT id, original_id, book_id, book_title, chapter, page, percent, snippet,
                 emotion_id, reflection, reflection_uri, setting, date, entry_created_at,
                 updated_at, _changed, _status
          FROM entries;
        `),
        // Drop old table
        unsafeExecuteSql("DROP TABLE entries;"),
        // Rename new table
        unsafeExecuteSql("ALTER TABLE entries_new RENAME TO entries;"),
        // Recreate indexes
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS entries_book_id ON entries (book_id);",
        ),
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS entries_date ON entries (date);",
        ),
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS entries_entry_created_at ON entries (entry_created_at);",
        ),
        unsafeExecuteSql(
          "CREATE INDEX IF NOT EXISTS entries_emotion_id ON entries (emotion_id);",
        ),
      ],
    },
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
