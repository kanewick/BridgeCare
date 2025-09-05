import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, radius, spacing, shadow, theme } from "../../theme";
import { QuickAction, getActionById } from "../../data/quickActions";

export interface RecentAction {
  actionId: string;
  variant?: string;
  timestamp: number;
}

interface RecentsRowProps {
  recents: RecentAction[];
  onSelectRecent: (actionId: string, variant?: string) => void;
  testID?: string;
}

const RecentChip: React.FC<{
  recent: RecentAction;
  onPress: () => void;
  testID: string;
}> = ({ recent, onPress, testID }) => {
  const scaleAnim = useSharedValue(1);
  const action = getActionById(recent.actionId);

  if (!action) return null;

  const handlePress = async () => {
    // Haptics feedback
    if (Platform.OS === "ios") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Scale animation
    scaleAnim.value = withSpring(0.95, { damping: 20, stiffness: 300 }, () => {
      scaleAnim.value = withSpring(1, { damping: 20, stiffness: 300 });
    });

    onPress();
  };

  const getVariantLabel = (): string => {
    if (!recent.variant) return "";
    const variant = action.variants?.find((v) => v.id === recent.variant);
    return variant?.label || "";
  };

  const getDisplayText = (): string => {
    const variantLabel = getVariantLabel();
    return variantLabel ? `${action.label}: ${variantLabel}` : action.label;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.chip}
        onPress={handlePress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Recent action: ${getDisplayText()}`}
        accessibilityHint="Tap to apply this recent action"
      >
        <Text style={styles.emoji}>{action.emoji}</Text>
        <View style={styles.chipContent}>
          <Text style={styles.chipLabel} numberOfLines={1}>
            {action.label}
          </Text>
          {getVariantLabel() && (
            <Text style={styles.chipVariant} numberOfLines={1}>
              {getVariantLabel()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const RecentsRow: React.FC<RecentsRowProps> = ({
  recents,
  onSelectRecent,
  testID = "recents-row",
}) => {
  const handleSelectRecent = (recent: RecentAction) => {
    onSelectRecent(recent.actionId, recent.variant);
  };

  const renderRecent = ({
    item,
    index,
  }: {
    item: RecentAction;
    index: number;
  }) => (
    <RecentChip
      recent={item}
      onPress={() => handleSelectRecent(item)}
      testID={`${testID}-chip-${index}`}
    />
  );

  if (!recents.length) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>Recents</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Recent actions will appear here after you post updates
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>Recents</Text>
      <FlatList
        horizontal
        data={recents}
        renderItem={renderRecent}
        keyExtractor={(item, index) =>
          `${item.actionId}-${item.variant || "default"}-${index}`
        }
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
      />
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
  listContainer: {
    paddingRight: spacing.lg, // Extra padding at end
  },
  emptyContainer: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.textFaint,
    textAlign: "center",
    fontStyle: "italic",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44, // Accessibility requirement
    maxWidth: 160, // Prevent chips from getting too wide
  },
  emoji: {
    fontSize: 16,
    lineHeight: 20,
    marginRight: spacing.xs,
  },
  chipContent: {
    flex: 1,
    minWidth: 0, // Allow text to truncate
  },
  chipLabel: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "500",
    lineHeight: 16,
  },
  chipVariant: {
    fontSize: 11,
    color: colors.textFaint,
    lineHeight: 13,
    marginTop: 1,
  },
});
