import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import {
  Heart,
  Calendar,
  MapPin,
  Phone,
  Clock,
  Lightning,
} from "phosphor-react-native";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { useFeedStore } from "../../store/feedStore";
import { useAppTheme } from "../../store/themeStore";

export const FamilyResidentProfileScreen: React.FC = () => {
  const { effectiveTheme } = useAppTheme();
  const contentContainerStyle = useContentContainerStyle();
  const { residents, activeResidentId } = useFeedStore();

  // Get the currently selected resident (either active from feed or default to Robert Chen for families)
  const familyResident = residents.find((r) => r.name === "Robert Chen");
  const selectedResident =
    residents.find((r) => r.id === activeResidentId) ||
    familyResident ||
    residents[0];

  const colors = {
    background: effectiveTheme === "dark" ? "#0f172a" : "#f8fafc",
    card: effectiveTheme === "dark" ? "#1e293b" : "#ffffff",
    text: effectiveTheme === "dark" ? "#f8fafc" : "#1e293b",
    textMuted: effectiveTheme === "dark" ? "#94a3b8" : "#64748b",
    primary: effectiveTheme === "dark" ? "#38bdf8" : "#0ea5e9",
    border: effectiveTheme === "dark" ? "#334155" : "#e2e8f0",
    success: effectiveTheme === "dark" ? "#10b981" : "#059669",
  };

  const InfoCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    content: string;
  }> = ({ icon, title, content }) => (
    <View
      style={[
        styles.infoCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.infoHeader}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.infoContent, { color: colors.textMuted }]}>
        {content}
      </Text>
    </View>
  );

  const VitalCard: React.FC<{
    label: string;
    value: string;
    status: "normal" | "attention";
  }> = ({ label, value, status }) => (
    <View
      style={[
        styles.vitalCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.vitalLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.vitalValue, { color: colors.text }]}>{value}</Text>
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: status === "normal" ? colors.success : "#f59e0b" },
        ]}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {selectedResident?.name === "Robert Chen"
                ? "R"
                : selectedResident?.name === "Margaret Davis"
                ? "M"
                : selectedResident?.name?.[0] || "?"}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {selectedResident?.name || "Loading..."}
          </Text>
          <Text style={[styles.room, { color: colors.textMuted }]}>
            {selectedResident?.room
              ? `Room ${selectedResident.room}`
              : "Room assignment pending"}{" "}
            • Residential Care
          </Text>
        </View>

        {/* Quick Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Personal Information
          </Text>

          <InfoCard
            icon={<Calendar size={20} color={colors.primary} />}
            title="Date of Birth"
            content="March 15, 1938 (85 years old)"
          />

          <InfoCard
            icon={<MapPin size={20} color={colors.primary} />}
            title="Home Address"
            content="Originally from Liverpool, moved to care home in January 2023"
          />

          <InfoCard
            icon={<Phone size={20} color={colors.primary} />}
            title="Emergency Contact"
            content="Sarah Johnson (Daughter) - 07812 345 678"
          />
        </View>

        {/* Health Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Health Overview
          </Text>

          <View style={styles.vitalsGrid}>
            <VitalCard label="Blood Pressure" value="120/80" status="normal" />
            <VitalCard label="Heart Rate" value="72 bpm" status="normal" />
            <VitalCard label="Temperature" value="36.5°C" status="normal" />
            <VitalCard label="Weight" value="65 kg" status="normal" />
          </View>
        </View>

        {/* Care Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Care Preferences
          </Text>

          <InfoCard
            icon={<Heart size={20} color={colors.primary} />}
            title="Dietary Requirements"
            content="No specific allergies. Prefers smaller portions. Enjoys tea with every meal."
          />

          <InfoCard
            icon={<Lightning size={20} color={colors.primary} />}
            title="Activities"
            content="Loves music from the 1960s, enjoys gentle walks, likes to read romance novels."
          />

          <InfoCard
            icon={<Clock size={20} color={colors.primary} />}
            title="Daily Routine"
            content="Early riser (7 AM), afternoon nap (2-3 PM), enjoys evening television."
          />
        </View>

        {/* Life Story */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Life Story
          </Text>

          <View
            style={[
              styles.storyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.storyText, { color: colors.textMuted }]}>
              Margaret was a primary school teacher for 40 years and has two
              children - Sarah and Michael. She's a grandmother to four
              grandchildren who visit regularly. Margaret loves gardening and
              has a wealth of knowledge about British flowers. She was married
              to Robert for 52 years before he passed in 2020.
            </Text>
          </View>
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
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  room: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  vitalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  vitalCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    position: "relative",
  },
  vitalLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statusIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  storyText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
