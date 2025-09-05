import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { colors, radius, spacing, theme } from "../../theme";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Header } from "../../components/Header";
import { useFeedStore } from "../../store/feedStore";
import {
  CheckCircle,
  Clock,
  Warning,
  Calendar,
  FunnelSimple,
  List,
  ClockClockwise,
} from "phosphor-react-native";

type RouteParams = {
  residentId: string;
};

export const StaffResidentDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { residentId } = route.params as RouteParams;

  const { residents, feed, getTodayStats } = useFeedStore();
  const resident = residents.find((r) => r.id === residentId);

  // Filter state for updates
  const [showMyUpdatesOnly, setShowMyUpdatesOnly] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "today" | "week"
  >("today");
  const [viewMode, setViewMode] = useState<"cards" | "timeline">("cards");

  // Get today's updates for this resident
  const todayUpdates = useMemo(() => {
    if (!resident) return [];

    const today = new Date();
    const residentFeed = feed[resident.id] || [];

    return residentFeed.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate.toDateString() === today.toDateString();
    });
  }, [resident, feed]);

  // Filter updates based on current carer (for demo, using "skarlette-choi" as current carer)
  const currentCarerId = "skarlette-choi"; // In real app, this would come from auth
  const myUpdates = todayUpdates.filter(
    (item) => item.authorId === currentCarerId
  );
  const otherUpdates = todayUpdates.filter(
    (item) => item.authorId !== currentCarerId
  );

  const displayedUpdates = showMyUpdatesOnly ? myUpdates : todayUpdates;

  // Enhanced type configuration with status and descriptions
  const typeConfig: Record<
    string,
    {
      label: string;
      icon: string;
      description: string;
      getStatus: (tags: string[]) => "completed" | "pending" | "attention";
      statusText: (tags: string[]) => string;
    }
  > = {
    meal: {
      label: "Meal",
      icon: "🍽️",
      description: "Dining and nutrition",
      getStatus: (tags) => {
        if (tags.includes("refused") || tags.includes("assistance-needed"))
          return "attention";
        if (tags.includes("partial") || tags.includes("slow")) return "pending";
        return "completed";
      },
      statusText: (tags) => {
        if (tags.includes("refused")) return "Meal refused";
        if (tags.includes("assistance-needed")) return "Needs assistance";
        if (tags.includes("partial")) return "Partially eaten";
        return "Meal completed";
      },
    },
    meds: {
      label: "Medication",
      icon: "💊",
      description: "Medication administration",
      getStatus: (tags) => {
        if (tags.includes("refused") || tags.includes("missed"))
          return "attention";
        if (tags.includes("delayed")) return "pending";
        return "completed";
      },
      statusText: (tags) => {
        if (tags.includes("refused")) return "Medication refused";
        if (tags.includes("missed")) return "Dose missed";
        if (tags.includes("delayed")) return "Administered late";
        return "Given as prescribed";
      },
    },
    activity: {
      label: "Activity",
      icon: "🏃",
      description: "Physical and social activities",
      getStatus: (tags) => {
        if (tags.includes("declined") || tags.includes("unable"))
          return "attention";
        if (tags.includes("partial")) return "pending";
        return "completed";
      },
      statusText: (tags) => {
        if (tags.includes("declined")) return "Declined participation";
        if (tags.includes("unable")) return "Unable to participate";
        if (tags.includes("partial")) return "Participated briefly";
        return "Fully participated";
      },
    },
    rest: {
      label: "Rest",
      icon: "😴",
      description: "Sleep and rest periods",
      getStatus: (tags) => {
        if (tags.includes("restless") || tags.includes("insomnia"))
          return "attention";
        if (tags.includes("brief")) return "pending";
        return "completed";
      },
      statusText: (tags) => {
        if (tags.includes("restless")) return "Restless sleep";
        if (tags.includes("insomnia")) return "Unable to sleep";
        if (tags.includes("brief")) return "Short rest";
        return "Rested well";
      },
    },
    bathroom: {
      label: "Bathroom",
      icon: "🚽",
      description: "Toileting assistance",
      getStatus: (tags) => {
        if (tags.includes("accident") || tags.includes("assistance"))
          return "attention";
        return "completed";
      },
      statusText: (tags) => {
        if (tags.includes("accident")) return "Accident occurred";
        if (tags.includes("assistance")) return "Needed assistance";
        return "Independent";
      },
    },
    hygiene: {
      label: "Hygiene",
      icon: "🛁",
      description: "Personal care and hygiene",
      getStatus: (tags) => {
        if (tags.includes("refused") || tags.includes("incomplete"))
          return "attention";
        return "completed";
      },
      statusText: (tags) => {
        if (tags.includes("refused")) return "Refused care";
        if (tags.includes("incomplete")) return "Partially completed";
        return "Care completed";
      },
    },
    dressing: {
      label: "Dressing",
      icon: "👕",
      description: "Dressing assistance",
      getStatus: (tags) => {
        if (tags.includes("assistance") || tags.includes("difficulty"))
          return "attention";
        return "completed";
      },
      statusText: (tags) => {
        if (tags.includes("difficulty")) return "Had difficulty";
        if (tags.includes("assistance")) return "Needed help";
        return "Dressed independently";
      },
    },
    mobility: {
      label: "Mobility",
      icon: "🦽",
      description: "Movement and transfers",
      getStatus: (tags) => {
        if (tags.includes("fall") || tags.includes("unsteady"))
          return "attention";
        if (tags.includes("slow")) return "pending";
        return "completed";
      },
      statusText: (tags) => {
        if (tags.includes("fall")) return "Fall occurred";
        if (tags.includes("unsteady")) return "Unsteady gait";
        if (tags.includes("slow")) return "Moving slowly";
        return "Mobile and stable";
      },
    },
    photo: {
      label: "Photo",
      icon: "📷",
      description: "Photo documentation",
      getStatus: () => "completed",
      statusText: () => "Photo added",
    },
    note: {
      label: "Note",
      icon: "📝",
      description: "General notes",
      getStatus: (tags) => {
        if (tags.includes("concern") || tags.includes("urgent"))
          return "attention";
        return "completed";
      },
      statusText: (tags) => {
        if (tags.includes("concern")) return "Concern noted";
        if (tags.includes("urgent")) return "Urgent note";
        return "Note added";
      },
    },
  };

  if (!resident) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Resident not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Resident Details" showBack={true} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Resident Info Card */}
        <Card style={styles.section}>
          <View style={styles.residentInfo}>
            <View style={styles.residentAvatar}>
              <Text style={styles.avatarText}>{resident.name.charAt(0)}</Text>
            </View>
            <View style={styles.residentDetails}>
              <Text style={styles.residentName}>{resident.name}</Text>
              {resident.room && (
                <Text style={styles.residentRoom}>Room {resident.room}</Text>
              )}
              <View style={styles.photoConsent}>
                <Text style={styles.photoConsentLabel}>
                  Photo Consent:{" "}
                  {resident.photoConsent ? "✅ Granted" : "❌ Not Granted"}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Today's Summary */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{todayUpdates.length}</Text>
              <Text style={styles.summaryLabel}>Total Updates</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{myUpdates.length}</Text>
              <Text style={styles.summaryLabel}>My Updates</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{otherUpdates.length}</Text>
              <Text style={styles.summaryLabel}>Other Carers</Text>
            </View>
          </View>
        </Card>

        {/* Enhanced Filters and View Options */}
        <Card style={styles.section}>
          <View style={styles.filtersContainer}>
            {/* Author Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Show Updates</Text>
              <View style={styles.filterToggle}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    !showMyUpdatesOnly && styles.filterOptionActive,
                  ]}
                  onPress={() => setShowMyUpdatesOnly(false)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      !showMyUpdatesOnly && styles.filterOptionTextActive,
                    ]}
                  >
                    All ({todayUpdates.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    showMyUpdatesOnly && styles.filterOptionActive,
                  ]}
                  onPress={() => setShowMyUpdatesOnly(true)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      showMyUpdatesOnly && styles.filterOptionTextActive,
                    ]}
                  >
                    Mine ({myUpdates.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Time Period</Text>
              <View style={styles.filterToggle}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedFilter === "today" && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedFilter("today")}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFilter === "today" &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    Today
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedFilter === "week" && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedFilter("week")}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFilter === "week" &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    Week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedFilter === "all" && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedFilter("all")}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFilter === "all" && styles.filterOptionTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* View Mode */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>View</Text>
              <View style={styles.filterToggle}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    viewMode === "cards" && styles.filterOptionActive,
                  ]}
                  onPress={() => setViewMode("cards")}
                >
                  <List
                    size={16}
                    color={
                      viewMode === "cards" ? colors.card : colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      { marginLeft: spacing.xs },
                      viewMode === "cards" && styles.filterOptionTextActive,
                    ]}
                  >
                    Cards
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    viewMode === "timeline" && styles.filterOptionActive,
                  ]}
                  onPress={() => setViewMode("timeline")}
                >
                  <ClockClockwise
                    size={16}
                    color={
                      viewMode === "timeline" ? colors.card : colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      { marginLeft: spacing.xs },
                      viewMode === "timeline" && styles.filterOptionTextActive,
                    ]}
                  >
                    Timeline
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        {/* Enhanced Updates Display */}
        <Card style={styles.section}>
          <View style={styles.updatesHeader}>
            <Text style={styles.sectionTitle}>
              {showMyUpdatesOnly ? "My Updates" : "All Updates"}
              <Text style={styles.updatesCount}>
                {" "}
                ({displayedUpdates.length})
              </Text>
            </Text>
            {displayedUpdates.length > 0 && (
              <Text style={styles.updatesSubtitle}>
                {selectedFilter === "today"
                  ? "Today"
                  : selectedFilter === "week"
                  ? "This Week"
                  : "All Time"}
              </Text>
            )}
          </View>

          {displayedUpdates.length > 0 ? (
            <View
              style={
                viewMode === "cards" ? styles.updatesList : styles.timelineList
              }
            >
              {displayedUpdates.map((update, index) => {
                const config = typeConfig[update.type];
                const status = config?.getStatus(update.tags) || "completed";
                const statusText =
                  config?.statusText(update.tags) || "Completed";

                if (viewMode === "timeline") {
                  return (
                    <View key={update.id} style={styles.timelineItem}>
                      <View style={styles.timelineConnector}>
                        <View
                          style={[
                            styles.timelineDot,
                            status === "completed" &&
                              styles.timelineDotCompleted,
                            status === "pending" && styles.timelineDotPending,
                            status === "attention" &&
                              styles.timelineDotAttention,
                          ]}
                        />
                        {index < displayedUpdates.length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </View>
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineHeader}>
                          <View style={styles.timelineTypeStatus}>
                            <Text style={styles.timelineType}>
                              {config?.icon} {config?.label || update.type}
                            </Text>
                            <View
                              style={[
                                styles.statusIndicator,
                                status === "completed" &&
                                  styles.statusCompleted,
                                status === "pending" && styles.statusPending,
                                status === "attention" &&
                                  styles.statusAttention,
                              ]}
                            >
                              {status === "completed" && (
                                <CheckCircle size={12} color={colors.success} />
                              )}
                              {status === "pending" && (
                                <Clock size={12} color={colors.warning} />
                              )}
                              {status === "attention" && (
                                <Warning size={12} color={colors.error} />
                              )}
                              <Text
                                style={[
                                  styles.statusText,
                                  status === "completed" &&
                                    styles.statusTextCompleted,
                                  status === "pending" &&
                                    styles.statusTextPending,
                                  status === "attention" &&
                                    styles.statusTextAttention,
                                ]}
                              >
                                {statusText}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.timelineTime}>
                            {new Date(update.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </View>
                        {update.text && (
                          <Text style={styles.timelineText}>{update.text}</Text>
                        )}
                        {update.photoUrl && (
                          <Image
                            source={{ uri: update.photoUrl }}
                            style={styles.timelinePhoto}
                          />
                        )}
                        <View style={styles.timelineFooter}>
                          <Text style={styles.timelineAuthor}>
                            by{" "}
                            {update.authorId === currentCarerId
                              ? "You"
                              : update.authorId}
                          </Text>
                          {update.reactions && update.reactions.heart > 0 && (
                            <Text style={styles.timelineReactions}>
                              ❤️ {update.reactions.heart}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                }

                // Cards view
                return (
                  <View
                    key={update.id}
                    style={[
                      styles.updateItem,
                      status === "completed" && styles.updateItemCompleted,
                      status === "pending" && styles.updateItemPending,
                      status === "attention" && styles.updateItemAttention,
                    ]}
                  >
                    <View style={styles.updateHeader}>
                      <View style={styles.updateTypeStatus}>
                        <View style={styles.updateTypeRow}>
                          <Text style={styles.updateType}>
                            {config?.icon} {config?.label || update.type}
                          </Text>
                          <View
                            style={[
                              styles.statusIndicator,
                              status === "completed" && styles.statusCompleted,
                              status === "pending" && styles.statusPending,
                              status === "attention" && styles.statusAttention,
                            ]}
                          >
                            {status === "completed" && (
                              <CheckCircle size={14} color={colors.success} />
                            )}
                            {status === "pending" && (
                              <Clock size={14} color={colors.warning} />
                            )}
                            {status === "attention" && (
                              <Warning size={14} color={colors.error} />
                            )}
                            <Text
                              style={[
                                styles.statusText,
                                status === "completed" &&
                                  styles.statusTextCompleted,
                                status === "pending" &&
                                  styles.statusTextPending,
                                status === "attention" &&
                                  styles.statusTextAttention,
                              ]}
                            >
                              {statusText}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.updateTime}>
                          {new Date(update.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                      <View style={styles.updateAuthor}>
                        <Text
                          style={[
                            styles.authorBadge,
                            update.authorId === currentCarerId &&
                              styles.myUpdateBadge,
                          ]}
                        >
                          {update.authorId === currentCarerId
                            ? "Me"
                            : update.authorId}
                        </Text>
                      </View>
                    </View>

                    {update.text && (
                      <Text style={styles.updateText}>{update.text}</Text>
                    )}

                    {update.photoUrl && (
                      <Image
                        source={{ uri: update.photoUrl }}
                        style={styles.updatePhoto}
                      />
                    )}

                    {update.tags.length > 0 && (
                      <View style={styles.updateTags}>
                        {update.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            label={tag}
                            style={styles.updateTag}
                          />
                        ))}
                      </View>
                    )}

                    <View style={styles.updateFooter}>
                      {update.reactions && update.reactions.heart > 0 && (
                        <Text style={styles.updateReactions}>
                          ❤️ {update.reactions.heart}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noUpdatesContainer}>
              <Text style={styles.noUpdatesText}>
                {showMyUpdatesOnly
                  ? "No updates from you today."
                  : "No updates for this resident today."}
              </Text>
              <Text style={styles.noUpdatesSubtext}>
                Updates will appear here as care activities are logged.
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backButton: {
    marginRight: spacing.md,
  },
  backButtonText: {
    ...theme.typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  title: {
    ...theme.typography.sectionTitle,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  residentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  residentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.card,
  },
  residentDetails: {
    flex: 1,
  },
  residentName: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  residentRoom: {
    ...theme.typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  photoConsent: {
    marginTop: spacing.xs,
  },
  photoConsentLabel: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
  },
  // Enhanced filters
  filtersContainer: {
    gap: spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterLabel: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    minWidth: 80,
  },
  filterToggle: {
    flexDirection: "row",
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    padding: spacing.xs,
    flex: 1,
    marginLeft: spacing.md,
  },
  filterOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    fontWeight: "500",
  },
  filterOptionTextActive: {
    color: colors.card,
  },

  // Enhanced updates display
  updatesHeader: {
    marginBottom: spacing.md,
  },
  updatesCount: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  updatesSubtitle: {
    ...theme.typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  updatesList: {
    gap: spacing.sm,
  },
  updateItem: {
    padding: spacing.md,
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  updateItemCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  updateItemPending: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  updateItemAttention: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  updateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  updateTypeStatus: {
    flex: 1,
  },
  updateTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  updateType: {
    ...theme.typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
    flex: 1,
  },

  // Status indicators
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginLeft: spacing.sm,
  },
  statusCompleted: {
    backgroundColor: colors.success + "20",
  },
  statusPending: {
    backgroundColor: colors.warning + "20",
  },
  statusAttention: {
    backgroundColor: colors.error + "20",
  },
  statusText: {
    ...theme.typography.caption,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  statusTextCompleted: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.warning,
  },
  statusTextAttention: {
    color: colors.error,
  },
  updateTime: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },
  updateAuthor: {
    marginLeft: spacing.sm,
  },
  authorBadge: {
    ...theme.typography.caption,
    backgroundColor: colors.border,
    color: colors.textMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  myUpdateBadge: {
    backgroundColor: colors.primary,
    color: colors.card,
  },
  updateText: {
    ...theme.typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  updatePhoto: {
    width: "100%",
    height: 120,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  updateTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  updateTag: {
    marginBottom: spacing.xs,
  },
  updateFooter: {
    alignItems: "flex-end",
  },
  updateReactions: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
  },
  // Timeline styles
  timelineList: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row",
    paddingBottom: spacing.md,
  },
  timelineConnector: {
    width: 32,
    alignItems: "center",
    marginRight: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: spacing.xs,
  },
  timelineDotCompleted: {
    backgroundColor: colors.success,
  },
  timelineDotPending: {
    backgroundColor: colors.warning,
  },
  timelineDotAttention: {
    backgroundColor: colors.error,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  timelineTypeStatus: {
    flex: 1,
  },
  timelineType: {
    ...theme.typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  timelineTime: {
    ...theme.typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  timelineText: {
    ...theme.typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  timelinePhoto: {
    width: "100%",
    height: 100,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  timelineFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timelineAuthor: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  timelineReactions: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },

  // No updates state
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
  errorText: {
    ...theme.typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
