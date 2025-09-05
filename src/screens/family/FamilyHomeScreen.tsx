import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { colors, radius, spacing, theme } from "../../theme";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { Card } from "../../components/Card";
import { FamilyFeedCard } from "../../components/FamilyFeedCard";
import { Badge } from "../../components/Badge";
import { Header } from "../../components/Header";
import { useFeedStore } from "../../store/feedStore";
import { useAppTheme } from "../../store/themeStore";
import { Bug } from "phosphor-react-native";

interface GroupedFeedItems {
  title: string;
  data: any[];
}

export const FamilyHomeScreen: React.FC = () => {
  const contentContainerStyle = useContentContainerStyle();
  const { effectiveTheme } = useAppTheme();
  const {
    residents,
    activeResidentId,
    setActiveResident,
    getFeedItemsByResident,
    toggleReaction,
    currentUser,
  } = useFeedStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDevelopmentView, setShowDevelopmentView] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleResidentSelect = (residentId: string) => {
    setActiveResident(residentId);
    // Update the family's selected resident persistently
  };

  const handleToggleReaction = (itemId: string) => {
    toggleReaction(itemId);
  };

  const handleComment = (itemId: string) => {
    const item = feedItems.find((fi) => fi.id === itemId);
    if (item) {
      setSelectedItem(item);
      setShowCommentModal(true);
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      // In a real app, this would save the comment
      Alert.alert("Comment Added", "Your comment has been added successfully!");
      setCommentText("");
      setShowCommentModal(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedItem(null);
    setCommentText("");
    setShowCommentModal(false);
  };

  // Group feed items by day
  const groupFeedItemsByDay = (items: any[]): GroupedFeedItems[] => {
    const groups: { [key: string]: any[] } = {};

    items.forEach((item) => {
      const date = new Date(item.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else {
        groupKey = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data,
    }));
  };

  // Family Logic: In realistic mode, only show the current user's family member
  // In development mode, allow switching between residents
  const familyResident =
    currentUser?.id === "kallen-newick"
      ? residents.find((r) => r.id === "5") // Bob Sargeant for Kallen
      : residents.find((r) => r.name === "Robert Chen"); // Default fallback
  const activeResident = showDevelopmentView
    ? residents.find((r) => r.id === activeResidentId) || residents[0]
    : familyResident || residents[0];

  const feedItems = activeResident
    ? getFeedItemsByResident(activeResident.id)
    : [];
  const groupedItems = groupFeedItemsByDay(feedItems);

  const renderResidentPicker = () => {
    if (!showDevelopmentView) {
      // Realistic family view - just show their loved one
      return (
        <View style={styles.residentPicker}>
          <View style={styles.familyResidentHeader}>
            <Text style={styles.sectionTitle}>Your Loved One</Text>
            <View style={styles.developmentToggle}>
              <TouchableOpacity
                style={styles.devButton}
                onPress={() => setShowDevelopmentView(true)}
              >
                <Bug size={16} color={colors.textMuted} />
                <Text style={styles.devButtonText}>Dev Mode</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.singleResidentCard}>
            <Text style={styles.singleResidentName}>
              🏠 {activeResident?.name}
            </Text>
            <Text style={styles.singleResidentSubtext}>
              Room {activeResident?.room}
            </Text>
          </View>
        </View>
      );
    }

    // Development view - show all residents with picker
    return (
      <View style={styles.residentPicker}>
        <View style={styles.familyResidentHeader}>
          <Text style={styles.sectionTitle}>Select Resident (Dev Mode)</Text>
          <TouchableOpacity
            style={styles.devButton}
            onPress={() => setShowDevelopmentView(false)}
          >
            <Text style={styles.devButtonText}>✕ Exit Dev</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={residents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.residentChip,
                activeResident?.id === item.id && styles.residentChipActive,
              ]}
              onPress={() => handleResidentSelect(item.id)}
            >
              <Text
                style={[
                  styles.residentChipText,
                  activeResident?.id === item.id &&
                    styles.residentChipTextActive,
                ]}
              >
                {item.room ? `🏠 ${item.name}` : `👤 ${item.name}`}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.residentPickerContent}
        />
      </View>
    );
  };

  const renderFeedItem = ({ item }: { item: any }) => (
    <FamilyFeedCard
      item={item}
      onToggleReaction={handleToggleReaction}
      onComment={handleComment}
      onPress={(item) => setSelectedItem(item)}
      currentUserId="family-user" // Family user ID
    />
  );

  const renderSectionHeader = ({ section }: { section: GroupedFeedItems }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No updates yet</Text>
      <Text style={styles.emptyStateText}>
        {activeResident
          ? `No updates have been posted for ${activeResident.name} yet.`
          : "Select a resident to view their updates."}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        Staff will post updates about meals, activities, medications, and more.
      </Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="Family Feed" />
      {renderResidentPicker()}

      {feedItems.length === 0 ? (
        <View style={styles.emptyContainer}>{renderEmptyState()}</View>
      ) : (
        <FlatList
          data={groupedItems}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          renderItem={({ item }) => (
            <View>
              {renderSectionHeader({ section: item })}
              {item.data.map((feedItem) => (
                <FamilyFeedCard
                  key={feedItem.id}
                  item={feedItem}
                  onToggleReaction={handleToggleReaction}
                  onComment={handleComment}
                  onPress={(item) => setSelectedItem(item)}
                  currentUserId="family-user" // Family user ID
                />
              ))}
            </View>
          )}
          contentContainerStyle={[styles.feedList, contentContainerStyle]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Enhanced Detail Modal */}
      <Modal
        visible={!!selectedItem}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalContainer}>
          {selectedItem &&
            (() => {
              const getModalConfig = (type: string) => {
                const configs: Record<
                  string,
                  {
                    emoji: string;
                    bgColor: string;
                    accentColor: string;
                    title: string;
                  }
                > = {
                  meal: {
                    emoji: "🍽️",
                    bgColor: "#FFF7ED",
                    accentColor: "#FB923C",
                    title: "Mealtime Update",
                  },
                  meds: {
                    emoji: "💊",
                    bgColor: "#F0F9FF",
                    accentColor: "#0EA5E9",
                    title: "Medication Care",
                  },
                  activity: {
                    emoji: "🎨",
                    bgColor: "#F0FDF4",
                    accentColor: "#10B981",
                    title: "Activity Time",
                  },
                  rest: {
                    emoji: "😴",
                    bgColor: "#FDF4FF",
                    accentColor: "#A855F7",
                    title: "Rest & Sleep",
                  },
                  bathroom: {
                    emoji: "🚿",
                    bgColor: "#F8FAFC",
                    accentColor: "#64748B",
                    title: "Personal Care",
                  },
                  hygiene: {
                    emoji: "🛁",
                    bgColor: "#F0F9FF",
                    accentColor: "#06B6D4",
                    title: "Self Care",
                  },
                  dressing: {
                    emoji: "👔",
                    bgColor: "#FFFBEB",
                    accentColor: "#F59E0B",
                    title: "Getting Ready",
                  },
                  mobility: {
                    emoji: "🚶",
                    bgColor: "#F0FDF4",
                    accentColor: "#059669",
                    title: "Moving Around",
                  },
                  photo: {
                    emoji: "📸",
                    bgColor: "#FEF2F2",
                    accentColor: "#EF4444",
                    title: "Special Moment",
                  },
                  note: {
                    emoji: "📝",
                    bgColor: "#F8FAFC",
                    accentColor: "#475569",
                    title: "Care Note",
                  },
                };
                return configs[type] || configs.note;
              };

              const config = getModalConfig(selectedItem.type);
              const authorName =
                selectedItem.authorId === "skarlette-choi"
                  ? "Skarlette Choi"
                  : selectedItem.authorId;

              return (
                <>
                  {/* Custom Header */}
                  <View
                    style={[
                      styles.modalHeader,
                      { backgroundColor: config.bgColor },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeDetailModal}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <View style={styles.modalHeaderContent}>
                      <View
                        style={[
                          styles.modalEmojiContainer,
                          { backgroundColor: config.accentColor + "20" },
                        ]}
                      >
                        <Text style={styles.modalEmoji}>{config.emoji}</Text>
                      </View>
                      <Text
                        style={[
                          styles.modalTitle,
                          { color: config.accentColor },
                        ]}
                      >
                        {config.title}
                      </Text>
                      <Text style={styles.modalSubtitle}>
                        {new Date(selectedItem.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    </View>
                  </View>

                  <ScrollView style={styles.modalContent}>
                    <View style={styles.detailContent}>
                      {/* Care Provider */}
                      <View
                        style={[
                          styles.careProviderCard,
                          { borderColor: config.accentColor },
                        ]}
                      >
                        <Text style={styles.careProviderLabel}>
                          Care provided by
                        </Text>
                        <Text
                          style={[
                            styles.careProviderName,
                            { color: config.accentColor },
                          ]}
                        >
                          {authorName}
                        </Text>
                      </View>

                      {/* Main Content */}
                      {selectedItem.text && (
                        <View
                          style={[
                            styles.detailTextCard,
                            {
                              backgroundColor: config.bgColor,
                              borderColor: config.accentColor,
                            },
                          ]}
                        >
                          <Text style={styles.detailTextLabel}>
                            What happened:
                          </Text>
                          <Text style={styles.detailText}>
                            "{selectedItem.text}"
                          </Text>
                        </View>
                      )}

                      {/* Photo */}
                      {selectedItem.photoUrl && (
                        <View style={styles.detailPhotoContainer}>
                          <Text style={styles.detailPhotoLabel}>
                            📸 Memory captured
                          </Text>
                          <Image
                            source={{ uri: selectedItem.photoUrl }}
                            style={[
                              styles.detailPhoto,
                              { borderColor: config.accentColor },
                            ]}
                            resizeMode="cover"
                          />
                        </View>
                      )}

                      {/* Tags */}
                      {selectedItem.tags && selectedItem.tags.length > 0 && (
                        <View style={styles.detailTags}>
                          <Text style={styles.detailTagsLabel}>
                            🏷️ Care details
                          </Text>
                          <View style={styles.detailTagsList}>
                            {selectedItem.tags.map((tag: string) => (
                              <View
                                key={tag}
                                style={[
                                  styles.detailTag,
                                  {
                                    backgroundColor: config.accentColor + "15",
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.detailTagText,
                                    { color: config.accentColor },
                                  ]}
                                >
                                  {tag}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Actions */}
                      <View style={styles.detailActions}>
                        <TouchableOpacity
                          style={[
                            styles.familyReactionButton,
                            {
                              backgroundColor: config.accentColor + "10",
                              borderColor: config.accentColor,
                            },
                          ]}
                          onPress={() => handleToggleReaction(selectedItem.id)}
                        >
                          <Text style={styles.familyReactionIcon}>
                            {selectedItem.reactions?.reactedByMe ? "❤️" : "🤍"}
                          </Text>
                          <Text
                            style={[
                              styles.familyReactionText,
                              { color: config.accentColor },
                            ]}
                          >
                            {selectedItem.reactions?.reactedByMe
                              ? "You love this!"
                              : "Send love"}
                          </Text>
                          {selectedItem.reactions?.heart > 0 && (
                            <Text style={styles.familyReactionCount}>
                              {selectedItem.reactions.heart} ❤️
                            </Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.familyCommentButton,
                            { backgroundColor: config.accentColor },
                          ]}
                          onPress={() => setShowCommentModal(true)}
                        >
                          <Text style={styles.familyCommentIcon}>💬</Text>
                          <Text style={styles.familyCommentText}>
                            Leave a message
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ScrollView>
                </>
              );
            })()}
        </View>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.commentModal}>
          <View style={styles.commentHeader}>
            <TouchableOpacity onPress={() => setShowCommentModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.commentTitle}>Add Comment</Text>
            <TouchableOpacity onPress={handleAddComment}>
              <Text style={styles.submitButton}>Post</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your thoughts..."
              multiline
              value={commentText}
              onChangeText={setCommentText}
              autoFocus
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  residentPicker: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  familyResidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  developmentToggle: {
    alignItems: "flex-end",
  },
  devButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.chipBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  devButtonText: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
  singleResidentCard: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  singleResidentName: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  singleResidentSubtext: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
  },
  residentPickerContent: {
    paddingRight: spacing.lg,
  },
  residentChip: {
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  residentChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  residentChipText: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    fontWeight: "500",
  },
  residentChipTextActive: {
    color: colors.card,
  },
  feedList: {
    padding: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeaderText: {
    ...theme.typography.sectionTitle,
    color: colors.textMuted,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyStateTitle: {
    ...theme.typography.sectionTitle,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyStateText: {
    ...theme.typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.sm,
    lineHeight: theme.typography.body.lineHeight,
  },
  emptyStateSubtext: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: theme.typography.bodySmall.lineHeight,
  },
  // Enhanced Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  modalHeader: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textMuted,
  },
  modalHeaderContent: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  modalEmojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  modalEmoji: {
    fontSize: 40,
  },
  modalTitle: {
    ...theme.typography.sectionTitle,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  modalSubtitle: {
    ...theme.typography.body,
    color: colors.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
  modalContent: {
    flex: 1,
  },
  detailContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  careProviderCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
  },
  careProviderLabel: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  careProviderName: {
    ...theme.typography.sectionTitle,
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  detailTextCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
  },
  detailTextLabel: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  detailText: {
    ...theme.typography.body,
    color: colors.text,
    lineHeight: 24,
    fontSize: 16,
    fontStyle: "italic",
  },
  detailPhotoContainer: {
    gap: spacing.md,
  },
  detailPhotoLabel: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
  detailPhoto: {
    width: "100%",
    height: 250,
    borderRadius: radius.lg,
    borderWidth: 3,
  },
  detailTags: {
    gap: spacing.md,
  },
  detailTagsLabel: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
  detailTagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  detailTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  detailTagText: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
  },
  detailActions: {
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.borderLight,
    borderStyle: "dashed",
  },
  familyReactionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.sm,
    minHeight: 60,
  },
  familyReactionIcon: {
    fontSize: 24,
  },
  familyReactionText: {
    ...theme.typography.body,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  familyReactionCount: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
  },
  familyCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    minHeight: 60,
  },
  familyCommentIcon: {
    fontSize: 24,
  },
  familyCommentText: {
    ...theme.typography.body,
    color: colors.card,
    fontWeight: "600",
  },
  // Comment modal styles
  commentModal: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
  },
  cancelButton: {
    ...theme.typography.body,
    color: colors.textMuted,
  },
  submitButton: {
    ...theme.typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  commentInputContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  commentInput: {
    ...theme.typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 120,
    textAlignVertical: "top",
  },
});
