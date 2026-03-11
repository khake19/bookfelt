import { useState, useEffect, useCallback, useMemo } from "react";
import type { Entry } from "../types/entry";
import * as entryService from "../services/entry.service";

export function useEntries(bookId?: string) {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const refresh = () => {
      entryService.fetchEntries(bookId).then(setEntries);
    };
    refresh();
    return entryService.subscribeToEntries(refresh);
  }, [bookId]);

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) => b.date - a.date || b.createdAt - a.createdAt,
      ),
    [entries],
  );

  const addEntry = useCallback(
    (entry: Omit<Entry, "id" | "createdAt">) => entryService.addEntry(entry),
    [],
  );

  const removeEntry = useCallback(
    (entryId: string) => entryService.removeEntry(entryId),
    [],
  );

  const updateEntry = useCallback(
    (entryId: string, updates: Partial<Entry>) =>
      entryService.updateEntry(entryId, updates),
    [],
  );

  return { entries: sorted, addEntry, removeEntry, updateEntry };
}
