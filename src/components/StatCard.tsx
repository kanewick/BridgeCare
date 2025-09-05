import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, theme } from "../theme";

interface StatCardProps {
  number: number;
  label: string;
  color?: string;
  indicatorColor?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  number,
  label,
  color = colors.primary,
  indicatorColor,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      {indicatorColor && (
        <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
      )}
      <Text style={[styles.number, { color }]}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    minWidth: "30%",
    flex: 1,
    position: "relative",
    paddingTop: spacing.xs,
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -20,
    width: 40,
    height: 3,
    borderRadius: radius.pill,
  },
  number: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 36,
    marginTop: spacing.xs,
  },
  label: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
    fontWeight: "500",
  },
  subtitle: {
    ...theme.typography.caption,
    color: colors.textFaint,
    textAlign: "center",
    marginTop: 2,
  },
});
