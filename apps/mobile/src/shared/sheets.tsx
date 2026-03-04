import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import type { ReadingStatus } from "../features/books/types/book";
import DeleteConfirmSheet from "./components/DeleteConfirmSheet";
import BookOptionsSheet from "../features/books/components/BookOptionsSheet";
import ChangeStatusSheet from "../features/books/components/ChangeStatusSheet";
import ExpectationSheet from "../features/books/components/ExpectationSheet";

registerSheet("delete-entry-sheet", DeleteConfirmSheet);
registerSheet("entry-options-sheet", BookOptionsSheet);
registerSheet("change-status-sheet", ChangeStatusSheet);
registerSheet("expectation-sheet", ExpectationSheet);

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
    "change-status-sheet": SheetDefinition<{
      payload: {
        onChangeStatus: (status: ReadingStatus) => void;
        currentStatus: ReadingStatus;
      };
    }>;
    "expectation-sheet": SheetDefinition<{
      payload: {
        onSave: (expectation: string) => void;
      };
    }>;
  }
}

export {};
