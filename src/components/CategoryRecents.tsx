import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, theme } from "../theme";
import { IconDisplay } from "./IconDisplay";

interface CategoryRecentProps {
  category: string;
  emoji: string;
  icon?: string;
  lastAction?: {
    variant: string;
    time: string;
    residentName?: string;
  };
  totalToday: number;
}

interface CategoryRecentsProps {
  recents: CategoryRecentProps[];
}

const CategoryRecentItem: React.FC<CategoryRecentProps> = ({
  category,
  emoji,
  icon,
  lastAction,
  totalToday,
}) => {
  const getTimeAgo = (timeString: string) => {
    const now = new Date();
    const time = new Date(timeString);
    const diffMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return "Yesterday";
  };

  return (
    <View style={styles.categoryItem}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTitle}>
          <IconDisplay emoji={emoji} icon={icon} size={20} useIcons={true} />
          <Text style={styles.categoryName}>{category}</Text>
        </View>
        <View style={styles.categoryCount}>
          <Text style={styles.countNumber}>{totalToday}</Text>
          <Text style={styles.countLabel}>today</Text>
        </View>
      </View>

      {lastAction ? (
        <View style={styles.lastActionInfo}>
          <Text style={styles.lastActionText}>
            Last: {lastAction.variant} • {getTimeAgo(lastAction.time)}
          </Text>
          {lastAction.residentName && (
            <Text style={styles.lastActionResident}>
              {lastAction.residentName}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.noActionText}>No activities yet today</Text>
      )}
    </View>
  );
};

export const CategoryRecents: React.FC<CategoryRecentsProps> = ({
  recents,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity by Type</Text>
      <Text style={styles.sectionSubtitle}>
        Quick overview of what's been logged across categories
      </Text>

      <View style={styles.categoriesGrid}>
        {recents.map((recent, index) => (
          <CategoryRecentItem key={`${recent.category}-${index}`} {...recent} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryItem: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minWidth: "47%",
    flex: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  categoryTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  categoryName: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
  },
  categoryCount: {
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  countNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    lineHeight: 20,
  },
  countLabel: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  lastActionInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  lastActionText: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
    marginBottom: 2,
  },
  lastActionResident: {
    ...theme.typography.caption,
    color: colors.textFaint,
    fontSize: 11,
    fontStyle: "italic",
  },
  noActionText: {
    ...theme.typography.caption,
    color: colors.warning,
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
});
