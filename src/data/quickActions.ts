export type Variant = {
  id: string;
  label: string;
  default?: boolean;
};

export type QuickAction = {
  id: string;
  label: string;
  emoji: string;
  category: "essentials" | "care" | "wellbeing" | "clinical";
  variants?: Variant[];
  cycle?: string[]; // order to cycle on tap
  consentGate?: "photo"; // disable if resident prohibits
};

export const QUICK_ACTIONS: QuickAction[] = [
  // ESSENTIALS
  {
    id: "meal",
    label: "Meal",
    emoji: "🍽️",
    category: "essentials",
    variants: [
      { id: "breakfast", label: "Breakfast", default: true },
      { id: "lunch", label: "Lunch" },
      { id: "dinner", label: "Dinner" },
      { id: "snack", label: "Snack" },
      { id: "drinks", label: "Drinks" },
    ],
    cycle: ["breakfast", "lunch", "dinner"],
  },
  {
    id: "meds",
    label: "Meds",
    emoji: "💊",
    category: "essentials",
    variants: [
      { id: "given", label: "Given", default: true },
      { id: "refused", label: "Refused" },
      { id: "missed", label: "Missed" },
      { id: "delayed", label: "Delayed" },
    ],
  },
  {
    id: "bathroom",
    label: "Bathroom",
    emoji: "🚻",
    category: "essentials",
    variants: [
      { id: "toilet", label: "Toilet", default: true },
      { id: "continence", label: "Continence change" },
      { id: "assisted", label: "Assisted" },
    ],
  },
  {
    id: "rest",
    label: "Rest",
    emoji: "😴",
    category: "essentials",
    variants: [
      { id: "nap", label: "Nap", default: true },
      { id: "overnight", label: "Overnight" },
    ],
  },
  {
    id: "hydration",
    label: "Hydration",
    emoji: "💧",
    category: "essentials",
    variants: [
      { id: "water", label: "Water", default: true },
      { id: "juice", label: "Juice" },
      { id: "tea-coffee", label: "Tea/Coffee" },
    ],
  },

  // CARE & MOBILITY
  {
    id: "hygiene",
    label: "Hygiene",
    emoji: "🧼",
    category: "care",
    variants: [
      { id: "shower", label: "Shower", default: true },
      { id: "bath", label: "Bath" },
      { id: "teeth", label: "Teeth" },
      { id: "hair", label: "Hair" },
      { id: "nail-care", label: "Nail care" },
    ],
  },
  {
    id: "dressing",
    label: "Dressing",
    emoji: "👕",
    category: "care",
    variants: [
      { id: "independent", label: "Independent", default: true },
      { id: "assisted", label: "Assisted" },
    ],
  },
  {
    id: "mobility",
    label: "Mobility",
    emoji: "🚶",
    category: "care",
    variants: [
      { id: "independent", label: "Independent", default: true },
      { id: "assisted", label: "Assisted" },
      { id: "device", label: "Device (Walker/Chair)" },
    ],
  },
  {
    id: "wound-care",
    label: "Wound Care",
    emoji: "🩹",
    category: "care",
    variants: [
      { id: "check", label: "Check", default: true },
      { id: "clean-dress", label: "Clean & Dress" },
      { id: "photo-taken", label: "Photo taken" },
    ],
  },

  // WELLBEING
  {
    id: "activity",
    label: "Activity",
    emoji: "🎯",
    category: "wellbeing",
    variants: [
      { id: "walk", label: "Walk", default: true },
      { id: "stretch", label: "Stretch" },
      { id: "games", label: "Games" },
      { id: "outing", label: "Outing" },
    ],
  },
  {
    id: "mood",
    label: "Mood",
    emoji: "🙂",
    category: "wellbeing",
    variants: [
      { id: "happy", label: "Happy", default: true },
      { id: "calm", label: "Calm" },
      { id: "anxious", label: "Anxious" },
      { id: "upset", label: "Upset" },
      { id: "agitated", label: "Agitated" },
    ],
  },
  {
    id: "social",
    label: "Social",
    emoji: "🗣️",
    category: "wellbeing",
    variants: [
      { id: "group", label: "Group", default: true },
      { id: "one-to-one", label: "One-to-one" },
      { id: "community", label: "Community" },
    ],
  },
  {
    id: "family",
    label: "Family",
    emoji: "👪",
    category: "wellbeing",
    variants: [
      { id: "call", label: "Call", default: true },
      { id: "visit", label: "Visit" },
      { id: "message", label: "Message" },
    ],
  },

  // CLINICAL
  {
    id: "vitals",
    label: "Vitals",
    emoji: "🩺",
    category: "clinical",
    variants: [
      { id: "temp", label: "Temp" },
      { id: "bp", label: "BP" },
      { id: "hr", label: "HR" },
    ],
  },
  {
    id: "pain",
    label: "Pain",
    emoji: "❤️‍🩹",
    category: "clinical",
    variants: [
      { id: "pain-0", label: "0 - No pain", default: true },
      { id: "pain-1-3", label: "1-3 - Mild" },
      { id: "pain-4-6", label: "4-6 - Moderate" },
      { id: "pain-7-10", label: "7-10 - Severe" },
    ],
  },
  {
    id: "photo",
    label: "Photo",
    emoji: "📷",
    category: "clinical",
    consentGate: "photo",
  },
];

export const CATEGORY_LABELS = {
  essentials: "Essentials",
  care: "Care & Mobility",
  wellbeing: "Wellbeing",
  clinical: "Clinical",
} as const;

export const CATEGORY_ORDER: Array<keyof typeof CATEGORY_LABELS> = [
  "essentials",
  "care",
  "wellbeing",
  "clinical",
];

// Helper functions
export const getActionById = (id: string): QuickAction | undefined => {
  return QUICK_ACTIONS.find((action) => action.id === id);
};

export const getActionsByCategory = (
  category: QuickAction["category"]
): QuickAction[] => {
  return QUICK_ACTIONS.filter((action) => action.category === category);
};

export const getDefaultVariant = (action: QuickAction): Variant | undefined => {
  return action.variants?.find((variant) => variant.default);
};

export const getNextCycleVariant = (
  action: QuickAction,
  currentVariantId: string
): string | undefined => {
  if (!action.cycle) return undefined;
  const currentIndex = action.cycle.indexOf(currentVariantId);
  if (currentIndex === -1) return action.cycle[0];
  return action.cycle[(currentIndex + 1) % action.cycle.length];
};
