import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import { migrations } from "./migrations";
import { BookModel } from "./models/book.model";
import { EntryModel } from "./models/entry.model";
import { SettingModel } from "./models/setting.model";

export { schema } from "./schema";
export { migrations } from "./migrations";
export { BookModel } from "./models/book.model";
export { EntryModel } from "./models/entry.model";
export { SettingModel } from "./models/setting.model";


const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error("WatermelonDB setup error:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [BookModel, EntryModel, SettingModel],
});
