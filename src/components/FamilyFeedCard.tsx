import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radius, spacing, theme } from "../theme";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { FeedItem } from "../store/feedStore";

interface FamilyFeedCardProps {
  item: FeedItem;
  onToggleReaction: (itemId: string) => void;
  onComment?: (itemId: string) => void;
  onPress?: (item: FeedItem) => void;
  currentUserId?: string;
}

export const FamilyFeedCard: React.FC<FamilyFeedCardProps> = ({
  item,
  onToggleReaction,
  onComment,
  onPress,
  currentUserId,
}) => {
  // Map author IDs to display names
  const getAuthorName = (authorId: string) => {
    const authorNames: Record<string, string> = {
      "skarlette-choi": "Skarlette Choi",
      nurse1: "Nurse Smith",
      nurse2: "Nurse Johnson",
    };
    return authorNames[authorId] || authorId;
  };

  // Get update type configuration for family-friendly display
  const getUpdateConfig = (type: string) => {
    const configs: Record<
      string,
      {
        emoji: string;
        bgColor: string;
        borderColor: string;
        title: string;
        description: string;
        gradient: string[];
      }
    > = {
      meal: {
        emoji: "🍽️",
        bgColor: "#FFF7ED", // Warm orange background
        borderColor: "#FB923C",
        title: "Mealtime",
        description: "Enjoyed a delicious",
        gradient: ["#FFF7ED", "#FFEDD5"],
      },
      meds: {
        emoji: "💊",
        bgColor: "#F0F9FF", // Light blue background
        borderColor: "#0EA5E9",
        title: "Medication",
        description: "Medication care",
        gradient: ["#F0F9FF", "#E0F2FE"],
      },
      activity: {
        emoji: "🎨",
        bgColor: "#F0FDF4", // Light green background
        borderColor: "#10B981",
        title: "Activity Time",
        description: "Had fun with",
        gradient: ["#F0FDF4", "#DCFCE7"],
      },
      rest: {
        emoji: "😴",
        bgColor: "#FDF4FF", // Light purple background
        borderColor: "#A855F7",
        title: "Rest Time",
        description: "Peaceful rest",
        gradient: ["#FDF4FF", "#FAE8FF"],
      },
      bathroom: {
        emoji: "🚿",
        bgColor: "#F8FAFC", // Light gray background
        borderColor: "#64748B",
        title: "Personal Care",
        description: "Personal care",
        gradient: ["#F8FAFC", "#F1F5F9"],
      },
      hygiene: {
        emoji: "🛁",
        bgColor: "#F0F9FF", // Light cyan background
        borderColor: "#06B6D4",
        title: "Self Care",
        description: "Self care time",
        gradient: ["#F0F9FF", "#CFFAFE"],
      },
      dressing: {
        emoji: "👔",
        bgColor: "#FFFBEB", // Light yellow background
        borderColor: "#F59E0B",
        title: "Getting Ready",
        description: "Getting dressed",
        gradient: ["#FFFBEB", "#FEF3C7"],
      },
      mobility: {
        emoji: "🚶",
        bgColor: "#F0FDF4", // Light green background
        borderColor: "#059669",
        title: "Moving Around",
        description: "Moving and walking",
        gradient: ["#F0FDF4", "#D1FAE5"],
      },
      photo: {
        emoji: "📸",
        bgColor: "#FEF2F2", // Light pink background
        borderColor: "#EF4444",
        title: "Special Moment",
        description: "Captured a memory",
        gradient: ["#FEF2F2", "#FEE2E2"],
      },
      note: {
        emoji: "📝",
        bgColor: "#F8FAFC", // Light gray background
        borderColor: "#475569",
        title: "Care Note",
        description: "Care team note",
        gradient: ["#F8FAFC", "#E2E8F0"],
      },
    };
    return configs[type] || configs.note;
  };

  // Format timestamp in a family-friendly way
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 2) {
      return "1 hour ago";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return "Yesterday";
      } else {
        return `${diffInDays} days ago`;
      }
    }
  };

  const config = getUpdateConfig(item.type);
  const reactions = item.reactions || { heart: 0, reactedByMe: false };
  const authorName = getAuthorName(item.authorId);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      <Card
        style={[
          styles.card,
          { backgroundColor: config.bgColor, borderColor: config.borderColor },
        ]}
      >
        {/* Header with emoji and type */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.emojiContainer,
                { backgroundColor: config.borderColor + "20" },
              ]}
            >
              <Text style={styles.emoji}>{config.emoji}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: config.borderColor }]}>
                {config.title}
              </Text>
              <Text style={styles.subtitle}>{config.description}</Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Content */}
        {item.text && (
          <View style={styles.content}>
            <Text style={styles.contentText}>"{item.text}"</Text>
          </View>
        )}

        {/* Photo */}
        {item.photoUrl && (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: item.photoUrl }}
              style={[styles.photo, { borderColor: config.borderColor }]}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  { backgroundColor: config.borderColor + "15" },
                ]}
              >
                <Text style={[styles.tagText, { color: config.borderColor }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text
                style={[styles.moreTagsText, { color: config.borderColor }]}
              >
                +{item.tags.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.authorContainer}>
            <Text style={styles.authorText}>
              Care by{" "}
              <Text style={[styles.authorName, { color: config.borderColor }]}>
                {authorName}
              </Text>
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.reactionButton,
                { backgroundColor: config.borderColor + "10" },
              ]}
              onPress={() => onToggleReaction(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionIcon}>
                {reactions.reactedByMe ? "❤️" : "🤍"}
              </Text>
              {reactions.heart > 0 && (
                <Text
                  style={[styles.reactionCount, { color: config.borderColor }]}
                >
                  {reactions.heart}
                </Text>
              )}
            </TouchableOpacity>

            {onComment && (
              <TouchableOpacity
                style={[
                  styles.commentButton,
                  { backgroundColor: config.borderColor + "10" },
                ]}
                onPress={() => onComment(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.commentIcon}>💬</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: 0,
    borderWidth: 2,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...theme.typography.bodySmall,
    fontWeight: "700",
    marginBottom: spacing.xs,
    fontSize: 16,
  },
  subtitle: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  timestamp: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
  content: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  contentText: {
    ...theme.typography.body,
    color: colors.text,
    lineHeight: 22,
    fontStyle: "italic",
  },
  photoContainer: {
    marginBottom: spacing.md,
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: radius.lg,
    borderWidth: 3,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  tagText: {
    ...theme.typography.caption,
    fontWeight: "600",
    fontSize: 12,
  },
  moreTagsText: {
    ...theme.typography.caption,
    fontWeight: "500",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  authorContainer: {
    flex: 1,
  },
  authorText: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },
  authorName: {
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    gap: spacing.xs,
    minWidth: 50,
    justifyContent: "center",
  },
  reactionIcon: {
    fontSize: 16,
  },
  reactionCount: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  commentButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    minWidth: 40,
  },
  commentIcon: {
    fontSize: 16,
  },
});
