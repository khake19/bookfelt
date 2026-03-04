import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import type { ReadingStatus } from "../features/books/types/book";
import DeleteConfirmSheet from "./components/DeleteConfirmSheet";
import BookOptionsSheet from "../features/books/components/BookOptionsSheet";
import ChangeStatusSheet from "../features/books/components/ChangeStatusSheet";
import FirstImpressionSheet from "../features/books/components/FirstImpressionSheet";
import FinalThoughtSheet from "../features/books/components/FinalThoughtSheet";

registerSheet("delete-entry-sheet", DeleteConfirmSheet);
registerSheet("entry-options-sheet", BookOptionsSheet);
registerSheet("change-status-sheet", ChangeStatusSheet);
registerSheet("first-impression-sheet", FirstImpressionSheet);
registerSheet("final-thought-sheet", FinalThoughtSheet);

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
    "first-impression-sheet": SheetDefinition<{
      payload: {
        onSave: (text: string) => void;
      };
    }>;
    "final-thought-sheet": SheetDefinition<{
      payload: {
        firstImpression: string;
        onSave: (text: string) => void;
      };
    }>;
  }
}

export {};
