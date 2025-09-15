import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { colors, spacing, radius, theme } from "../../theme";
import { IconDisplay } from "../IconDisplay";
import { Card } from "../Card";
import { useFeedStore } from "../../store/feedStore";
import { useChecklistStore } from "../../store/checklistStore";
import {
  ChecklistItem,
  ChecklistCompletion,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  getCurrentShift,
  getRelevantChecklistItems,
  getChecklistItemsByCategory,
  calculateCompletionPercentage,
  getTotalEstimatedTime,
} from "../../data/checklists";

interface ChecklistsTabProps {
  residentId: string | null;
  testID?: string;
}

interface ChecklistItemCardProps {
  item: ChecklistItem;
  completion?: ChecklistCompletion;
  onToggle: (item: ChecklistItem, completed: boolean, skip?: boolean) => void;
  canComplete: boolean;
}

const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({
  item,
  completion,
  onToggle,
  canComplete,
}) => {
  const isCompleted = completion && !completion.skipped;
  const isSkipped = completion?.skipped;

  const handlePress = () => {
    if (isCompleted || isSkipped) {
      // Allow unchecking
      onToggle(item, false);
    } else if (canComplete) {
      onToggle(item, true);
    }
  };

  const handleSkip = () => {
    if (item.required) {
      Alert.alert(
        "Skip Required Task",
        `Are you sure you want to skip "${item.label}"? This is a required care task.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Skip",
            style: "destructive",
            onPress: () => onToggle(item, false, true),
          },
        ]
      );
    } else {
      onToggle(item, false, true);
    }
  };

  return (
    <Card
      style={[
        styles.itemCard,
        isCompleted && styles.completedCard,
        isSkipped && styles.skippedCard,
        !canComplete && !isCompleted && styles.disabledCard,
      ]}
    >
      <View style={styles.itemHeader}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            isCompleted && styles.completedCheckbox,
            isSkipped && styles.skippedCheckbox,
          ]}
          onPress={handlePress}
          disabled={!canComplete && !isCompleted && !isSkipped}
        >
          {isCompleted && (
            <IconDisplay
              emoji="✅"
              icon="checkmark"
              size={16}
              color={colors.success}
              useIcons={true}
            />
          )}
          {isSkipped && (
            <IconDisplay
              emoji="⏭️"
              icon="play-skip-forward"
              size={16}
              color={colors.warning}
              useIcons={true}
            />
          )}
        </TouchableOpacity>

        <View style={styles.itemContent}>
          <View style={styles.itemTitleRow}>
            <IconDisplay
              emoji={item.emoji}
              icon={item.icon}
              size={18}
              color={isCompleted ? colors.success : colors.primary}
            />
            <Text
              style={[
                styles.itemTitle,
                isCompleted && styles.completedText,
                isSkipped && styles.skippedText,
              ]}
            >
              {item.label}
              {item.required && (
                <Text style={styles.requiredIndicator}> *</Text>
              )}
            </Text>
            {item.estimatedMinutes && (
              <Text style={styles.timeEstimate}>
                {item.estimatedMinutes}min
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.itemDescription,
              isCompleted && styles.completedText,
              isSkipped && styles.skippedText,
            ]}
          >
            {item.description}
          </Text>
          {completion && (
            <Text style={styles.completionTime}>
              {isSkipped ? "Skipped" : "Completed"} at{" "}
              {new Date(completion.completedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>

        {!isCompleted && !isSkipped && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const CategorySection: React.FC<{
  category: keyof typeof CATEGORY_LABELS;
  items: ChecklistItem[];
  completions: ChecklistCompletion[];
  onToggle: (item: ChecklistItem, completed: boolean, skip?: boolean) => void;
}> = ({ category, items, completions, onToggle }) => {
  const completionPercentage = calculateCompletionPercentage(
    completions.filter((c) => items.some((item) => item.id === c.itemId)),
    items
  );

  const totalTime = getTotalEstimatedTime(items);

  const canCompleteItem = (item: ChecklistItem): boolean => {
    if (!item.dependencies || item.dependencies.length === 0) return true;

    return item.dependencies.every((depId) =>
      completions.some((c) => c.itemId === depId && !c.skipped)
    );
  };

  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category]}</Text>
        <View style={styles.categoryStats}>
          <Text style={styles.categoryCompletion}>{completionPercentage}%</Text>
          {totalTime > 0 && (
            <Text style={styles.categoryTime}>~{totalTime}min</Text>
          )}
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${completionPercentage}%` }]}
        />
      </View>

      {items.map((item) => {
        const completion = completions.find((c) => c.itemId === item.id);
        const canComplete = canCompleteItem(item);

        return (
          <ChecklistItemCard
            key={item.id}
            item={item}
            completion={completion}
            onToggle={(item, completed, skip) =>
              onToggle(item, completed, skip)
            }
            canComplete={canComplete}
          />
        );
      })}
    </View>
  );
};

export const ChecklistsTab: React.FC<ChecklistsTabProps> = ({
  residentId,
  testID = "checklists-tab",
}) => {
  const { currentUserId } = useFeedStore();
  const {
    getChecklistItems,
    getCompletionsForResident,
    addCompletion,
    removeCompletion,
    getCompletionProgress,
  } = useChecklistStore();

  const currentShift = getCurrentShift();
  const checklistItems = getChecklistItems();
  const relevantItems = getRelevantChecklistItems(currentShift);

  // Get completions for current resident and date
  const completions = residentId ? getCompletionsForResident(residentId) : [];
  const progress = residentId
    ? getCompletionProgress(residentId)
    : {
        percentage: 0,
        completed: 0,
        total: relevantItems.length,
      };

  const overallCompletion = progress.percentage;

  const handleToggleItem = (
    item: ChecklistItem,
    completed: boolean,
    skip: boolean = false
  ) => {
    if (!residentId || !currentUserId) return;

    const existingCompletion = completions.find((c) => c.itemId === item.id);

    if (completed && !existingCompletion) {
      // Add completion
      addCompletion({
        itemId: item.id,
        residentId,
        staffId: currentUserId,
        skipped: false,
      });
    } else if (skip && !existingCompletion) {
      // Add skip
      addCompletion({
        itemId: item.id,
        residentId,
        staffId: currentUserId,
        skipped: true,
      });
    } else if (!completed && existingCompletion) {
      // Remove completion/skip
      removeCompletion(existingCompletion.id);
    }
  };

  if (!residentId) {
    return (
      <View style={styles.container} testID={testID}>
        <Card style={styles.emptyCard}>
          <IconDisplay emoji="👤" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Select a Resident</Text>
          <Text style={styles.emptyText}>
            Choose a resident to view their daily checklist
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} testID={testID}>
      {/* Overall Progress Card */}
      <Card style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <IconDisplay
            emoji="📋"
            icon="list-outline"
            size={24}
            color={colors.primary}
          />
          <View style={styles.overviewText}>
            <Text style={styles.overviewTitle}>
              {currentShift.charAt(0).toUpperCase() + currentShift.slice(1)}{" "}
              Shift
            </Text>
            <Text style={styles.overviewSubtitle}>
              {overallCompletion}% complete • {relevantItems.length} tasks
            </Text>
          </View>
          <View style={styles.overviewProgress}>
            <Text
              style={[
                styles.overviewPercentage,
                overallCompletion === 100 && styles.completedPercentage,
              ]}
            >
              {overallCompletion}%
            </Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${overallCompletion}%` }]}
          />
        </View>
      </Card>

      {/* Category Sections */}
      {CATEGORY_ORDER.filter((category) => {
        const items = getChecklistItemsByCategory(category);
        if (currentShift === "night") {
          return category === "prn";
        }
        return category === currentShift || category === "prn";
      }).map((category) => {
        const items = getChecklistItemsByCategory(category);
        return (
          <CategorySection
            key={category}
            category={category}
            items={items}
            completions={completions}
            onToggle={handleToggleItem}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  overviewCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  overviewText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  overviewProgress: {
    alignItems: "flex-end",
  },
  overviewPercentage: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
  completedPercentage: {
    color: colors.success,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  categorySection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  categoryStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryCompletion: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginRight: spacing.sm,
  },
  categoryTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  itemCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  completedCard: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    borderWidth: 1,
  },
  skippedCard: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderWidth: 1,
  },
  disabledCard: {
    opacity: 0.5,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginTop: 2,
  },
  completedCheckbox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  skippedCheckbox: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  itemContent: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  requiredIndicator: {
    color: colors.error,
  },
  timeEstimate: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.chipBg,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  completionTime: {
    fontSize: 12,
    color: colors.textFaint,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  completedText: {
    color: colors.textFaint,
  },
  skippedText: {
    color: colors.textFaint,
    textDecorationLine: "line-through",
  },
  skipButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.chipBg,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  skipText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  emptyCard: {
    margin: spacing.lg,
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
