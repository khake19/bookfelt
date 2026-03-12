import { useMemo } from "react";
import * as libraryService from "../services/library.service";

export function useLibrary() {
  const books = libraryService.useObserveBooks();
  const primaryReadId = libraryService.useObservePrimaryReadId();

  const primaryRead = useMemo(
    () => books.find((b) => b.id === primaryReadId),
    [books, primaryReadId],
  );

  return {
    books,
    primaryRead,
    addBook: libraryService.addBook,
    removeBook: libraryService.removeBook,
    updateStatus: libraryService.updateBookStatus,
    updateBook: libraryService.updateBook,
    fetchBook: libraryService.fetchBook,
    setPrimaryRead: libraryService.setPrimaryRead,
    isInLibrary: (bookId: string) => books.some((b) => b.id === bookId),
  };
}
