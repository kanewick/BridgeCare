import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShiftJournalEntry, getCurrentShift } from "../data/checklists";
import { useShiftJournalStore } from "../store/shiftJournalStore";
import { useFeedStore } from "../store/feedStore";

// Hooks
export const useShiftJournalEntries = (
  residentId?: string,
  shift?: string,
  date: string = new Date().toISOString().split("T")[0]
) => {
  const getEntries = useShiftJournalStore((state) => state.getEntries);

  return useQuery({
    queryKey: ["shift-journal-entries", residentId, shift, date],
    queryFn: async (): Promise<ShiftJournalEntry[]> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      return getEntries(residentId, shift, date);
    },
  });
};

export const useCreateShiftJournalEntry = () => {
  const queryClient = useQueryClient();
  const addEntry = useShiftJournalStore((state) => state.addEntry);
  const extractTags = useShiftJournalStore((state) => state.extractTags);
  const { currentUserId } = useFeedStore();

  return useMutation({
    mutationFn: async ({
      residentId,
      content,
      isHandover = false,
      priority = "normal",
      tags,
      audioUrl,
    }: {
      residentId?: string;
      content: string;
      isHandover?: boolean;
      priority?: "low" | "normal" | "high" | "urgent";
      tags?: string[];
      audioUrl?: string;
    }) => {
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      const finalTags = tags || extractTags(content);

      const entry = addEntry({
        residentId,
        staffId: currentUserId,
        shift: getCurrentShift(),
        content,
        isHandover,
        priority,
        tags: finalTags,
        audioUrl,
      });

      return entry;
    },
    onSuccess: (data) => {
      const date = new Date().toISOString().split("T")[0];

      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: ["shift-journal-entries"],
      });

      // Specifically invalidate queries for this resident and shift
      if (data.residentId) {
        queryClient.invalidateQueries({
          queryKey: ["shift-journal-entries", data.residentId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["shift-journal-entries", undefined, data.shift, date],
      });
    },
  });
};

export const useUpdateShiftJournalEntry = () => {
  const queryClient = useQueryClient();
  const updateEntry = useShiftJournalStore((state) => state.updateEntry);

  return useMutation({
    mutationFn: async ({
      id,
      content,
      priority,
      tags,
    }: {
      id: string;
      content?: string;
      priority?: "low" | "normal" | "high" | "urgent";
      tags?: string[];
    }) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updates: any = {};
      if (content !== undefined) updates.content = content;
      if (priority !== undefined) updates.priority = priority;
      if (tags !== undefined) updates.tags = tags;

      updateEntry(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shift-journal-entries"],
      });
    },
  });
};

export const useDeleteShiftJournalEntry = () => {
  const queryClient = useQueryClient();
  const deleteEntry = useShiftJournalStore((state) => state.deleteEntry);

  return useMutation({
    mutationFn: async (id: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      deleteEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shift-journal-entries"],
      });
    },
  });
};

export const useHandoverSummary = (
  shift: string,
  date: string = new Date().toISOString().split("T")[0]
) => {
  const getHandoverEntries = useShiftJournalStore(
    (state) => state.getHandoverEntries
  );

  return useQuery({
    queryKey: ["handover-summary", shift, date],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      return getHandoverEntries(shift, date);
    },
  });
};

// Voice note upload helper (mock for now)
export const useUploadVoiceNote = () => {
  const queryClient = useQueryClient();
  const updateEntry = useShiftJournalStore((state) => state.updateEntry);

  return useMutation({
    mutationFn: async ({
      audioFile,
      entryId,
    }: {
      audioFile: File | Blob;
      entryId?: string;
    }) => {
      // Mock upload - simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUrl = `mock-voice-note-${Date.now()}.m4a`;

      // If this is for an existing entry, update it
      if (entryId) {
        updateEntry(entryId, { audioUrl: mockUrl });
      }

      return mockUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shift-journal-entries"],
      });
    },
  });
};

// Real-time subscriptions (mock for now)
export const useShiftJournalSubscription = (
  residentId?: string,
  onNewEntry?: (entry: ShiftJournalEntry) => void
) => {
  // Mock subscription - in real app this would use Supabase realtime
  React.useEffect(() => {
    // For now, just a placeholder
    console.log("Mock subscription setup for resident:", residentId);
    return () => {
      console.log("Mock subscription cleanup");
    };
  }, [residentId, onNewEntry]);
};

// Optimistic updates
export const useOptimisticShiftJournal = (residentId?: string) => {
  const queryClient = useQueryClient();
  const date = new Date().toISOString().split("T")[0];
  const shift = getCurrentShift();
  const queryKey = ["shift-journal-entries", residentId, shift, date];

  const addOptimisticEntry = (content: string, isHandover: boolean = false) => {
    queryClient.setQueryData(queryKey, (old: ShiftJournalEntry[] = []) => {
      const newEntry: ShiftJournalEntry = {
        id: `temp-${Date.now()}`,
        residentId,
        staffId: "current-user",
        shift: shift as any,
        content,
        isHandover,
        priority: "normal",
        createdAt: new Date().toISOString(),
      };
      return [newEntry, ...old];
    });
  };

  const removeOptimisticEntry = (tempId: string) => {
    queryClient.setQueryData(queryKey, (old: ShiftJournalEntry[] = []) => {
      return old.filter((entry) => entry.id !== tempId);
    });
  };

  return {
    addOptimisticEntry,
    removeOptimisticEntry,
  };
};
