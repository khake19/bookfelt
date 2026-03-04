import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import DeleteEntrySheet from "../features/entries/components/DeleteEntrySheet";

registerSheet("delete-entry-sheet", DeleteEntrySheet);

declare module "react-native-actions-sheet" {
  interface Sheets {
    "delete-entry-sheet": SheetDefinition<{
      payload: { onConfirm: () => void };
    }>;
  }
}

export {};
