export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  emoji: string;
  icon?: string;
  category: "morning" | "afternoon" | "evening" | "prn"; // PRN = as needed
  required: boolean;
  estimatedMinutes?: number;
  dependencies?: string[]; // Other checklist item IDs that must be completed first
}

export interface ChecklistCompletion {
  id: string;
  itemId: string;
  residentId: string;
  staffId: string;
  completedAt: string;
  notes?: string;
  skipped?: boolean;
  skipReason?: string;
}

export interface ShiftJournalEntry {
  id: string;
  residentId?: string; // Optional - can be general shift notes
  staffId: string;
  shift: "morning" | "afternoon" | "evening" | "night";
  content: string;
  isHandover: boolean; // Flag for handover-specific notes
  priority: "low" | "normal" | "high" | "urgent";
  tags?: string[];
  createdAt: string;
  audioUrl?: string; // For voice notes
}

// Daily care checklist items
export const DAILY_CHECKLIST_ITEMS: ChecklistItem[] = [
  // Morning (6am - 12pm)
  {
    id: "morning-vitals",
    label: "Morning Vitals",
    description: "Check temperature, BP, heart rate",
    emoji: "🩺",
    icon: "pulse-outline",
    category: "morning",
    required: true,
    estimatedMinutes: 5,
  },
  {
    id: "morning-meds",
    label: "Morning Medications",
    description: "Administer prescribed morning medications",
    emoji: "💊",
    icon: "medical-outline",
    category: "morning",
    required: true,
    estimatedMinutes: 10,
    dependencies: ["morning-vitals"],
  },
  {
    id: "breakfast-assist",
    label: "Breakfast Assistance",
    description: "Assist with breakfast and document intake",
    emoji: "🍽️",
    icon: "restaurant-outline",
    category: "morning",
    required: true,
    estimatedMinutes: 30,
  },
  {
    id: "morning-hygiene",
    label: "Morning Hygiene",
    description: "Assist with washing, teeth, grooming",
    emoji: "🧼",
    icon: "brush-outline",
    category: "morning",
    required: true,
    estimatedMinutes: 20,
  },
  {
    id: "morning-mobility",
    label: "Mobility Check",
    description: "Assess mobility and assist with movement",
    emoji: "🚶",
    icon: "walk-outline",
    category: "morning",
    required: true,
    estimatedMinutes: 10,
  },
  {
    id: "hydration-morning",
    label: "Morning Hydration",
    description: "Encourage and monitor fluid intake",
    emoji: "💧",
    icon: "water-outline",
    category: "morning",
    required: true,
    estimatedMinutes: 5,
  },

  // Afternoon (12pm - 6pm)
  {
    id: "lunch-assist",
    label: "Lunch Assistance",
    description: "Assist with lunch and document intake",
    emoji: "🥙",
    icon: "restaurant-outline",
    category: "afternoon",
    required: true,
    estimatedMinutes: 30,
  },
  {
    id: "afternoon-meds",
    label: "Afternoon Medications",
    description: "Administer prescribed afternoon medications",
    emoji: "💊",
    icon: "medical-outline",
    category: "afternoon",
    required: false,
    estimatedMinutes: 5,
  },
  {
    id: "afternoon-activity",
    label: "Afternoon Activity",
    description: "Participate in scheduled activities",
    emoji: "🎨",
    icon: "color-palette-outline",
    category: "afternoon",
    required: false,
    estimatedMinutes: 45,
  },
  {
    id: "hydration-afternoon",
    label: "Afternoon Hydration",
    description: "Continue monitoring fluid intake",
    emoji: "💧",
    icon: "water-outline",
    category: "afternoon",
    required: true,
    estimatedMinutes: 5,
  },

  // Evening (6pm - 12am)
  {
    id: "dinner-assist",
    label: "Dinner Assistance",
    description: "Assist with dinner and document intake",
    emoji: "🍽️",
    icon: "restaurant-outline",
    category: "evening",
    required: true,
    estimatedMinutes: 30,
  },
  {
    id: "evening-meds",
    label: "Evening Medications",
    description: "Administer prescribed evening medications",
    emoji: "💊",
    icon: "medical-outline",
    category: "evening",
    required: true,
    estimatedMinutes: 5,
  },
  {
    id: "evening-hygiene",
    label: "Evening Hygiene",
    description: "Assist with evening personal care",
    emoji: "🛁",
    icon: "brush-outline",
    category: "evening",
    required: true,
    estimatedMinutes: 15,
  },
  {
    id: "bedtime-prep",
    label: "Bedtime Preparation",
    description: "Assist with getting ready for bed",
    emoji: "😴",
    icon: "bed-outline",
    category: "evening",
    required: true,
    estimatedMinutes: 15,
  },

  // PRN (As Needed)
  {
    id: "prn-pain-assess",
    label: "Pain Assessment",
    description: "Assess pain levels if requested",
    emoji: "❤️‍🩹",
    icon: "alert-circle-outline",
    category: "prn",
    required: false,
    estimatedMinutes: 5,
  },
  {
    id: "prn-bathroom",
    label: "Bathroom Assistance",
    description: "Assist with toileting as needed",
    emoji: "🚻",
    icon: "body-outline",
    category: "prn",
    required: false,
    estimatedMinutes: 10,
  },
  {
    id: "prn-emotional",
    label: "Emotional Support",
    description: "Provide comfort and reassurance",
    emoji: "💝",
    icon: "heart-outline",
    category: "prn",
    required: false,
    estimatedMinutes: 15,
  },
];

export const CATEGORY_LABELS = {
  morning: "Morning (6am - 12pm)",
  afternoon: "Afternoon (12pm - 6pm)",
  evening: "Evening (6pm - 12am)",
  prn: "As Needed (PRN)",
} as const;

export const CATEGORY_ORDER: Array<keyof typeof CATEGORY_LABELS> = [
  "morning",
  "afternoon",
  "evening",
  "prn",
];

// Helper functions
export const getChecklistItemById = (id: string): ChecklistItem | undefined => {
  return DAILY_CHECKLIST_ITEMS.find((item) => item.id === id);
};

export const getChecklistItemsByCategory = (
  category: ChecklistItem["category"]
): ChecklistItem[] => {
  return DAILY_CHECKLIST_ITEMS.filter((item) => item.category === category);
};

export const getCurrentShift = ():
  | "morning"
  | "afternoon"
  | "evening"
  | "night" => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 24) return "evening";
  return "night";
};

export const getRelevantChecklistItems = (
  shift: "morning" | "afternoon" | "evening" | "night"
): ChecklistItem[] => {
  if (shift === "night") {
    // Night shift sees PRN items only
    return getChecklistItemsByCategory("prn");
  }
  return getChecklistItemsByCategory(shift);
};

export const calculateCompletionPercentage = (
  completions: ChecklistCompletion[],
  relevantItems: ChecklistItem[]
): number => {
  const requiredItems = relevantItems.filter((item) => item.required);
  if (requiredItems.length === 0) return 100;

  const completedRequired = completions.filter((completion) => {
    const item = getChecklistItemById(completion.itemId);
    return item?.required && !completion.skipped;
  });

  return Math.round((completedRequired.length / requiredItems.length) * 100);
};

export const getTotalEstimatedTime = (items: ChecklistItem[]): number => {
  return items.reduce((total, item) => total + (item.estimatedMinutes || 0), 0);
};
