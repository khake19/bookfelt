import { combineLatest, map } from "rxjs";
import { useObservable } from "../../../shared";
import * as libraryService from "../services/library.service";
import type { LibraryBook } from "../types/book";

const primaryRead$ = combineLatest([
  libraryService.books$,
  libraryService.primaryReadId$,
]).pipe(
  map(([books, id]) => books.find((b) => b.id === id)),
);

export function useLibrary() {
  const books = useObservable(libraryService.books$, []);
  const primaryRead = useObservable(primaryRead$, undefined as LibraryBook | undefined);

  return {
    books,
    primaryRead,
    addBook: libraryService.addBook,
    removeBook: libraryService.removeBook,
    updateStatus: libraryService.updateBookStatus,
    updateBook: libraryService.updateBook,
    fetchBook: libraryService.fetchBook,
    setPrimaryRead: libraryService.setPrimaryRead,
    isInLibrary: (bookId: string) => books.some((b) => b.originalId === bookId),
  };
}

export function useOnboardingStep(): number {
  return useObservable(libraryService.onboardingStep$, 0);
}
