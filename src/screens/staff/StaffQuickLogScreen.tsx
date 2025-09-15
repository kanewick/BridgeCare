import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { colors, spacing, theme } from "../../theme";
import { Header } from "../../components/Header";
import { ResidentPickerModal } from "../../components/quicklog/ResidentPickerModal";
import { ActivitiesTab } from "../../components/quicklog/ActivitiesTab";
import { ChecklistsTab } from "../../components/quicklog/ChecklistsTab";
import { ShiftJournalTab } from "../../components/quicklog/ShiftJournalTab";
import { LearningTab } from "../../components/quicklog/LearningTab";
import { useFeedStore } from "../../store/feedStore";

type QuickLogTabName = "activities" | "checklists" | "journal" | "learning";

const tabs: { name: QuickLogTabName; label: string }[] = [
  { name: "activities", label: "Activities" },
  { name: "checklists", label: "Checklists" },
  { name: "journal", label: "Journal" },
  { name: "learning", label: "Learning" },
];

interface RouteParams {
  residentId?: string;
  preselectedAction?: string;
  batchResidents?: string[];
}

export const StaffQuickLogScreen: React.FC = () => {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;

  const { residents, activeResidentId, setActiveResident } = useFeedStore();

  // Recent residents (for resident picker)
  const recentResidentIds = React.useMemo(() => {
    return residents.slice(0, 3).map((r) => r.id);
  }, [residents]);

  // Tab state
  const [activeTab, setActiveTab] = useState<QuickLogTabName>("activities");

  // Modal state
  const [showResidentPicker, setShowResidentPicker] = useState(false);

  // Handle navigation parameters
  useEffect(() => {
    if (params?.residentId && params.residentId !== activeResidentId) {
      setActiveResident(params.residentId);
    }

    // If there's a preselected action, ensure we're on the activities tab
    if (params?.preselectedAction) {
      setActiveTab("activities");
    }
  }, [params, activeResidentId, setActiveResident]);

  // Get selected resident
  const selectedResident = residents.find((r) => r.id === activeResidentId);

  const handleResidentSelect = (residentId: string) => {
    setActiveResident(residentId);
  };

  const handleHeaderPress = () => {
    setShowResidentPicker(true);
  };

  const handleTabChange = (tab: QuickLogTabName) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "activities":
        return (
          <ActivitiesTab
            residentId={activeResidentId}
            testID="activities-tab-content"
          />
        );
      case "checklists":
        return (
          <ChecklistsTab
            residentId={activeResidentId}
            testID="checklists-tab-content"
          />
        );
      case "journal":
        return (
          <ShiftJournalTab
            residentId={activeResidentId}
            testID="journal-tab-content"
          />
        );
      case "learning":
        return <LearningTab testID="learning-tab-content" />;
      default:
        return null;
    }
  };

  // Main render function
  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <Header
          title="Quick Log"
          subtitle={
            selectedResident
              ? `${selectedResident.name} • ${
                  activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                }`
              : "Select a resident to get started"
          }
          showSettings={true}
          onPress={handleHeaderPress}
        />
      </View>

      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <View style={styles.content}>
            {/* Custom Top Tab Bar */}
            <View style={styles.tabBar}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.name}
                  style={[
                    styles.tabButton,
                    activeTab === tab.name && styles.tabButtonActive,
                  ]}
                  onPress={() => handleTabChange(tab.name)}
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
                  {activeTab === tab.name && (
                    <View style={styles.tabIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>{renderTabContent()}</View>
          </View>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>

      {/* Resident Picker Modal */}
      <ResidentPickerModal
        visible={showResidentPicker}
        onClose={() => setShowResidentPicker(false)}
        residents={residents}
        selectedResidentId={activeResidentId}
        onSelectResident={handleResidentSelect}
        recentResidentIds={recentResidentIds}
        testID="quick-log-resident-picker-modal"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerWrapper: {
    backgroundColor: colors.card,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
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
  tabContent: {
    flex: 1,
  },
});
