import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid";
import {
  ChecklistItem,
  ChecklistCompletion,
  DAILY_CHECKLIST_ITEMS,
  getCurrentShift,
} from "../data/checklists";

// Fallback ID generator
const generateId = () => {
  try {
    return nanoid();
  } catch (error) {
    console.warn("nanoid failed, using fallback:", error);
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
};

interface ChecklistState {
  checklistItems: ChecklistItem[];
  completions: ChecklistCompletion[];
}

interface ChecklistActions {
  // Checklist items
  getChecklistItems: () => ChecklistItem[];

  // Completions
  getCompletionsForResident: (
    residentId: string,
    date?: string
  ) => ChecklistCompletion[];

  addCompletion: (
    completion: Omit<ChecklistCompletion, "id" | "completedAt">
  ) => ChecklistCompletion;

  removeCompletion: (completionId: string) => void;

  updateCompletion: (
    completionId: string,
    updates: Partial<ChecklistCompletion>
  ) => void;

  // Helper methods
  getCompletionProgress: (
    residentId: string,
    date?: string
  ) => {
    total: number;
    completed: number;
    percentage: number;
    requiredCompleted: number;
    requiredTotal: number;
    requiredPercentage: number;
  };

  // Store management
  clearCompletions: () => void;
}

// Mock checklist items (using the ones from data/checklists.ts)
const initialChecklistItems = DAILY_CHECKLIST_ITEMS;

// Mock completions data
const mockCompletions: ChecklistCompletion[] = [
  // Some sample completions for testing
  {
    id: "comp1",
    itemId: "morning-vitals",
    residentId: "2", // Robert Chen
    staffId: "skarlette-choi",
    completedAt: new Date().toISOString(),
    skipped: false,
  },
  {
    id: "comp2",
    itemId: "morning-meds",
    residentId: "2",
    staffId: "skarlette-choi",
    completedAt: new Date().toISOString(),
    skipped: false,
  },
  {
    id: "comp3",
    itemId: "breakfast-assist",
    residentId: "2",
    staffId: "skarlette-choi",
    completedAt: new Date().toISOString(),
    skipped: false,
  },
];

export const useChecklistStore = create<ChecklistState & ChecklistActions>()(
  persist(
    (set, get) => ({
      // Initial state
      checklistItems: initialChecklistItems,
      completions: mockCompletions,

      // Actions
      getChecklistItems: () => {
        return get().checklistItems.filter((item) => item);
      },

      getCompletionsForResident: (residentId: string, date?: string) => {
        const targetDate = date || new Date().toISOString().split("T")[0];
        return get().completions.filter((completion) => {
          const completionDate = completion.completedAt.split("T")[0];
          return (
            completion.residentId === residentId &&
            completionDate === targetDate
          );
        });
      },

      addCompletion: (completionData) => {
        const newCompletion: ChecklistCompletion = {
          ...completionData,
          id: generateId(),
          completedAt: new Date().toISOString(),
        };

        set((state) => ({
          completions: [...state.completions, newCompletion],
        }));

        return newCompletion;
      },

      removeCompletion: (completionId) => {
        set((state) => ({
          completions: state.completions.filter((c) => c.id !== completionId),
        }));
      },

      updateCompletion: (completionId, updates) => {
        set((state) => ({
          completions: state.completions.map((completion) =>
            completion.id === completionId
              ? { ...completion, ...updates }
              : completion
          ),
        }));
      },

      getCompletionProgress: (residentId: string, date?: string) => {
        const state = get();
        const targetDate = date || new Date().toISOString().split("T")[0];
        const currentShift = getCurrentShift();

        // Get relevant items for current shift
        const relevantItems = state.checklistItems.filter((item) => {
          if (currentShift === "night") {
            return item.category === "prn";
          }
          return item.category === currentShift || item.category === "prn";
        });

        // Get completions for this resident and date
        const completions = state.completions.filter((completion) => {
          const completionDate = completion.completedAt.split("T")[0];
          return (
            completion.residentId === residentId &&
            completionDate === targetDate &&
            !completion.skipped
          );
        });

        const completedItemIds = new Set(completions.map((c) => c.itemId));
        const totalItems = relevantItems.length;
        const completedItems = relevantItems.filter((item) =>
          completedItemIds.has(item.id)
        ).length;

        const requiredItems = relevantItems.filter((item) => item.required);
        const completedRequiredItems = requiredItems.filter((item) =>
          completedItemIds.has(item.id)
        ).length;

        return {
          total: totalItems,
          completed: completedItems,
          percentage:
            totalItems > 0
              ? Math.round((completedItems / totalItems) * 100)
              : 100,
          requiredCompleted: completedRequiredItems,
          requiredTotal: requiredItems.length,
          requiredPercentage:
            requiredItems.length > 0
              ? Math.round(
                  (completedRequiredItems / requiredItems.length) * 100
                )
              : 100,
        };
      },

      clearCompletions: () => {
        set({ completions: [] });
      },
    }),
    {
      name: "kinloop-checklist-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
