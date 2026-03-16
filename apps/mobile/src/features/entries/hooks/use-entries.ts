import { useMemo } from "react";
import { map } from "rxjs";
import { useObservable } from "../../../shared";
import * as entryService from "../services/entry.service";

export function useEntries(bookId?: string) {
  const entries$ = useMemo(
    () =>
      entryService
        .observeEntries(bookId)
        .pipe(
          map((entries) =>
            [...entries].sort(
              (a, b) => b.date - a.date || b.createdAt - a.createdAt,
            ),
          ),
        ),
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
