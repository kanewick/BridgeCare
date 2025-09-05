import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, shadow } from "../../theme";

interface StickyFooterProps {
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryDisabled?: boolean;
  contextPreview?: string;
  testID?: string;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled = false,
  primaryLoading = false,
  secondaryLabel,
  onSecondaryPress,
  secondaryDisabled = false,
  contextPreview,
  testID = "sticky-footer",
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          marginBottom: insets.bottom + 8,
        },
      ]}
      testID={testID}
    >
      {/* Context Preview */}
      {contextPreview && (
        <View style={styles.contextPreview}>
          <Text style={styles.contextText} numberOfLines={1}>
            {contextPreview}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {secondaryLabel && onSecondaryPress && (
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              secondaryDisabled && styles.secondaryButtonDisabled,
            ]}
            onPress={onSecondaryPress}
            disabled={secondaryDisabled}
            accessibilityRole="button"
            accessibilityLabel={secondaryLabel}
            testID={`${testID}-secondary`}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                secondaryDisabled && styles.secondaryButtonTextDisabled,
              ]}
            >
              {secondaryLabel}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            primaryDisabled && styles.primaryButtonDisabled,
          ]}
          onPress={onPrimaryPress}
          disabled={primaryDisabled}
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
          testID={`${testID}-primary`}
        >
          {primaryLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.primaryButtonText}>Loading...</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.primaryButtonText,
                primaryDisabled && styles.primaryButtonTextDisabled,
              ]}
            >
              {primaryLabel}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.lg,
  },
  contextPreview: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
  },
  contextText: {
    fontSize: 14,
    color: colors.textFaint,
    textAlign: "center",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  primaryButtonTextDisabled: {
    color: "#FFFFFF",
  },
  secondaryButton: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  secondaryButtonTextDisabled: {
    color: colors.textFaint,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
