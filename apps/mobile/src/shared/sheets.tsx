import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import type { ReadingStatus } from "../features/books/types/book";
import DeleteConfirmSheet from "./components/DeleteConfirmSheet";
import BookOptionsSheet from "../features/books/components/BookOptionsSheet";
import ChangeStatusSheet from "../features/books/components/ChangeStatusSheet";
import { SHEET_IDS } from "./constants/sheet-ids";

registerSheet(SHEET_IDS.DELETE_ENTRY, DeleteConfirmSheet);
registerSheet(SHEET_IDS.ENTRY_OPTIONS, BookOptionsSheet);
registerSheet(SHEET_IDS.CHANGE_STATUS, ChangeStatusSheet);

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
        onChangeStatus: (status: ReadingStatus | "put-down") => void;
        currentStatus: ReadingStatus;
      };
    }>;
    "change-status-sheet": SheetDefinition<{
      payload: {
        onChangeStatus: (status: ReadingStatus | "put-down") => void;
        currentStatus: ReadingStatus;
      };
    }>;
  }
}

export {};
