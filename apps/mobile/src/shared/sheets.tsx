import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import type { ReadingStatus } from "../features/books/types/book";
import DeleteConfirmSheet from "./components/DeleteConfirmSheet";
import BookOptionsSheet from "../features/books/components/BookOptionsSheet";
import ChangeStatusSheet from "../features/books/components/ChangeStatusSheet";
import FirstImpressionSheet from "../features/books/components/FirstImpressionSheet";
import FinalThoughtSheet from "../features/books/components/FinalThoughtSheet";

export const SHEET_IDS = {
  DELETE_ENTRY: "delete-entry-sheet",
  ENTRY_OPTIONS: "entry-options-sheet",
  CHANGE_STATUS: "change-status-sheet",
  FIRST_IMPRESSION: "first-impression-sheet",
  FINAL_THOUGHT: "final-thought-sheet",
} as const;

registerSheet(SHEET_IDS.DELETE_ENTRY, DeleteConfirmSheet);
registerSheet(SHEET_IDS.ENTRY_OPTIONS, BookOptionsSheet);
registerSheet(SHEET_IDS.CHANGE_STATUS, ChangeStatusSheet);
registerSheet(SHEET_IDS.FIRST_IMPRESSION, FirstImpressionSheet);
registerSheet(SHEET_IDS.FINAL_THOUGHT, FinalThoughtSheet);

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
