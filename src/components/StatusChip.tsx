import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, theme } from "../theme";

export type StatusType = "active" | "inactive" | "restricted";

interface StatusChipProps {
  status: StatusType;
  label?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label }) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "active":
        return {
          backgroundColor: colors.successSoft,
          borderColor: colors.success,
          textColor: colors.success,
          label: label || "Active",
        };
      case "inactive":
        return {
          backgroundColor: colors.chipBg,
          borderColor: colors.border,
          textColor: colors.textMuted,
          label: label || "Inactive",
        };
      case "restricted":
        return {
          backgroundColor: colors.errorSoft,
          borderColor: colors.error,
          textColor: colors.error,
          label: label || "Restricted",
        };
      default:
        return {
          backgroundColor: colors.chipBg,
          borderColor: colors.border,
          textColor: colors.textMuted,
          label: label || "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <Text style={[styles.label, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  label: {
    ...theme.typography.captionMedium,
    fontSize: 12,
    fontWeight: "600",
  },
});
