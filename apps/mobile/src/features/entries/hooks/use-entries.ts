import { useMemo } from "react";
import { useObservable } from "@/shared/hooks/use-observable";
import * as entryService from "@/features/entries/services/entry.service";

export function useEntries(bookId?: string) {
  const entries$ = useMemo(
    () => entryService.observeEntries(bookId),
    [bookId],
  );

  const entries = useObservable(entries$, []);

  return {
    entries,
    addEntry: entryService.addEntry,
    removeEntry: entryService.removeEntry,
    updateEntry: entryService.updateEntry,
    fetchEntries: entryService.fetchEntries,
  };
}
