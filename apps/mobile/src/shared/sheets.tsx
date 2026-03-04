import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import type { ReadingStatus } from "../features/books/types/book";
import DeleteConfirmSheet from "./components/DeleteConfirmSheet";
import BookOptionsSheet from "./components/BookOptionsSheet";

registerSheet("delete-entry-sheet", DeleteConfirmSheet);
registerSheet("entry-options-sheet", BookOptionsSheet);

declare module "react-native-actions-sheet" {
  interface Sheets {
    "delete-entry-sheet": SheetDefinition<{
      payload: {
        onConfirm: () => void;
        title?: string;
        description?: string;
      };
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
