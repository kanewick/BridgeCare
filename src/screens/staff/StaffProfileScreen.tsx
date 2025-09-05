import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Pressable,
} from "react-native";
import { User, Bug } from "phosphor-react-native";
import { useTabBarHeight } from "../../hooks/useTabBarHeight";
import { useFeedStore } from "../../store/feedStore";

export const StaffProfileScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const { tabBarHeightWithSafeArea } = useTabBarHeight();
  const { switchRole } = useFeedStore();

  const colors = {
    background: colorScheme === "dark" ? "#0f172a" : "#f8fafc",
    card: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    text: colorScheme === "dark" ? "#f8fafc" : "#1e293b",
    textMuted: colorScheme === "dark" ? "#94a3b8" : "#64748b",
    primary: colorScheme === "dark" ? "#38bdf8" : "#0ea5e9",
    border: colorScheme === "dark" ? "#334155" : "#e2e8f0",
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: tabBarHeightWithSafeArea + 20 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <User size={32} color="#ffffff" weight="fill" />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            Skarlette Choi
          </Text>
          <Text style={[styles.role, { color: colors.textMuted }]}>
            Senior Care Assistant
          </Text>
        </View>

        {/* Profile Content */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Profile Information
          </Text>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Department
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              Residential Care
            </Text>
          </View>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Employee ID
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              BC-2024-001
            </Text>
          </View>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Shift
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              Day Shift (7:00 AM - 3:00 PM)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>

          <View
            style={[
              styles.activityCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.activityTitle, { color: colors.text }]}>
              Today's Updates
            </Text>
            <Text style={[styles.activityCount, { color: colors.primary }]}>
              12 updates completed
            </Text>
          </View>

          <View
            style={[
              styles.activityCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.activityTitle, { color: colors.text }]}>
              This Week
            </Text>
            <Text style={[styles.activityCount, { color: colors.primary }]}>
              68 total updates
            </Text>
          </View>
        </View>

        {/* Development Tools */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Development Tools
          </Text>

          <Pressable
            style={[
              styles.devButton,
              { backgroundColor: colors.card, borderColor: "#f59e0b" },
            ]}
            onPress={() => switchRole("family")}
          >
            <Bug size={20} color="#f59e0b" />
            <Text style={[styles.devButtonText, { color: "#f59e0b" }]}>
              Switch to Family Mode
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  role: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    paddingLeft: 4,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  activityCount: {
    fontSize: 16,
    fontWeight: "700",
  },
  devButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  devButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
