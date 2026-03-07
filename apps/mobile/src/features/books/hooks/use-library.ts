import { useCallback, useMemo } from "react";
import { useLibraryStore } from "../stores/use-library-store";

export function useLibrary() {
  const books = useLibraryStore((s) => s.books);
  const primaryReadId = useLibraryStore((s) => s.primaryReadId);
  const addBook = useLibraryStore((s) => s.addBook);
  const removeBook = useLibraryStore((s) => s.removeBook);
  const updateStatus = useLibraryStore((s) => s.updateStatus);
  const updateBook = useLibraryStore((s) => s.updateBook);
  const setPrimaryRead = useLibraryStore((s) => s.setPrimaryRead);

  const primaryRead = useMemo(
    () => books.find((b) => b.id === primaryReadId),
    [books, primaryReadId],
  );

  const isInLibrary = useCallback(
    (bookId: string) => books.some((b) => b.id === bookId),
    [books],
  );

  return {
    books,
    primaryRead,
    addBook,
    removeBook,
    updateStatus,
    updateBook,
    setPrimaryRead,
    isInLibrary,
  };
}
