import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
import { QuickAction } from "../../data/quickActions";

export type SelectedState = {
  [actionId: string]: {
    variants: string[];
    notes?: string;
    metrics?: { pain?: number; temp?: number; bp?: string; hr?: number };
  };
};

interface ActionTileProps {
  action: QuickAction;
  selected: SelectedState;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  disabled?: boolean;
  testID?: string;
}

export const ActionTile: React.FC<ActionTileProps> = ({
  action,
  selected,
  onToggle,
  onOpen,
  disabled = false,
  testID = `action-tile-${action.id}`,
}) => {
  const scaleAnim = useSharedValue(1);
  const isSelected = Boolean(selected[action.id]);
  const selectedData = selected[action.id];
  const variantCount = selectedData?.variants?.length || 0;

  const handlePress = async () => {
    if (disabled) return;

    // Haptics feedback
    if (Platform.OS === "ios") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Scale animation
    scaleAnim.value = withSpring(0.98, { damping: 20, stiffness: 300 }, () => {
      scaleAnim.value = withSpring(1, { damping: 20, stiffness: 300 });
    });

    onToggle(action.id);
  };

  const handleLongPress = async () => {
    if (disabled) return;

    try {
      // Stronger haptics for long press
      if (Platform.OS === "ios") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      onOpen(action.id);
    } catch (error) {
      // Still call onOpen even if haptics fail
      onOpen(action.id);
    }
  };

  const getVariantPreview = (): string => {
    if (!selectedData?.variants?.length) return "";

    // Show first variant and count if multiple
    const firstVariant =
      action.variants?.find((v) => v.id === selectedData.variants[0])?.label ||
      "";
    const extraCount = selectedData.variants.length - 1;

    if (extraCount > 0) {
      return `${firstVariant} +${extraCount}`;
    }
    return firstVariant;
  };

  const getNotesPreview = (): string => {
    if (!selectedData?.notes) return "";
    return selectedData.notes.length > 20
      ? `${selectedData.notes.substring(0, 20)}...`
      : selectedData.notes;
  };

  const getMetricsPreview = (): string => {
    if (!selectedData?.metrics) return "";
    const { pain, temp, bp, hr } = selectedData.metrics;
    const parts = [];
    if (pain !== undefined) parts.push(`Pain: ${pain}`);
    if (temp !== undefined) parts.push(`Temp: ${temp}°`);
    if (bp) parts.push(`BP: ${bp}`);
    if (hr !== undefined) parts.push(`HR: ${hr}`);
    return parts.join(" · ");
  };

  const getPreviewText = (): string => {
    const parts = [];
    const variantPreview = getVariantPreview();
    const notesPreview = getNotesPreview();
    const metricsPreview = getMetricsPreview();

    if (variantPreview) parts.push(variantPreview);
    if (metricsPreview) parts.push(metricsPreview);
    if (notesPreview) parts.push(notesPreview);

    return parts.join(" · ");
  };

  const getAccessibilityLabel = (): string => {
    const baseLabel = `${action.label}${isSelected ? ", selected" : ""}`;
    const preview = getPreviewText();
    return preview ? `${baseLabel}, ${preview}` : baseLabel;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, styles.container]} testID={testID}>
      <TouchableOpacity
        style={[
          styles.tile,
          isSelected && styles.tileSelected,
          disabled && styles.tileDisabled,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected, disabled }}
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityHint={
          disabled
            ? "This action is not available"
            : "Tap to select, long press for options"
        }
      >
        {/* Emoji Icon */}
        <Text style={styles.emoji}>{action.emoji}</Text>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>
            {action.label}
          </Text>

          {/* Preview text */}
          {isSelected && (
            <Text style={styles.preview} numberOfLines={1}>
              {getPreviewText() || "Selected"}
            </Text>
          )}

          {/* Disabled message */}
          {disabled && action.consentGate === "photo" && (
            <Text style={styles.disabledText} numberOfLines={1}>
              No consent
            </Text>
          )}
        </View>

        {/* Counter chip */}
        {variantCount > 1 && (
          <View style={styles.counterChip}>
            <Text style={styles.counterText}>{variantCount}</Text>
          </View>
        )}

        {/* Options indicator */}
        {(action.variants?.length || 0) > 1 && (
          <View style={styles.optionsIndicator}>
            <Text style={styles.optionsText}>⋯</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    minWidth: 0, // Allow flex shrinking
  },
  tile: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 108,
    position: "relative",
    ...shadow.card,
  },
  tileSelected: {
    backgroundColor: "#E6F6FD", // bg-primary/8
    borderColor: "transparent",
    borderWidth: 2,
    borderStyle: "solid",
  },
  tileDisabled: {
    opacity: 0.5,
    backgroundColor: colors.chipBg,
  },
  emoji: {
    fontSize: 32,
    lineHeight: 36,
    marginBottom: spacing.xs,
  },
  content: {
    flex: 1,
  },
  label: {
    ...theme.typography.bodyMedium,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
  preview: {
    fontSize: 12,
    color: colors.textFaint,
    lineHeight: 16,
  },
  disabledText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  counterChip: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
  },
  optionsIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  optionsText: {
    color: colors.textFaint,
    fontSize: 16,
    fontWeight: "600",
  },
});
