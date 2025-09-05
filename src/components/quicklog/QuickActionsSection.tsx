import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { colors, radius, spacing, shadow, theme } from "../../theme";
import { QuickAction } from "../../data/quickActions";
import { ActionTile, SelectedState } from "./ActionTile";

interface QuickActionsSectionProps {
  title: string;
  actions: QuickAction[];
  selected: SelectedState;
  onToggle: (actionId: string) => void;
  onOpen: (actionId: string) => void;
  hasPhotoConsent?: boolean; // For gating photo actions
  testID?: string;
}

const { width: screenWidth } = Dimensions.get("window");

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  title,
  actions,
  selected,
  onToggle,
  onOpen,
  hasPhotoConsent = true,
  testID = `section-${title.toLowerCase().replace(/\s+/g, "-")}`,
}) => {
  // Calculate grid columns based on screen width
  const getNumColumns = (): number => {
    if (screenWidth >= 768) return 3; // Wide screens (tablets)
    return 2; // Phones
  };

  const numColumns = getNumColumns();

  // Check if action should be disabled
  const isActionDisabled = (action: QuickAction): boolean => {
    if (action.consentGate === "photo" && !hasPhotoConsent) {
      return true;
    }
    return false;
  };

  // Group actions into rows for the grid
  const groupActionsIntoRows = (actions: QuickAction[]) => {
    const rows = [];
    for (let i = 0; i < actions.length; i += numColumns) {
      rows.push(actions.slice(i, i + numColumns));
    }
    return rows;
  };

  const actionRows = groupActionsIntoRows(actions);

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.grid}>
        {actionRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((action, colIndex) => (
              <View
                key={action.id}
                style={[
                  styles.tileContainer,
                  { width: `${100 / numColumns}%` },
                ]}
              >
                <ActionTile
                  action={action}
                  selected={selected}
                  onToggle={onToggle}
                  onOpen={onOpen}
                  disabled={isActionDisabled(action)}
                  testID={`${testID}-tile-${action.id}`}
                />
              </View>
            ))}
            {/* Fill remaining spaces in the last row to maintain alignment */}
            {row.length < numColumns &&
              Array.from({ length: numColumns - row.length }).map(
                (_, index) => (
                  <View
                    key={`empty-${rowIndex}-${index}`}
                    style={[
                      styles.tileContainer,
                      { width: `${100 / numColumns}%` },
                    ]}
                  />
                )
              )}
          </View>
        ))}
      </View>
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
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    marginHorizontal: -spacing.xs, // Negative margin to account for tile margins
  },
  tileContainer: {
    paddingHorizontal: spacing.xs, // Half of the desired gap between tiles
  },
});
