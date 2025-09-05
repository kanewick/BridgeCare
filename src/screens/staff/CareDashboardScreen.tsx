import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, radius, spacing, theme } from "../../theme";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { Card } from "../../components/Card";
import { IconDisplay } from "../../components/IconDisplay";

// Mock data for KPIs and charts
const mockKPIData = {
  checklistCompletion: {
    value: 72,
    label: "Checklist Completion",
    trend: "+5%",
  },
  overdueTasks: { value: 3, label: "Overdue Tasks", trend: "-2" },
  journalEntries: { value: 8, label: "Journal Entries Today", trend: "+2" },
  learningProgress: {
    value: 4,
    label: "Modules Completed This Week",
    trend: "+1",
  },
  residentWellbeing: {
    value: 85,
    label: "Positive Moods Logged",
    trend: "+8%",
  },
};

const mockChecklistTrend = [
  { day: "Mon", completion: 68 },
  { day: "Tue", completion: 75 },
  { day: "Wed", completion: 72 },
  { day: "Thu", completion: 80 },
  { day: "Fri", completion: 76 },
  { day: "Sat", completion: 78 },
  { day: "Sun", completion: 72 },
];

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: string;
  icon: string;
  iconEmoji: string;
  onPress: () => void;
  trendColor?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconEmoji,
  onPress,
  trendColor = colors.success,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <View style={styles.kpiIconContainer}>
          <IconDisplay
            emoji={iconEmoji}
            icon={icon}
            size={20}
            useIcons={true}
            color={colors.primary}
          />
        </View>
        {trend && (
          <Text style={[styles.kpiTrend, { color: trendColor }]}>{trend}</Text>
        )}
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
      {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: string;
  iconEmoji: string;
  onPress: () => void;
  color: string;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  title,
  subtitle,
  icon,
  iconEmoji,
  onPress,
  color,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + "20" }]}>
        <IconDisplay
          emoji={iconEmoji}
          icon={icon}
          size={24}
          useIcons={true}
          color={color}
        />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ChecklistTrendChart: React.FC = () => {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - spacing.lg * 2 - spacing.md * 2;
  const chartHeight = 120;
  const maxValue = Math.max(...mockChecklistTrend.map((d) => d.completion));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>7-Day Checklist Completion Trend</Text>
      <View style={styles.chartContent}>
        <View style={styles.chart}>
          {mockChecklistTrend.map((point, index) => {
            const barHeight =
              (point.completion / maxValue) * (chartHeight - 40);
            return (
              <View key={point.day} style={styles.chartBarContainer}>
                <View style={styles.chartValueContainer}>
                  <Text style={styles.chartValue}>{point.completion}%</Text>
                </View>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: barHeight,
                      backgroundColor:
                        index === mockChecklistTrend.length - 1
                          ? colors.primary
                          : colors.secondary,
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{point.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export const CareDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const contentContainerStyle = useContentContainerStyle();

  const handleKPIPress = (type: string) => {
    switch (type) {
      case "checklist":
        // Navigate to Checklists tab
        console.log("Navigate to Checklists");
        break;
      case "overdue":
        // Navigate to overdue tasks
        console.log("Navigate to overdue tasks");
        break;
      case "journal":
        // Navigate to Journal tab
        console.log("Navigate to Journal");
        break;
      case "learning":
        // Navigate to Learning tab
        console.log("Navigate to Learning");
        break;
      case "wellbeing":
        // Navigate to wellbeing reports
        console.log("Navigate to wellbeing reports");
        break;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "journal":
        console.log("Add Journal Entry");
        break;
      case "checklist":
        console.log("Go to Today's Checklist");
        break;
      case "learning":
        console.log("Start Featured Lesson");
        break;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
    >
      {/* KPI Cards */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <Text style={styles.sectionSubtitle}>
          Key performance indicators for your shift
        </Text>
        <View style={styles.kpiGrid}>
          <KPICard
            title="Checklist Completion"
            value="72%"
            subtitle="of today's care tasks done"
            trend="+5%"
            icon="checkbox-outline"
            iconEmoji="✅"
            onPress={() => handleKPIPress("checklist")}
          />
          <KPICard
            title="Overdue Tasks"
            value={mockKPIData.overdueTasks.value}
            subtitle="missed or late items"
            trend={mockKPIData.overdueTasks.trend}
            icon="alert-circle-outline"
            iconEmoji="⚠️"
            onPress={() => handleKPIPress("overdue")}
            trendColor={colors.warning}
          />
        </View>
        <View style={styles.kpiGrid}>
          <KPICard
            title="Journal Entries"
            value={mockKPIData.journalEntries.value}
            subtitle="handovers/notes logged"
            trend={mockKPIData.journalEntries.trend}
            icon="book-outline"
            iconEmoji="📝"
            onPress={() => handleKPIPress("journal")}
          />
          <KPICard
            title="Learning Progress"
            value={mockKPIData.learningProgress.value}
            subtitle="modules completed this week"
            trend={mockKPIData.learningProgress.trend}
            icon="school-outline"
            iconEmoji="🎓"
            onPress={() => handleKPIPress("learning")}
          />
        </View>
      </Card>

      {/* Chart Section */}
      <Card style={styles.section}>
        <ChecklistTrendChart />
      </Card>

      {/* Quick Actions */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSubtitle}>
          Jump to key care delivery tasks
        </Text>
        <View style={styles.quickActionsContainer}>
          <QuickActionCard
            title="Add Journal Entry"
            subtitle="Log handover notes"
            icon="add-outline"
            iconEmoji="✍️"
            color={colors.primary}
            onPress={() => handleQuickAction("journal")}
          />
          <QuickActionCard
            title="Today's Checklist"
            subtitle="View care tasks"
            icon="list-outline"
            iconEmoji="📋"
            color={colors.secondary}
            onPress={() => handleQuickAction("checklist")}
          />
          <QuickActionCard
            title="Start Featured Lesson"
            subtitle="Continue training"
            icon="play-outline"
            iconEmoji="🎯"
            color={colors.success}
            onPress={() => handleQuickAction("learning")}
          />
        </View>
      </Card>

      {/* Notifications/Alerts */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts & Announcements</Text>
        <View style={styles.alertContainer}>
          <View style={styles.criticalAlert}>
            <IconDisplay
              emoji="🚨"
              icon="warning-outline"
              size={20}
              useIcons={true}
              color={colors.error}
            />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                Medication Checklist Overdue
              </Text>
              <Text style={styles.alertSubtitle}>
                Room 12A - Evening meds due 30 minutes ago
              </Text>
            </View>
          </View>
          <View style={styles.announcement}>
            <IconDisplay
              emoji="📢"
              icon="megaphone-outline"
              size={20}
              useIcons={true}
              color={colors.info}
            />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Manager Announcement</Text>
              <Text style={styles.alertSubtitle}>
                Fire drill scheduled for 2:00 PM today
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...theme.typography.bodyMedium,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  // KPI Cards
  kpiGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  kpiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  kpiTrend: {
    ...theme.typography.caption,
    fontWeight: "600",
    fontSize: 12,
  },
  kpiValue: {
    ...theme.typography.h2,
    color: colors.text,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  kpiTitle: {
    ...theme.typography.bodyMedium,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  kpiSubtitle: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },

  // Chart
  chartContainer: {
    paddingBottom: spacing.md,
  },
  chartTitle: {
    ...theme.typography.bodyLarge,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },
  chartContent: {
    alignItems: "center",
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    height: 120,
    paddingHorizontal: spacing.sm,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 2,
  },
  chartValueContainer: {
    marginBottom: spacing.xs,
    height: 20,
    justifyContent: "center",
  },
  chartValue: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  chartBar: {
    width: "100%",
    borderRadius: radius.xs,
    minHeight: 8,
  },
  chartLabel: {
    ...theme.typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: 10,
  },

  // Quick Actions
  quickActionsContainer: {
    gap: spacing.md,
  },
  quickActionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    ...theme.typography.bodyLarge,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  quickActionSubtitle: {
    ...theme.typography.bodyMedium,
    color: colors.textMuted,
  },

  // Alerts
  alertContainer: {
    gap: spacing.md,
  },
  criticalAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  announcement: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.infoSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  alertContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  alertTitle: {
    ...theme.typography.bodyMedium,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  alertSubtitle: {
    ...theme.typography.bodyMedium,
    color: colors.textMuted,
  },
});
