import { create } from "zustand";
import type { Book, LibraryBook, ReadingStatus } from "../types/book";

interface LibraryState {
  books: LibraryBook[];
  addBook: (book: Book, status: ReadingStatus) => void;
  removeBook: (bookId: string) => void;
  updateStatus: (bookId: string, status: ReadingStatus) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  books: [],
  addBook: (book, status) =>
    set((state) => {
      if (state.books.some((b) => b.id === book.id)) return state;
      const libraryBook: LibraryBook = {
        ...book,
        status,
        addedAt: Date.now(),
      };
      return { books: [libraryBook, ...state.books] };
    }),
  removeBook: (bookId) =>
    set((state) => ({
      books: state.books.filter((b) => b.id !== bookId),
    })),
  updateStatus: (bookId, status) =>
    set((state) => ({
      books: state.books.map((b) =>
        b.id === bookId ? { ...b, status } : b,
      ),
    })),
}));
