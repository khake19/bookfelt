import { schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";
import { unsafeExecuteSql } from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
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
