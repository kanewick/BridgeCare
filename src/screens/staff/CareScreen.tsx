import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, theme } from "../../theme";
import { Header } from "../../components/Header";
import { CareDashboardScreen } from "./CareDashboardScreen";
import { CareJournalScreen } from "./CareJournalScreen";
import { CareChecklistsScreen } from "./CareChecklistsScreen";
import { CareLearningScreen } from "./CareLearningScreen";

type TabName = "Dashboard" | "Journal" | "Checklists" | "Learning";

const tabs: { name: TabName; label: string }[] = [
  { name: "Dashboard", label: "Dashboard" },
  { name: "Journal", label: "Journal" },
  { name: "Checklists", label: "Checklists" },
  { name: "Learning", label: "Learning" },
];

export const CareScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>("Dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <CareDashboardScreen />;
      case "Journal":
        return <CareJournalScreen />;
      case "Checklists":
        return <CareChecklistsScreen />;
      case "Learning":
        return <CareLearningScreen />;
      default:
        return <CareDashboardScreen />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Care"
        subtitle="Your shift's care delivery stats & tasks"
        showSettings={true}
      />

      {/* Custom Top Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tabButton,
              activeTab === tab.name && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.name)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.name }}
            accessibilityLabel={`${tab.label} tab`}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.name && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.name && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 48,
  },
  tabButtonActive: {
    // Active tab styling handled by indicator
  },
  tabLabel: {
    ...theme.typography.bodyMedium,
    fontWeight: "500",
    color: colors.textMuted,
    fontSize: 14,
  },
  tabLabelActive: {
    fontWeight: "600",
    color: colors.primary,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: spacing.sm,
    right: spacing.sm,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
});
