import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid";

// Fallback ID generator in case nanoid fails
const generateId = () => {
  try {
    return nanoid();
  } catch (error) {
    console.warn("nanoid failed, using fallback:", error);
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
};

// Types
export interface User {
  id: string;
  name: string;
  role: "staff" | "family";
  email?: string;
  avatar?: string;
}

export interface Resident {
  id: string;
  name: string;
  room?: string;
  avatar?: string;
  photoConsent?: boolean;
  familyMembers?: string[]; // User IDs of family members
}

export interface FeedItem {
  id: string;
  residentId: string;
  authorId: string;
  type:
    | "meal"
    | "activity"
    | "meds"
    | "rest"
    | "bathroom"
    | "hygiene"
    | "dressing"
    | "mobility"
    | "photo"
    | "note";
  text?: string;
  tags: string[];
  photoUrl?: string;
  createdAt: string;
  reactions?: {
    heart: number;
    reactedByMe?: boolean;
  };
}

export interface FeedState {
  residents: Resident[];
  feed: Record<string, FeedItem[]>;
  users: User[];
  currentUser: User | null;
  activeResidentId: string | null;
  currentRole: "staff" | "family" | "resident";
  userRole: "carer" | "manager" | "resident" | "family";
  currentUserId: string | null;
}

export interface FeedActions {
  // Residents
  addResident: (resident: Omit<Resident, "id">) => void;
  updateResident: (resident: Resident) => void;
  setActiveResident: (id: string) => void;

  // Feed
  addFeedItem: (item: Omit<FeedItem, "id" | "createdAt">) => void;
  toggleReaction: (itemId: string) => void;

  // Role & User Management
  switchRole: (role: "staff" | "family" | "resident") => void;
  switchUserRole: (
    userRole: "carer" | "manager" | "resident" | "family"
  ) => void;
  setCurrentUser: (userId: string) => void;
  loginUser: (userId: string) => void;
  getCurrentUser: () => User | null;

  // Store Management
  clearStore: () => void;
  clearAll: () => Promise<void>;

  // Getters
  getResidentById: (id: string) => Resident | undefined;
  getFeedItemsByResident: (residentId: string) => FeedItem[];
  getTodayStats: () => {
    totalUpdates: number;
    byType: Record<string, number>;
    residentsWithNoUpdate: Resident[];
  };
}

// Sample users
const sampleUsers: User[] = [
  {
    id: "skarlette-choi",
    name: "Skarlette Choi",
    role: "staff",
    email: "skarlette.choi@kinloop.com",
  },
  {
    id: "kallen-newick",
    name: "Kallen Newick",
    role: "family",
    email: "kallen.newick@gmail.com",
  },
];

// Sample data
const sampleResidents: Resident[] = [
  { id: "1", name: "Sarah Johnson", room: "101", photoConsent: true },
  { id: "2", name: "Robert Chen", room: "102", photoConsent: false },
  { id: "3", name: "Margaret Davis", room: "103", photoConsent: true },
  { id: "4", name: "James Wilson", room: "104", photoConsent: true },
  {
    id: "5",
    name: "Bob Sargeant",
    room: "105",
    photoConsent: true,
    familyMembers: ["kallen-newick"],
  },
];

const sampleFeedItems: FeedItem[] = [
  {
    id: "1",
    residentId: "1",
    authorId: "skarlette-choi",
    type: "meal",
    text: "Had a great breakfast - oatmeal with berries and toast",
    tags: ["breakfast", "healthy"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 2, reactedByMe: false },
  },
  {
    id: "2",
    residentId: "1",
    authorId: "skarlette-choi",
    type: "activity",
    text: "Morning walk in the garden, 15 minutes",
    tags: ["exercise", "outdoor"],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 1, reactedByMe: false },
  },
  {
    id: "3",
    residentId: "2",
    authorId: "skarlette-choi",
    type: "meds",
    text: "Morning medications administered on time",
    tags: ["medication", "on-time"],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 0, reactedByMe: false },
  },
  {
    id: "4",
    residentId: "2",
    authorId: "skarlette-choi",
    type: "rest",
    text: "Afternoon nap, slept well for 2 hours",
    tags: ["rest", "sleep"],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 1, reactedByMe: false },
  },
  {
    id: "6",
    residentId: "2",
    authorId: "skarlette-choi",
    type: "activity",
    text: "Enjoyed music therapy session, very engaged",
    tags: ["music", "therapy", "engaged"],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 2, reactedByMe: false },
  },
  {
    id: "7",
    residentId: "2",
    authorId: "skarlette-choi",
    type: "meal",
    text: "Lunch went well, ate most of the meal",
    tags: ["lunch", "good-appetite"],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 1, reactedByMe: false },
  },
  {
    id: "5",
    residentId: "3",
    authorId: "skarlette-choi",
    type: "photo",
    text: "Family visit - had a wonderful time with grandchildren",
    tags: ["family", "visit"],
    photoUrl:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 3, reactedByMe: false },
  },
  // Bob Sargeant's feed items
  {
    id: "8",
    residentId: "5",
    authorId: "skarlette-choi",
    type: "meal",
    text: "Enjoyed his favorite pancakes for breakfast this morning",
    tags: ["breakfast", "favorite", "pancakes"],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 1, reactedByMe: false },
  },
  {
    id: "9",
    residentId: "5",
    authorId: "skarlette-choi",
    type: "activity",
    text: "Participated in morning exercises, showed great enthusiasm",
    tags: ["exercise", "morning", "enthusiastic"],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 2, reactedByMe: false },
  },
  {
    id: "10",
    residentId: "5",
    authorId: "skarlette-choi",
    type: "meds",
    text: "Morning medications taken without any issues",
    tags: ["medication", "morning", "compliant"],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 0, reactedByMe: false },
  },
  {
    id: "11",
    residentId: "5",
    authorId: "skarlette-choi",
    type: "photo",
    text: "Bob reading his favorite book in the garden",
    tags: ["reading", "garden", "peaceful"],
    photoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reactions: { heart: 4, reactedByMe: false },
  },
];

// Convert sample data to feed structure
const sampleFeed: Record<string, FeedItem[]> = {};
sampleResidents.forEach((resident) => {
  sampleFeed[resident.id] = sampleFeedItems.filter(
    (item) => item.residentId === resident.id
  );
});

export const useFeedStore = create<FeedState & FeedActions>()(
  persist(
    (set, get) => ({
      // Initial state
      residents: sampleResidents,
      feed: sampleFeed,
      users: sampleUsers,
      currentUser: sampleUsers[0], // Start with Skarlette Choi
      activeResidentId: "2", // Robert Chen for staff default
      currentRole: "staff",
      userRole: "carer",
      currentUserId: "skarlette-choi",

      // Actions
      addResident: (resident) => {
        const newResident = { ...resident, id: generateId() };
        set((state) => ({
          residents: [...state.residents, newResident],
          feed: { ...state.feed, [newResident.id]: [] },
        }));
      },

      updateResident: (resident) => {
        set((state) => ({
          residents: state.residents.map((r) =>
            r.id === resident.id ? resident : r
          ),
        }));
      },

      setActiveResident: (id) => {
        set({ activeResidentId: id });
      },

      addFeedItem: (item) => {
        try {
          if (!item.residentId) {
            throw new Error("Resident ID is required");
          }

          const newFeedItem: FeedItem = {
            ...item,
            id: generateId(),
            createdAt: new Date().toISOString(),
            reactions: { heart: 0, reactedByMe: false },
          };

          set((state) => {
            const updatedFeed = {
              ...state.feed,
              [item.residentId]: [
                newFeedItem,
                ...(state.feed[item.residentId] || []),
              ],
            };
            return { feed: updatedFeed };
          });
        } catch (error) {
          console.error("Store: Error adding feed item:", error);
          throw error;
        }
      },

      toggleReaction: (itemId) => {
        set((state) => {
          const newFeed = { ...state.feed };

          // Find the item and toggle reaction
          Object.keys(newFeed).forEach((residentId) => {
            const items = newFeed[residentId];
            const itemIndex = items.findIndex((item) => item.id === itemId);

            if (itemIndex !== -1) {
              const item = items[itemIndex];
              const currentReactions = item.reactions || {
                heart: 0,
                reactedByMe: false,
              };

              newFeed[residentId] = items.map((feedItem, index) =>
                index === itemIndex
                  ? {
                      ...feedItem,
                      reactions: {
                        heart: currentReactions.reactedByMe
                          ? Math.max(0, currentReactions.heart - 1)
                          : currentReactions.heart + 1,
                        reactedByMe: !currentReactions.reactedByMe,
                      },
                    }
                  : feedItem
              );
            }
          });

          return { feed: newFeed };
        });
      },

      switchRole: (role) => {
        const state = get();
        let newUser: User | null = null;
        let newActiveResident: string | null = null;

        // Auto-login based on role
        if (role === "staff") {
          newUser = state.users.find((u) => u.id === "skarlette-choi") || null;
          newActiveResident = "2"; // Default to Robert Chen for staff
        } else if (role === "family") {
          newUser = state.users.find((u) => u.id === "kallen-newick") || null;
          newActiveResident = "5"; // Bob Sargeant for Kallen
        }

        set({
          currentRole: role,
          currentUser: newUser,
          currentUserId: newUser?.id || null,
          activeResidentId: newActiveResident,
          userRole: role === "staff" ? "carer" : "family",
        });
      },

      switchUserRole: (userRole) => {
        set({ userRole });
      },

      setCurrentUser: (userId) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        set({
          currentUserId: userId,
          currentUser: user || null,
        });
      },

      loginUser: (userId) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          let newActiveResident: string | null = null;

          // Set appropriate resident based on user
          if (user.id === "kallen-newick") {
            newActiveResident = "5"; // Bob Sargeant
          } else if (user.id === "skarlette-choi") {
            newActiveResident = "2"; // Default staff view
          }

          set({
            currentUser: user,
            currentUserId: user.id,
            currentRole: user.role,
            userRole: user.role === "staff" ? "carer" : "family",
            activeResidentId: newActiveResident,
          });
        }
      },

      getCurrentUser: () => {
        return get().currentUser;
      },

      clearStore: () => {
        set({
          residents: sampleResidents,
          feed: sampleFeed,
          users: sampleUsers,
          currentUser: sampleUsers[0],
          activeResidentId: sampleResidents[0]?.id || null,
          currentRole: "staff",
          userRole: "carer",
          currentUserId: "skarlette-choi",
        });
      },

      clearAll: async () => {
        try {
          // Clear AsyncStorage completely
          await AsyncStorage.clear();

          // Also clear the specific store keys
          await AsyncStorage.removeItem("kinloop-store");
          await AsyncStorage.removeItem("kinloop-store-v2");
          await AsyncStorage.removeItem("kinloop-store-v3");

          // Reset store to initial state
          set({
            residents: sampleResidents,
            feed: sampleFeed,
            users: sampleUsers,
            currentUser: sampleUsers[0],
            activeResidentId: sampleResidents[0]?.id || null,
            currentRole: "staff",
            userRole: "carer",
            currentUserId: "skarlette-choi",
          });
        } catch (error) {
          console.error("Error clearing all data:", error);
          throw error;
        }
      },

      // Getters
      getResidentById: (id) => {
        return get().residents.find((resident) => resident.id === id);
      },

      getFeedItemsByResident: (residentId) => {
        return get().feed[residentId] || [];
      },

      getTodayStats: () => {
        const state = get();
        const today = new Date();
        const todayStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        let totalUpdates = 0;
        const byType: Record<string, number> = {};
        const residentsWithUpdates = new Set<string>();

        // Count updates by type and track residents with updates
        Object.values(state.feed).forEach((items) => {
          items.forEach((item) => {
            const itemDate = new Date(item.createdAt);
            // Use toDateString() for more reliable date comparison
            if (itemDate.toDateString() === today.toDateString()) {
              totalUpdates++;
              byType[item.type] = (byType[item.type] || 0) + 1;
              residentsWithUpdates.add(item.residentId);
            }
          });
        });

        // Find residents with no updates today
        const residentsWithNoUpdate = state.residents.filter(
          (resident) => !residentsWithUpdates.has(resident.id)
        );

        return {
          totalUpdates,
          byType,
          residentsWithNoUpdate,
        };
      },
    }),
    {
      name: "kinloop-store-v3", // Changed again to force complete refresh
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
