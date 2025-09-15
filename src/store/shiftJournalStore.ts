import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid";
import { ShiftJournalEntry, getCurrentShift } from "../data/checklists";

// Fallback ID generator
const generateId = () => {
  try {
    return nanoid();
  } catch (error) {
    console.warn("nanoid failed, using fallback:", error);
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
};

interface ShiftJournalState {
  entries: ShiftJournalEntry[];
}

interface ShiftJournalActions {
  // Entries
  getEntries: (
    residentId?: string,
    shift?: string,
    date?: string
  ) => ShiftJournalEntry[];

  addEntry: (
    entry: Omit<ShiftJournalEntry, "id" | "createdAt">
  ) => ShiftJournalEntry;

  updateEntry: (entryId: string, updates: Partial<ShiftJournalEntry>) => void;

  deleteEntry: (entryId: string) => void;

  // Helper methods
  getHandoverEntries: (shift: string, date?: string) => ShiftJournalEntry[];

  extractTags: (content: string) => string[];

  // Store management
  clearEntries: () => void;
}

// Mock entries for testing
const mockEntries: ShiftJournalEntry[] = [
  {
    id: "journal1",
    residentId: "2", // Robert Chen
    staffId: "skarlette-choi",
    shift: "morning",
    content:
      "Robert had a good morning. Ate breakfast well and participated in morning exercises. #mood-good #breakfast #activity",
    isHandover: true,
    priority: "normal",
    tags: ["mood-good", "breakfast", "activity"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "journal2",
    residentId: "2",
    staffId: "skarlette-choi",
    shift: "morning",
    content:
      "Reminder: Robert prefers his tea with two sugars. Please make sure afternoon staff knows. #preferences #tea",
    isHandover: true,
    priority: "normal",
    tags: ["preferences", "tea"],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: "journal3",
    staffId: "skarlette-choi",
    shift: "morning",
    content:
      "General note: The morning routine went smoothly today. All residents were cooperative. #shift-summary",
    isHandover: false,
    priority: "low",
    tags: ["shift-summary"],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
];

export const useShiftJournalStore = create<
  ShiftJournalState & ShiftJournalActions
>()(
  persist(
    (set, get) => ({
      // Initial state
      entries: mockEntries,

      // Actions
      getEntries: (residentId?: string, shift?: string, date?: string) => {
        const targetDate = date || new Date().toISOString().split("T")[0];

        return get()
          .entries.filter((entry) => {
            const entryDate = entry.createdAt.split("T")[0];
            const matchesDate = entryDate === targetDate;
            const matchesResident =
              !residentId || entry.residentId === residentId;
            const matchesShift = !shift || entry.shift === shift;

            return matchesDate && matchesResident && matchesShift;
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },

      addEntry: (entryData) => {
        const newEntry: ShiftJournalEntry = {
          ...entryData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));

        return newEntry;
      },

      updateEntry: (entryId, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId ? { ...entry, ...updates } : entry
          ),
        }));
      },

      deleteEntry: (entryId) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== entryId),
        }));
      },

      getHandoverEntries: (shift: string, date?: string) => {
        const targetDate = date || new Date().toISOString().split("T")[0];

        return get().entries.filter((entry) => {
          const entryDate = entry.createdAt.split("T")[0];
          return (
            entryDate === targetDate &&
            entry.shift === shift &&
            entry.isHandover
          );
        });
      },

      extractTags: (content: string) => {
        const tagRegex = /#(\w+)/g;
        const matches = content.match(tagRegex);
        return matches ? matches.map((tag) => tag.slice(1)) : [];
      },

      clearEntries: () => {
        set({ entries: [] });
      },
    }),
    {
      name: "kinloop-shift-journal-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
