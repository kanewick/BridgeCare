import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, theme, shadow } from "../theme";
import { IconDisplay } from "./IconDisplay";

export interface QuickAddAction {
  id: string;
  label: string;
  emoji: string;
  icon?: string;
  color?: string;
}

interface QuickAddDropdownProps {
  onActionSelect: (actionId: string) => void;
  testID?: string;
  style?: any;
}

// Most common actions (80% usage) - shown at top
const PRIMARY_ACTIONS: QuickAddAction[] = [
  {
    id: "meal",
    label: "Meal",
    emoji: "🍽️",
    icon: "restaurant-outline",
    color: colors.secondary,
  },
  {
    id: "meds",
    label: "Meds",
    emoji: "💊",
    icon: "medical-outline",
    color: "#8B5CF6",
  },
  {
    id: "bathroom",
    label: "Bathroom",
    emoji: "🚻",
    icon: "body-outline",
    color: "#F59E0B",
  },
  {
    id: "rest",
    label: "Rest",
    emoji: "😴",
    icon: "bed-outline",
    color: "#6366F1",
  },
];

// Secondary actions - shown below primary
const SECONDARY_ACTIONS: QuickAddAction[] = [
  {
    id: "activity",
    label: "Activity",
    emoji: "🏃",
    icon: "fitness-outline",
    color: "#10B981",
  },
  {
    id: "hygiene",
    label: "Hygiene",
    emoji: "🧼",
    icon: "brush-outline",
    color: "#06B6D4",
  },
  {
    id: "hydration",
    label: "Drinks",
    emoji: "💧",
    icon: "water-outline",
    color: "#3B82F6",
  },
  {
    id: "vitals",
    label: "Vitals",
    emoji: "🩺",
    icon: "pulse-outline",
    color: "#EC4899",
  },
];

export const QuickAddDropdown: React.FC<QuickAddDropdownProps> = ({
  onActionSelect,
  testID,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [buttonLayout, setButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const buttonRef = useRef<TouchableOpacity>(null);

  const handleButtonPress = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setButtonLayout({ x, y, width, height });
        setIsVisible(true);
      });
    }
  };

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    // Show visual feedback briefly before proceeding
    setTimeout(() => {
      setIsVisible(false);
      setSelectedAction(null);
      onActionSelect(actionId);
    }, 150); // Brief confirmation feedback
  };

  const allActions = [...PRIMARY_ACTIONS, ...SECONDARY_ACTIONS];
  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
  const dropdownHeight = Math.min(280, allActions.length * 56 + 80); // Cap height with maxHeight
  const dropdownWidth = 180; // Increased width to prevent text wrapping

  const spaceBelow = buttonLayout
    ? screenHeight - buttonLayout.y - buttonLayout.height
    : 0;
  const spaceAbove = buttonLayout ? buttonLayout.y : 0;

  // Determine if we should show above or below
  const showAbove =
    buttonLayout &&
    spaceBelow < dropdownHeight + 20 &&
    spaceAbove > dropdownHeight + 20;

  // Calculate top position
  const dropdownTop = buttonLayout
    ? showAbove
      ? Math.max(20, buttonLayout.y - dropdownHeight - 8)
      : buttonLayout.y + buttonLayout.height + 8
    : 0;

  // Calculate left position (align to right edge of button, but keep on screen)
  const dropdownLeft = buttonLayout
    ? Math.min(
        screenWidth - dropdownWidth - 10, // Don't go off right edge
        Math.max(10, buttonLayout.x + buttonLayout.width - dropdownWidth) // Don't go off left edge
      )
    : 0;

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={[styles.quickAddButton, style]}
        onPress={handleButtonPress}
        testID={testID}
      >
        <Text style={styles.quickAddText}>+ Add</Text>
        <Ionicons
          name="chevron-down"
          size={12}
          color={colors.card}
          style={styles.chevronIcon}
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsVisible(false)}
        >
          {buttonLayout && (
            <View
              style={[
                styles.dropdown,
                {
                  top: dropdownTop,
                  left: dropdownLeft,
                  width: dropdownWidth,
                },
              ]}
            >
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {/* Primary Actions - Most Common */}
                <Text style={styles.sectionHeader}>Most Common</Text>
                {PRIMARY_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionItem,
                      styles.primaryActionItem,
                      selectedAction === action.id && styles.actionItemSelected,
                    ]}
                    onPress={() => handleActionSelect(action.id)}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        styles.primaryIconContainer,
                        { backgroundColor: action.color + "20" },
                      ]}
                    >
                      <IconDisplay
                        emoji={action.emoji}
                        icon={action.icon}
                        size={18}
                        color={action.color}
                        useIcons={true}
                      />
                    </View>
                    <Text
                      style={[styles.actionLabel, styles.primaryActionLabel]}
                    >
                      {action.label}
                    </Text>
                    {selectedAction === action.id && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.success}
                      />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Secondary Actions */}
                <Text style={styles.sectionHeader}>Other Actions</Text>
                {SECONDARY_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionItem,
                      selectedAction === action.id && styles.actionItemSelected,
                    ]}
                    onPress={() => handleActionSelect(action.id)}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: action.color + "20" },
                      ]}
                    >
                      <IconDisplay
                        emoji={action.emoji}
                        icon={action.icon}
                        size={18}
                        color={action.color}
                        useIcons={true}
                      />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    {selectedAction === action.id && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.success}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  quickAddButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 32,
    ...shadow.sm,
  },
  quickAddText: {
    ...theme.typography.caption,
    color: colors.card,
    fontWeight: "600",
    marginRight: spacing.xs,
  },
  chevronIcon: {
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.lg,
    maxHeight: 280,
  },
  scrollView: {
    padding: spacing.sm,
  },
  sectionHeader: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    minHeight: 48, // Better tap target
  },
  primaryActionItem: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryFocus,
  },
  actionItemSelected: {
    backgroundColor: colors.success + "15",
    borderWidth: 1,
    borderColor: colors.success,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  primaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
  },
  actionEmoji: {
    fontSize: 18,
  },
  actionLabel: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  primaryActionLabel: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
});
