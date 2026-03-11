import { useState, useEffect, useCallback, useMemo } from "react";
import type { Book, LibraryBook, ReadingStatus } from "../types/book";
import * as libraryService from "../services/library.service";

export function useLibrary() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [primaryReadId, setPrimaryReadIdState] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      libraryService.fetchAllBooks().then(setBooks);
    };
    refresh();
    return libraryService.subscribeToBooksCollection(refresh);
  }, []);

  useEffect(() => {
    const refresh = () => {
      libraryService.fetchPrimaryReadId().then(setPrimaryReadIdState);
    };
    refresh();
    return libraryService.subscribeToSettings(refresh);
  }, []);

  const primaryRead = useMemo(
    () => books.find((b) => b.id === primaryReadId),
    [books, primaryReadId],
  );

  const addBook = useCallback(
    (book: Book, status: ReadingStatus) => libraryService.addBook(book, status),
    [],
  );

  const removeBook = useCallback(
    (bookId: string) => libraryService.removeBook(bookId),
    [],
  );

  const updateStatus = useCallback(
    (bookId: string, status: ReadingStatus) =>
      libraryService.updateBookStatus(bookId, status),
    [],
  );

  const updateBook = useCallback(
    (bookId: string, updates: Partial<LibraryBook>) =>
      libraryService.updateBook(bookId, updates),
    [],
  );

  const setPrimaryRead = useCallback(
    (bookId: string) => libraryService.setPrimaryRead(bookId),
    [],
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
