import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChecklistItem,
  ChecklistCompletion,
  getCurrentShift,
} from "../data/checklists";
import { useChecklistStore } from "../store/checklistStore";
import { useFeedStore } from "../store/feedStore";

// Hooks
export const useChecklistItems = () => {
  const getChecklistItems = useChecklistStore(
    (state) => state.getChecklistItems
  );

  return useQuery({
    queryKey: ["checklist-items"],
    queryFn: async (): Promise<ChecklistItem[]> => {
      // Simulate API delay for realistic behavior
      await new Promise((resolve) => setTimeout(resolve, 100));
      return getChecklistItems();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useChecklistCompletions = (
  residentId: string,
  date: string = new Date().toISOString().split("T")[0]
) => {
  const getCompletionsForResident = useChecklistStore(
    (state) => state.getCompletionsForResident
  );

  return useQuery({
    queryKey: ["checklist-completions", residentId, date],
    queryFn: async (): Promise<ChecklistCompletion[]> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      return getCompletionsForResident(residentId, date);
    },
    enabled: !!residentId,
  });
};

export const useCompleteChecklistItem = () => {
  const queryClient = useQueryClient();
  const addCompletion = useChecklistStore((state) => state.addCompletion);
  const { currentUserId } = useFeedStore();

  return useMutation({
    mutationFn: async ({
      itemId,
      residentId,
      notes,
      skipped = false,
      skipReason,
    }: {
      itemId: string;
      residentId: string;
      notes?: string;
      skipped?: boolean;
      skipReason?: string;
    }) => {
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      const completion = addCompletion({
        itemId,
        residentId,
        staffId: currentUserId,
        notes,
        skipped,
        skipReason,
      });

      return completion;
    },
    onSuccess: (_, variables) => {
      const date = new Date().toISOString().split("T")[0];
      queryClient.invalidateQueries({
        queryKey: ["checklist-completions", variables.residentId, date],
      });
    },
  });
};

export const useUncompleteChecklistItem = () => {
  const queryClient = useQueryClient();
  const removeCompletion = useChecklistStore((state) => state.removeCompletion);

  return useMutation({
    mutationFn: async ({
      completionId,
      residentId,
    }: {
      completionId: string;
      residentId: string;
    }) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      removeCompletion(completionId);
    },
    onSuccess: (_, variables) => {
      const date = new Date().toISOString().split("T")[0];
      queryClient.invalidateQueries({
        queryKey: ["checklist-completions", variables.residentId, date],
      });
    },
  });
};

export const useChecklistProgress = (
  residentId: string,
  date: string = new Date().toISOString().split("T")[0]
) => {
  const getCompletionProgress = useChecklistStore(
    (state) => state.getCompletionProgress
  );

  return useQuery({
    queryKey: ["checklist-progress", residentId, date],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      return getCompletionProgress(residentId, date);
    },
    enabled: !!residentId,
  });
};

// Optimistic update helpers
export const useOptimisticChecklist = (residentId: string) => {
  const queryClient = useQueryClient();
  const date = new Date().toISOString().split("T")[0];
  const queryKey = ["checklist-completions", residentId, date];

  const addOptimisticCompletion = (
    itemId: string,
    skipped: boolean = false
  ) => {
    queryClient.setQueryData(queryKey, (old: ChecklistCompletion[] = []) => {
      const newCompletion: ChecklistCompletion = {
        id: `temp-${Date.now()}`,
        itemId,
        residentId,
        staffId: "current-user", // Will be replaced by real data
        completedAt: new Date().toISOString(),
        skipped,
      };
      return [...old, newCompletion];
    });
  };

  const removeOptimisticCompletion = (itemId: string) => {
    queryClient.setQueryData(queryKey, (old: ChecklistCompletion[] = []) => {
      return old.filter((completion) => completion.itemId !== itemId);
    });
  };

  return {
    addOptimisticCompletion,
    removeOptimisticCompletion,
  };
};
