import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, theme } from "../../theme";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { Card } from "../../components/Card";

export const CareJournalScreen: React.FC = () => {
  const contentContainerStyle = useContentContainerStyle();

  return (
    <View style={[styles.container, contentContainerStyle]}>
      <Card style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Journal</Text>
        <Text style={styles.placeholderText}>
          Coming soon: Handover notes, shift logs, and care observations
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  placeholderCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  placeholderTitle: {
    ...theme.typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  placeholderText: {
    ...theme.typography.bodyLarge,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
  },
});
