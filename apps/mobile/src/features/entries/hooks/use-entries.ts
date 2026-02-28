import { useEntryStore } from "../stores/use-entry-store";

export function useEntries(bookId?: string) {
  const entries = useEntryStore((s) => s.entries);
  const addEntry = useEntryStore((s) => s.addEntry);
  const removeEntry = useEntryStore((s) => s.removeEntry);
  const updateEntry = useEntryStore((s) => s.updateEntry);

  const filtered = bookId
    ? entries.filter((e) => e.bookId === bookId)
    : entries;

  return { entries: filtered, addEntry, removeEntry, updateEntry };
}
