import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import type { ReadingStatus } from "../features/books/types/book";
import DeleteEntrySheet from "../features/entries/components/DeleteEntrySheet";
import EntryOptionsSheet from "../features/entries/components/EntryOptionsSheet";

registerSheet("delete-entry-sheet", DeleteEntrySheet);
registerSheet("entry-options-sheet", EntryOptionsSheet);

declare module "react-native-actions-sheet" {
  interface Sheets {
    "delete-entry-sheet": SheetDefinition<{
      payload: { onConfirm: () => void };
    }>;
    "entry-options-sheet": SheetDefinition<{
      payload: {
        onEdit: () => void;
        onDelete: () => void;
        onChangeStatus: (status: ReadingStatus) => void;
        currentStatus: ReadingStatus;
      };
    }>;
  }
}

export {};
