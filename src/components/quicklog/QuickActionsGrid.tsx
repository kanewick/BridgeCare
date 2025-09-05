import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
// import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, radius, spacing, shadow, theme } from "../../theme";
import {
  QUICK_ACTIONS as CENTRAL_ACTIONS,
  QuickAction as CentralQuickAction,
} from "../../data/quickActions";
import { IconDisplay } from "../IconDisplay";

type QuickActionType =
  | "meal"
  | "activity"
  | "meds"
  | "rest"
  | "bathroom"
  | "hygiene"
  | "dressing"
  | "mobility"
  | "hydration"
  | "mood"
  | "vitals"
  | "pain"
  | "social"
  | "family"
  | "wound-care"
  | "photo";

interface QuickAction {
  id: QuickActionType;
  label: string;
  emoji: string;
  icon?: string;
  variants?: string[];
}

interface QuickActionsGridProps {
  selectedActions: QuickActionType[];
  onToggleAction: (actionId: QuickActionType, variant?: string) => void;
  selectedVariants: Record<QuickActionType, string>;
  testID?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "meal",
    label: "Meal",
    emoji: "🍽️",
    icon: "restaurant-outline",
    variants: ["Breakfast", "Lunch", "Dinner", "Snack"],
  },
  {
    id: "activity",
    label: "Activity",
    emoji: "🏃",
    icon: "fitness-outline",
    variants: ["Walk", "Stretch", "Games", "Outing"],
  },
  {
    id: "meds",
    label: "Meds",
    emoji: "💊",
    icon: "medical-outline",
    variants: ["Given", "Refused", "Missed"],
  },
  {
    id: "rest",
    label: "Rest",
    emoji: "😴",
    icon: "bed-outline",
    variants: ["Nap", "Overnight"],
  },
  {
    id: "bathroom",
    label: "Bathroom",
    emoji: "🚻",
    icon: "body-outline",
    variants: ["Toilet", "Continence change"],
  },
  {
    id: "hygiene",
    label: "Hygiene",
    emoji: "🧼",
    icon: "brush-outline",
    variants: ["Shower", "Bath", "Teeth", "Hair"],
  },
  {
    id: "dressing",
    label: "Dressing",
    emoji: "👕",
    icon: "person-outline",
  },
  {
    id: "mobility",
    label: "Mobility",
    emoji: "🚶",
    icon: "walk-outline",
    variants: ["Independent", "Assisted", "Device"],
  },
  {
    id: "hydration",
    label: "Hydration",
    emoji: "💧",
    icon: "water-outline",
  },
  {
    id: "mood",
    label: "Mood",
    emoji: "😊",
    icon: "happy-outline",
    variants: ["Happy", "Calm", "Anxious", "Upset"],
  },
  {
    id: "vitals",
    label: "Vitals",
    emoji: "🩺",
    icon: "pulse-outline",
    variants: ["Temp", "BP", "HR"],
  },
  {
    id: "pain",
    label: "Pain",
    emoji: "🩹",
    icon: "alert-circle-outline",
    variants: ["0 - No pain", "1-3 - Mild", "4-6 - Moderate", "7-10 - Severe"],
  },
  {
    id: "social",
    label: "Social",
    emoji: "👥",
    icon: "chatbubbles-outline",
    variants: ["Group", "One-to-one"],
  },
  {
    id: "family",
    label: "Family",
    emoji: "👨‍👩‍👧‍👦",
    icon: "people-outline",
    variants: ["Call", "Visit"],
  },
  {
    id: "wound-care",
    label: "Wound Care",
    emoji: "🩹",
    icon: "medical-outline",
  },
  {
    id: "photo",
    label: "Photo",
    emoji: "📸",
    icon: "camera-outline",
  },
];

const ActionPill: React.FC<{
  action: QuickAction;
  isSelected: boolean;
  selectedVariant?: string;
  onPress: () => void;
  onLongPress?: () => void;
  testID: string;
}> = ({
  action,
  isSelected,
  selectedVariant,
  onPress,
  onLongPress,
  testID,
}) => {
  const scaleAnim = useSharedValue(1);

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    scaleAnim.value = withSpring(0.95, { damping: 20, stiffness: 300 }, () => {
      scaleAnim.value = withSpring(1, { damping: 20, stiffness: 300 });
    });

    onPress();
  }, [onPress]);

  const handleLongPress = useCallback(async () => {
    if (onLongPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  }, [onLongPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.pill, isSelected && styles.pillSelected]}
        onPress={handlePress}
        onLongPress={action.variants ? handleLongPress : undefined}
        delayLongPress={500}
        testID={testID}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${action.label}${
          selectedVariant ? ` - ${selectedVariant}` : ""
        }`}
        accessibilityHint={
          action.variants ? "Long press for options" : undefined
        }
      >
        <IconDisplay
          emoji={action.emoji}
          icon={action.icon}
          size={16}
          useIcons={true}
        />
        <Text
          style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}
        >
          {action.label}
        </Text>
        {selectedVariant && (
          <Text style={styles.pillVariant}>{selectedVariant}</Text>
        )}
        {action.variants && (
          <Ionicons
            name="ellipsis-horizontal"
            size={12}
            color={isSelected ? colors.primary : colors.textMuted}
            style={styles.pillDots}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  selectedActions,
  onToggleAction,
  selectedVariants,
  testID = "quick-actions-grid",
}) => {
  // const [variantBottomSheet, setVariantBottomSheet] =
  //   useState<BottomSheetModal | null>(null);
  // const [selectedActionForVariant, setSelectedActionForVariant] =
  //   useState<QuickAction | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const itemWidth = (screenWidth - spacing.lg * 2 - spacing.md) / 2; // 2 columns with spacing

  const handleActionPress = useCallback(
    (action: QuickAction) => {
      // For now, just toggle the action without variants
      // TODO: Implement variant selection with modal or alert
      onToggleAction(action.id, undefined);
    },
    [onToggleAction]
  );

  const handleActionLongPress = useCallback((action: QuickAction) => {
    // For now, show a simple alert for variants
    if (action.variants && action.variants.length > 0) {
      // Could implement Alert.alert with options here
    }
  }, []);

  const renderAction = useCallback(
    ({ item }: { item: QuickAction }) => {
      const isSelected = selectedActions.includes(item.id);
      const selectedVariant = selectedVariants[item.id];

      return (
        <View style={[styles.pillContainer, { width: itemWidth }]}>
          <ActionPill
            action={item}
            isSelected={isSelected}
            selectedVariant={selectedVariant}
            onPress={() => handleActionPress(item)}
            onLongPress={() => handleActionLongPress(item)}
            testID={`${testID}-${item.id}`}
          />
        </View>
      );
    },
    [
      selectedActions,
      selectedVariants,
      handleActionPress,
      handleActionLongPress,
      itemWidth,
      testID,
    ]
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {selectedActions.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{selectedActions.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={QUICK_ACTIONS}
        renderItem={renderAction}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
      />

      {/* TODO: Add variant selection modal */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    ...theme.typography.caption,
    color: colors.card,
    fontWeight: "700",
    fontSize: 12,
  },
  grid: {
    gap: spacing.sm,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  pillContainer: {
    flex: 1,
  },
  pill: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    minHeight: 80,
    justifyContent: "center",
    ...shadow.sm,
  },
  pillSelected: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pillLabel: {
    ...theme.typography.bodyMedium,
    color: colors.text,
    textAlign: "center",
    fontWeight: "600",
  },
  pillLabelSelected: {
    color: colors.primary,
  },
  pillVariant: {
    ...theme.typography.caption,
    color: colors.primary,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  pillDots: {
    marginTop: spacing.xs,
    opacity: 0.6,
  },
  bottomSheetBackground: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  bottomSheetHandle: {
    backgroundColor: colors.border,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bottomSheetTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  variantOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  variantOptionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  variantOptionText: {
    ...theme.typography.body,
    color: colors.text,
  },
  variantOptionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});
