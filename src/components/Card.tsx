import React from "react";
import { View, StyleProp, ViewStyle, StyleSheet } from "react-native";
import { colors, radius, spacing, shadow } from "../theme";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = "md",
}) => {
  const paddingStyle = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  }[padding];

  return (
    <View style={[styles.card, { padding: paddingStyle }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
});
