import { useCallback } from "react";
import { useLibraryStore } from "../stores/use-library-store";

export function useLibrary() {
  const books = useLibraryStore((s) => s.books);
  const addBook = useLibraryStore((s) => s.addBook);
  const removeBook = useLibraryStore((s) => s.removeBook);
  const updateStatus = useLibraryStore((s) => s.updateStatus);

  const isInLibrary = useCallback(
    (bookId: string) => books.some((b) => b.id === bookId),
    [books],
  );

  return { books, addBook, removeBook, updateStatus, isInLibrary };
}
