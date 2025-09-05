export const colors = {
  // Background & surfaces
  bg: "#F8FAFB", // Softer off-white with warm undertone
  bgGradient: ["#F8FAFB", "#F1F7FB"], // Subtle warm blue/white gradient
  card: "#FFFFFF",
  cardElevated: "#FFFFFF",

  // Borders & dividers
  border: "#E5EAF0",
  borderLight: "#F1F5F9",

  // Text hierarchy
  text: "#0F172A",
  textMuted: "#475569",
  textFaint: "#64748B",
  textWarm: "#374151",

  // Interactive elements
  primary: "#0EA5E9",
  primaryPressed: "#0284C7",
  primaryFocus: "#93C5FD",
  primarySoft: "#EFF6FF",

  // Warm accent system
  secondary: "#FB923C", // Warm orange
  secondaryPressed: "#EA580C",
  secondarySoft: "#FFF7ED",

  // Status colors with warmth
  success: "#10B981",
  successSoft: "#ECFDF5",
  warning: "#F59E0B",
  warningSoft: "#FFFBEB",
  error: "#EF4444",
  errorSoft: "#FEF2F2",

  // Status-specific accent bars
  statusActive: "#10B981",
  statusInactive: "#6B7280",
  statusRestricted: "#EF4444",

  // Chip system
  chipBg: "#F8FAFC",
  chipBorder: "#E5EAF0",
  chipActive: "#EFF6FF",
  chipActiveBorder: "#0EA5E9",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  // Soft elevated card shadow
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const button = {
  primary: {
    default: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    pressed: {
      backgroundColor: colors.primaryPressed,
      borderColor: colors.primaryPressed,
    },
    disabled: {
      backgroundColor: colors.textFaint,
      borderColor: colors.textFaint,
    },
  },
};

export const chip = {
  activeBg: "#E6F6FD",
  activeBorder: colors.primary,
  inactiveBg: colors.chipBg,
};

export const theme = {
  colors,
  radius,
  spacing,
  shadow,
  button,
  chip,
  typography: {
    // Display styles
    title: {
      fontSize: 28,
      fontWeight: "700",
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    heading: {
      fontSize: 20,
      fontWeight: "700",
      lineHeight: 24,
      letterSpacing: -0.2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      lineHeight: 22,
      letterSpacing: -0.1,
    },

    // Body text
    body: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 22,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: "500",
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 18,
    },

    // Supporting text
    caption: {
      fontSize: 13,
      fontWeight: "400",
      lineHeight: 16,
    },
    captionMedium: {
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 16,
    },

    // Interactive elements
    button: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 18,
      letterSpacing: 0.1,
    },

    // Special styles
    residentName: {
      fontSize: 17,
      fontWeight: "700",
      lineHeight: 22,
      letterSpacing: -0.1,
    },
    roomNumber: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 18,
    },
  },

  // Avatar system
  avatar: {
    sizes: {
      sm: 32,
      md: 48,
      lg: 64,
      xl: 80,
    },
    fallbackColors: [
      "#EF4444",
      "#F97316",
      "#F59E0B",
      "#EAB308",
      "#84CC16",
      "#22C55E",
      "#10B981",
      "#14B8A6",
      "#06B6D4",
      "#0EA5E9",
      "#3B82F6",
      "#6366F1",
      "#8B5CF6",
      "#A855F7",
      "#D946EF",
      "#EC4899",
    ],
  },
} as const;

export type Theme = typeof theme;
