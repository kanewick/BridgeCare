import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, radius, spacing, theme } from "../theme";

interface BadgeProps {
  label: string;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ label, style }) => {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  label: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
    textAlign: "center",
  },
});
