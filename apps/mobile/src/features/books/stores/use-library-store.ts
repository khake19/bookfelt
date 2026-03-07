import { create } from "zustand";
import type { Book, LibraryBook, ReadingStatus } from "../types/book";

interface LibraryState {
  books: LibraryBook[];
  primaryReadId: string | null;
  addBook: (book: Book, status: ReadingStatus) => void;
  removeBook: (bookId: string) => void;
  updateStatus: (bookId: string, status: ReadingStatus) => void;
  updateBook: (bookId: string, updates: Partial<LibraryBook>) => void;
  setPrimaryRead: (bookId: string) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  books: [],
  primaryReadId: null,
  addBook: (book, status) =>
    set((state) => {
      if (state.books.some((b) => b.id === book.id)) return state;
      const libraryBook: LibraryBook = {
        ...book,
        status,
        addedAt: Date.now(),
      };
      const shouldSetPrimary =
        status === "reading" && state.primaryReadId === null;
      return {
        books: [libraryBook, ...state.books],
        ...(shouldSetPrimary && { primaryReadId: book.id }),
      };
    }),
  removeBook: (bookId) =>
    set((state) => {
      const books = state.books.filter((b) => b.id !== bookId);
      const primaryReadId =
        state.primaryReadId === bookId
          ? (books.find((b) => b.status === "reading")?.id ?? null)
          : state.primaryReadId;
      return { books, primaryReadId };
    }),
  updateStatus: (bookId, status) =>
    set((state) => {
      const books = state.books.map((b) =>
        b.id === bookId ? { ...b, status } : b,
      );
      let { primaryReadId } = state;
      if (status === "reading" && primaryReadId === null) {
        primaryReadId = bookId;
      } else if (status !== "reading" && primaryReadId === bookId) {
        primaryReadId =
          books.find((b) => b.status === "reading" && b.id !== bookId)?.id ??
          null;
      }
      return { books, primaryReadId };
    }),
  updateBook: (bookId, updates) =>
    set((state) => ({
      books: state.books.map((b) =>
        b.id === bookId ? { ...b, ...updates } : b,
      ),
    })),
  setPrimaryRead: (bookId) => set({ primaryReadId: bookId }),
}));
