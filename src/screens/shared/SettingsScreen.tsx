import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import { colors, radius, spacing, theme } from "../../theme";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { Card } from "../../components/Card";
import { Header } from "../../components/Header";
import { useFeedStore } from "../../store/feedStore";

export const SettingsScreen: React.FC = () => {
  const { currentRole, userRole, switchRole, switchUserRole, clearAll } =
    useFeedStore();
  const [isClearing, setIsClearing] = useState(false);
  const contentContainerStyle = useContentContainerStyle();
  const colorScheme = useColorScheme();

  const dynamicColors = {
    background: colorScheme === "dark" ? "#0f172a" : "#f8fafc",
    card: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    text: colorScheme === "dark" ? "#f8fafc" : "#1e293b",
    textMuted: colorScheme === "dark" ? "#94a3b8" : "#64748b",
    border: colorScheme === "dark" ? "#334155" : "#e2e8f0",
    danger: colorScheme === "dark" ? "#ef4444" : "#dc2626",
    primary: colorScheme === "dark" ? "#38bdf8" : "#0ea5e9",
  };

  const handleRoleSwitch = () => {
    if (currentRole === "staff") {
      switchRole("family");
    } else if (currentRole === "family") {
      switchRole("resident");
    } else {
      switchRole("staff");
    }
  };

  const handleUserRoleSwitch = () => {
    if (userRole === "carer") {
      switchUserRole("manager");
    } else if (userRole === "manager") {
      switchUserRole("resident");
    } else if (userRole === "resident") {
      switchUserRole("family");
    } else {
      switchUserRole("carer");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear Local Data",
      "This will remove all saved data including residents and feed items. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            try {
              // Clear all data including AsyncStorage
              await clearAll();

              // Show success message
              Alert.alert(
                "Data Cleared",
                "All local data has been cleared and reset to default values.",
                [{ text: "OK" }]
              );
            } catch (error) {
              Alert.alert("Error", "Failed to clear data. Please try again.");
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const appVersion = "1.0.0"; // This would come from app.json in a real app

  return (
    <View style={styles.container}>
      <Header title="Settings" subtitle="App preferences and configuration" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={contentContainerStyle}
      >
        {/* App Info */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: dynamicColors.card,
              borderColor: dynamicColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: dynamicColors.text }]}>
            App Information
          </Text>
          <View
            style={[
              styles.infoRow,
              { borderBottomColor: dynamicColors.border },
            ]}
          >
            <Text
              style={[styles.infoLabel, { color: dynamicColors.textMuted }]}
            >
              Version
            </Text>
            <Text style={[styles.infoValue, { color: dynamicColors.text }]}>
              {appVersion}
            </Text>
          </View>
          <View
            style={[
              styles.infoRow,
              { borderBottomColor: dynamicColors.border },
            ]}
          >
            <Text
              style={[styles.infoLabel, { color: dynamicColors.textMuted }]}
            >
              View Mode
            </Text>
            <Text style={[styles.infoValue, { color: dynamicColors.text }]}>
              {currentRole === "staff"
                ? "👨‍⚕️ Staff"
                : currentRole === "family"
                ? "👨‍👩‍👧‍👦 Family"
                : "👤 Resident"}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: "transparent" }]}>
            <Text
              style={[styles.infoLabel, { color: dynamicColors.textMuted }]}
            >
              User Role
            </Text>
            <Text style={[styles.infoValue, { color: dynamicColors.text }]}>
              {userRole === "carer"
                ? "👨‍⚕️ Carer"
                : userRole === "manager"
                ? "👔 Manager"
                : userRole === "resident"
                ? "👤 Resident"
                : "👨‍👩‍👧‍👦 Family"}
            </Text>
          </View>
        </View>

        {/* Data Management */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: dynamicColors.card,
              borderColor: dynamicColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: dynamicColors.text }]}>
            Data Management
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: dynamicColors.textMuted },
            ]}
          >
            Manage local data stored on this device.
          </Text>
          <TouchableOpacity
            style={[
              styles.dangerButton,
              { backgroundColor: dynamicColors.danger },
              isClearing && { backgroundColor: dynamicColors.textMuted },
            ]}
            onPress={handleClearData}
            disabled={isClearing}
          >
            <Text style={styles.dangerButtonText}>
              {isClearing ? "Clearing..." : "Clear All Local Data"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: dynamicColors.card,
              borderColor: dynamicColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: dynamicColors.text }]}>
            About BridgeCare
          </Text>
          <Text style={[styles.aboutText, { color: dynamicColors.textMuted }]}>
            BridgeCare is a comprehensive care management app designed to keep
            families connected with their loved ones in care facilities.
          </Text>
          <Text style={[styles.aboutText, { color: dynamicColors.textMuted }]}>
            Staff can quickly log daily activities, meals, medications, and
            more, while families can stay updated through a real-time feed.
            Residents can also share updates directly with their families.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  dangerButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
});
