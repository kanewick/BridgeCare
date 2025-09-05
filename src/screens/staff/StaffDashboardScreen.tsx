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
import { useFeedStore } from "../../store/feedStore";

export const StaffDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { getTodayStats, setActiveResident, feed, residents } = useFeedStore();
  const contentContainerStyle = useContentContainerStyle();

  // Map author IDs to display names
  const getAuthorName = (authorId: string) => {
    const authorNames: Record<string, string> = {
      "skarlette-choi": "Skarlette Choi",
      nurse1: "Nurse Smith",
      nurse2: "Nurse Johnson",
    };
    return authorNames[authorId] || authorId;
  };

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

  const typeLabels: Record<string, string> = {
    meal: "🍽️ Meal",
    activity: "🏃 Activity",
    meds: "💊 Meds",
    rest: "😴 Rest",
    bathroom: "🚽 Bathroom",
    hygiene: "🛁 Hygiene",
    dressing: "👕 Dressing",
    mobility: "🦽 Mobility",
    photo: "📷 Photo",
    note: "📝 Note",
  };

  return (
    <View style={styles.container}>
      <Header title="Staff Dashboard" />
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
      >
        {/* Today's Stats */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Updates Posted Today</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalUpdates}</Text>
              <Text style={styles.statLabel}>Total Updates</Text>
            </View>

            {Object.entries(stats.byType)
              .slice(0, 5)
              .map(([type, count]) => (
                <View key={type} style={styles.statItem}>
                  <Text style={styles.statNumber}>{count}</Text>
                  <Text style={styles.statLabel}>
                    {typeLabels[type] || type}
                  </Text>
                </View>
              ))}
          </View>
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
              const needsAttention = updateCount === 0;

              return (
                <TouchableOpacity
                  key={resident.id}
                  style={[
                    styles.residentCard,
                    needsAttention && styles.residentCardAttention,
                  ]}
                  onPress={() => {
                    // Navigate to resident detail screen
                    (navigation as any).navigate("ResidentDetail", {
                      residentId: resident.id,
                    });
                  }}
                >
                  <View style={styles.residentCardHeader}>
                    <View style={styles.residentInfo}>
                      <Text style={styles.residentName}>{resident.name}</Text>
                      {resident.room && (
                        <Text style={styles.residentRoom}>
                          Room {resident.room}
                        </Text>
                      )}
                    </View>
                    <View style={styles.residentStats}>
                      <Text
                        style={[
                          styles.updateCount,
                          needsAttention && styles.updateCountAttention,
                        ]}
                      >
                        {updateCount}
                      </Text>
                      <Text style={styles.updateCountLabel}>
                        {updateCount === 1 ? "update" : "updates"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.residentCardFooter}>
                    {lastUpdate ? (
                      <View style={styles.lastUpdateInfo}>
                        <Text style={styles.lastUpdateType}>
                          {typeLabels[lastUpdate.type]} •{" "}
                          {new Date(lastUpdate.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.noUpdateText}>No updates today</Text>
                    )}

                    <TouchableOpacity
                      style={styles.quickAddButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleResidentTap(resident.id);
                      }}
                    >
                      <Text style={styles.quickAddText}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoToQuickLog}
          >
            <Text style={styles.primaryButtonText}>Go to Quick Log</Text>
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
  statItem: {
    alignItems: "center",
    minWidth: "30%",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    lineHeight: 32,
  },
  statLabel: {
    ...theme.typography.body,
    color: colors.textMuted,
    textAlign: "center",
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
  residentCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.sm,
  },
  residentCardAttention: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  residentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  residentInfo: {
    flex: 1,
  },
  residentName: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  residentRoom: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },
  residentStats: {
    alignItems: "center",
    marginLeft: spacing.md,
  },
  updateCount: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    lineHeight: 24,
  },
  updateCountAttention: {
    color: colors.warning,
  },
  updateCountLabel: {
    ...theme.typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  residentCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  lastUpdateInfo: {
    flex: 1,
  },
  lastUpdateType: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
  noUpdateText: {
    ...theme.typography.caption,
    color: colors.warning,
    fontWeight: "500",
    fontStyle: "italic",
  },
  quickAddButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  quickAddText: {
    ...theme.typography.caption,
    color: colors.card,
    fontWeight: "600",
  },
  primaryButton: {
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
