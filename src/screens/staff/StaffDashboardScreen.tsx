import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, radius, spacing, theme, shadow } from "../../theme";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { Card } from "../../components/Card";
import { Header } from "../../components/Header";
import { StatCard } from "../../components/StatCard";
import { ResidentStatusCard } from "../../components/ResidentStatusCard";
import { CategoryRecents } from "../../components/CategoryRecents";
import { IconDisplay } from "../../components/IconDisplay";
import { useFeedStore } from "../../store/feedStore";
import { getAuthorName } from "../../lib/feedUtils";

export const StaffDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { getTodayStats, setActiveResident, feed, residents } = useFeedStore();
  const contentContainerStyle = useContentContainerStyle();

  // Get real-time stats every time the component renders
  const stats = getTodayStats();

  // Get all posts made today by staff
  const todayPosts = Object.values(feed)
    .flat()
    .filter((item) => {
      const today = new Date();
      const itemDate = new Date(item.createdAt);
      return itemDate.toDateString() === today.toDateString();
    });

  // Filter state for today's posts
  const [selectedPostType, setSelectedPostType] = useState<string>("all");

  // Filter posts based on selected type
  const filteredPosts =
    selectedPostType === "all"
      ? todayPosts
      : todayPosts.filter((post) => post.type === selectedPostType);

  const handleGoToQuickLog = () => {
    // Navigate to Quick Log tab
    (navigation as any).navigate("StaffTabs", { screen: "QuickLog" });
  };

  const handleResidentTap = (residentId: string) => {
    setActiveResident(residentId);
    // Navigate to Quick Log with resident preselected
    (navigation as any).navigate("StaffTabs", { screen: "QuickLog" });
  };

  const handleQuickAdd = (residentId: string, actionId: string) => {
    setActiveResident(residentId);
    // Navigate to Quick Log with resident and action preselected
    (navigation as any).navigate("StaffTabs", {
      screen: "QuickLog",
      params: {
        residentId: residentId,
        preselectedAction: actionId,
      },
    });
  };

  // Get current shift info (in real app, this would come from staff data/auth)
  const getCurrentShiftInfo = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 14) {
      return { name: "Morning Shift", time: "6am – 2pm" };
    } else if (currentHour >= 14 && currentHour < 22) {
      return { name: "Evening Shift", time: "2pm – 10pm" };
    } else {
      return { name: "Night Shift", time: "10pm – 6am" };
    }
  };

  // Simple current shift calculation
  const getCurrentShift = (): "morning" | "afternoon" | "evening" | "night" => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    if (hour >= 18 && hour < 24) return "evening";
    return "night";
  };

  const currentShift = getCurrentShift();

  // Simple action data for professional icons
  const getActionData = (actionId: string) => {
    const actionMap: Record<
      string,
      { id: string; label: string; emoji: string; icon: string }
    > = {
      meal: {
        id: "meal",
        label: "Meal",
        emoji: "🍽️",
        icon: "restaurant-outline",
      },
      meds: {
        id: "meds",
        label: "Medication",
        emoji: "💊",
        icon: "medical-outline",
      },
      activity: {
        id: "activity",
        label: "Activity",
        emoji: "🏃",
        icon: "walk-outline",
      },
      rest: { id: "rest", label: "Rest", emoji: "😴", icon: "bed-outline" },
      bathroom: {
        id: "bathroom",
        label: "Bathroom",
        emoji: "🚻",
        icon: "water-outline",
      },
      hygiene: {
        id: "hygiene",
        label: "Hygiene",
        emoji: "🧼",
        icon: "sparkles-outline",
      },
    };

    return (
      actionMap[actionId] || {
        id: actionId,
        label: actionId,
        emoji: "📝",
        icon: "document-outline",
      }
    );
  };

  const typeLabels: Record<string, string> = {
    meal: "Meal",
    activity: "Activity",
    meds: "Meds",
    rest: "Rest",
    bathroom: "Bathroom",
    hygiene: "Hygiene",
    dressing: "Dressing",
    mobility: "Mobility",
    photo: "Photo",
    note: "Note",
  };

  // Type colors for stat indicators
  const typeColors: Record<string, string> = {
    meal: colors.secondary,
    activity: "#10B981",
    meds: "#8B5CF6",
    rest: "#6366F1",
    bathroom: "#F59E0B",
    hygiene: "#06B6D4",
    dressing: "#EC4899",
    mobility: "#84CC16",
    photo: "#3B82F6",
    note: "#64748B",
  };

  // Generate category recents data
  const categoryRecents = useMemo(() => {
    const categories = [
      "meal",
      "meds",
      "bathroom",
      "rest",
      "activity",
      "hygiene",
    ];
    return categories
      .map((category) => {
        const categoryPosts = todayPosts.filter(
          (post) => post.type === category
        );
        const lastPost = categoryPosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        const actionData = getActionData(category);
        return {
          category: typeLabels[category] || category,
          emoji: actionData.emoji,
          icon: actionData.icon,
          lastAction: lastPost
            ? {
                variant: lastPost.tags[0] || "Logged",
                time: lastPost.createdAt,
                residentName: residents.find(
                  (r) => r.id === lastPost.residentId
                )?.name,
              }
            : undefined,
          totalToday: categoryPosts.length,
        };
      })
      .filter(
        (item) =>
          item.totalToday > 0 ||
          item.category === "Meal" ||
          item.category === "Meds"
      );
  }, [todayPosts, residents, typeLabels]);

  return (
    <View style={styles.container}>
      <Header
        title="Staff Dashboard"
        subtitle={`${getCurrentShiftInfo().name} • ${
          getCurrentShiftInfo().time
        }`}
        showSettings={true}
      />
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
      >
        {/* Today's Stats */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Stats</Text>
          <Text style={styles.sectionSubtitle}>
            Overview of care activities logged today
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              number={stats.totalUpdates}
              label="Total Updates"
              color={colors.primary}
              subtitle="All activities"
            />

            {Object.entries(stats.byType)
              .slice(0, 5)
              .map(([type, count]) => (
                <StatCard
                  key={type}
                  number={count}
                  label={typeLabels[type] || type}
                  color={colors.text}
                  indicatorColor={typeColors[type] || colors.primary}
                />
              ))}
          </View>
        </Card>

        {/* Category Recents */}
        <Card style={styles.section}>
          <CategoryRecents recents={categoryRecents} />
        </Card>

        {/* Residents Overview */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Residents Overview</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a resident to view details or add update
          </Text>
          <View style={styles.residentsGrid}>
            {residents.map((resident) => {
              const residentUpdates = todayPosts.filter(
                (post) => post.residentId === resident.id
              );
              const lastUpdate = residentUpdates.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0];
              const updateCount = residentUpdates.length;

              return (
                <ResidentStatusCard
                  key={resident.id}
                  resident={resident}
                  updateCount={updateCount}
                  lastUpdate={lastUpdate}
                  typeLabels={typeLabels}
                  onPress={() => {
                    // Navigate to resident detail screen
                    (navigation as any).navigate("ResidentDetail", {
                      residentId: resident.id,
                    });
                  }}
                  onQuickAdd={handleQuickAdd}
                />
              );
            })}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>
            Log activities for residents
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoToQuickLog}
            accessibilityLabel="Go to Quick Log"
            accessibilityHint="Opens the quick logging screen"
          >
            <Text style={styles.primaryButtonText}>Start Logging</Text>
          </TouchableOpacity>
        </Card>

        {/* Today's Updates */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          <Text style={styles.sectionSubtitle}>
            Latest care activities logged today
          </Text>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedPostType === "all" && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedPostType("all")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedPostType === "all" && styles.filterButtonTextActive,
                ]}
              >
                All ({todayPosts.length})
              </Text>
            </TouchableOpacity>

            {Object.keys(stats.byType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  selectedPostType === type && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedPostType(type)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedPostType === type && styles.filterButtonTextActive,
                  ]}
                >
                  {typeLabels[type]} ({stats.byType[type]})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredPosts.length > 0 ? (
            <View style={styles.updatesList}>
              {filteredPosts.slice(0, 10).map((post) => {
                const resident = residents.find(
                  (r) => r.id === post.residentId
                );
                return (
                  <View key={post.id} style={styles.updateItem}>
                    <View style={styles.updateHeader}>
                      <View style={styles.updateInfo}>
                        <Text style={styles.updateType}>
                          {typeLabels[post.type] || post.type}
                        </Text>
                        <Text style={styles.updateResident}>
                          {resident?.name}
                          {resident?.room && ` • Room ${resident.room}`}
                        </Text>
                      </View>
                      <Text style={styles.updateTime}>
                        {new Date(post.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>

                    {post.text && (
                      <Text style={styles.updateText}>{post.text}</Text>
                    )}

                    {post.tags.length > 0 && (
                      <View style={styles.updateTags}>
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <View key={index} style={styles.updateTag}>
                            <Text style={styles.updateTagText}>{tag}</Text>
                          </View>
                        ))}
                        {post.tags.length > 3 && (
                          <Text style={styles.moreTagsText}>
                            +{post.tags.length - 3} more
                          </Text>
                        )}
                      </View>
                    )}

                    <View style={styles.updateFooter}>
                      <Text style={styles.updateAuthor}>
                        by{" "}
                        {post.authorId === "skarlette-choi"
                          ? "You"
                          : getAuthorName(post.authorId)}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {filteredPosts.length > 10 && (
                <Text style={styles.moreUpdatesText}>
                  ... and {filteredPosts.length - 10} more updates today
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.noUpdatesContainer}>
              <Text style={styles.noUpdatesText}>
                {selectedPostType === "all"
                  ? "No updates logged today yet."
                  : `No ${typeLabels[selectedPostType]} updates today.`}
              </Text>
              <Text style={styles.noUpdatesSubtext}>
                Use Quick Log to record care activities.
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...theme.typography.sectionTitle,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: colors.textMuted,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  breakdownContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
  },
  breakdownItem: {
    alignItems: "center",
    minWidth: 80,
  },
  breakdownCount: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
  },
  breakdownLabel: {
    ...theme.typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  // Residents Overview styles
  residentsGrid: {
    gap: spacing.sm,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    minHeight: 44,
    ...shadow.sm,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: colors.card,
  },
  // Updates styles
  updatesList: {
    gap: spacing.sm,
  },
  updateItem: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  updateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  updateInfo: {
    flex: 1,
  },
  updateType: {
    ...theme.typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  updateResident: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "500",
  },
  updateTime: {
    ...theme.typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.md,
  },
  updateText: {
    ...theme.typography.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  updateTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  updateTag: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  updateTagText: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
  moreTagsText: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  updateFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  updateAuthor: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  moreUpdatesText: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  noUpdatesContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  noUpdatesText: {
    ...theme.typography.body,
    color: colors.textMuted,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  noUpdatesSubtext: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  },
  // Filter styles
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    marginBottom: spacing.xs,
  },
  filterButton: {
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: colors.card,
  },
});
