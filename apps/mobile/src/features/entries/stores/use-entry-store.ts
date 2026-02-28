import { create } from "zustand";
import type { Entry } from "../types/entry";

interface EntryState {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, "id" | "createdAt">) => void;
  removeEntry: (entryId: string) => void;
  updateEntry: (entryId: string, updates: Partial<Entry>) => void;
}

export const useEntryStore = create<EntryState>((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      entries: [
        { ...entry, id: `entry-${Date.now()}`, createdAt: Date.now() },
        ...state.entries,
      ],
    })),
  removeEntry: (entryId) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== entryId),
    })),
  updateEntry: (entryId, updates) =>
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === entryId ? { ...e, ...updates } : e,
      ),
    })),
}));
