import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, shadow, theme } from "../../theme";

interface FooterActionBarProps {
  primaryText: string;
  primaryDisabled?: boolean;
  onPrimaryPress: () => void;
  showSecondary?: boolean;
  onSecondaryPress?: () => void;
  loading?: boolean;
  testID?: string;
  tabBarHeight?: number;
}

export const FooterActionBar: React.FC<FooterActionBarProps> = ({
  primaryText,
  primaryDisabled = false,
  onPrimaryPress,
  showSecondary = false,
  onSecondaryPress,
  loading = false,
  testID = "footer-action-bar",
  tabBarHeight = 68,
}) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useSharedValue(1);

  const handlePrimaryPress = async () => {
    if (primaryDisabled || loading) return;

    // Haptic feedback
    if (Platform.OS === "ios") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Scale animation
    scaleAnim.value = withSpring(0.95, { damping: 15, stiffness: 200 }, () => {
      scaleAnim.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

    onPrimaryPress();
  };

  const primaryButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const FooterContent = () => (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Secondary Action (if needed) */}
        {showSecondary && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSecondaryPress}
            testID={`${testID}-secondary`}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {/* Primary Action */}
        <Animated.View
          style={[styles.primaryButtonContainer, primaryButtonStyle]}
        >
          <TouchableOpacity
            style={[
              styles.primaryButton,
              primaryDisabled && styles.primaryButtonDisabled,
            ]}
            onPress={handlePrimaryPress}
            disabled={primaryDisabled || loading}
            testID={`${testID}-primary`}
            accessibilityRole="button"
            accessibilityLabel={primaryText}
            accessibilityState={{
              disabled: primaryDisabled || loading,
            }}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons
                  name="hourglass"
                  size={20}
                  color={colors.card}
                  style={styles.loadingIcon}
                />
                <Text style={styles.primaryButtonText}>Posting...</Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.primaryButtonText,
                  primaryDisabled && styles.primaryButtonTextDisabled,
                ]}
              >
                {primaryText}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom + tabBarHeight + 8,
        },
      ]}
      testID={testID}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <FooterContent />
        </BlurView>
      ) : (
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.9)"]}
          style={styles.gradientContainer}
        >
          <FooterContent />
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  blurContainer: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.lg,
  },
  gradientContainer: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.lg,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButtonContainer: {
    flex: 1,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.md,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.textFaint,
    opacity: 0.6,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: colors.card,
    fontSize: 17,
    fontWeight: "700",
  },
  primaryButtonTextDisabled: {
    color: colors.card,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingIcon: {
    opacity: 0.8,
  },
});
