import {
  schemaMigrations,
  createTable,
  unsafeExecuteSql,
} from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
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
