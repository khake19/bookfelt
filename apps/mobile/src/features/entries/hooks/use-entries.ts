import { useMemo } from "react";
import * as entryService from "../services/entry.service";

export function useEntries(bookId?: string) {
  const entries = entryService.useObserveEntries(bookId);

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) => b.date - a.date || b.createdAt - a.createdAt,
      ),
    [entries],
  );

  return {
    entries: sorted,
    addEntry: entryService.addEntry,
    removeEntry: entryService.removeEntry,
    updateEntry: entryService.updateEntry,
    fetchEntries: entryService.fetchEntries,
  };
}
