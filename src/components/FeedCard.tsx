import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radius, spacing, theme } from "../theme";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { FeedItem } from "../store/feedStore";

interface FeedCardProps {
  item: FeedItem;
  onToggleReaction: (itemId: string) => void;
  onComment?: (itemId: string) => void;
  onPress?: (item: FeedItem) => void;
  showAuthorBadge?: boolean;
  currentUserId?: string;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  item,
  onToggleReaction,
  onComment,
  onPress,
  showAuthorBadge = false,
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

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleReaction = () => {
    onToggleReaction(item.id);
  };

  const getReactionIcon = () => {
    if (reactions.reactedByMe) {
      return "❤️";
    }
    return "🤍";
  };

  const getReactionCountColor = () => {
    if (reactions.reactedByMe) {
      return "#dc2626";
    }
    return colors.textMuted;
  };

  const handleComment = () => {
    if (onComment) {
      onComment(item.id);
    }
  };

  const reactions = item.reactions || { heart: 0, reactedByMe: false };

  return (
    <TouchableOpacity
      style={styles.feedCardContainer}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.feedCard}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
            {showAuthorBadge && (
              <View
                style={[
                  styles.authorBadge,
                  item.authorId === currentUserId && styles.authorBadgeMe,
                ]}
              >
                <Text style={styles.authorBadgeText}>
                  {item.authorId === currentUserId
                    ? "Me"
                    : getAuthorName(item.authorId)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>

        {/* Content */}
        {item.text && <Text style={styles.contentText}>{item.text}</Text>}

        {/* Photo */}
        {item.photoUrl && (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: item.photoUrl }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag) => (
              <Badge key={tag} label={tag} style={styles.tag} />
            ))}
          </View>
        )}

        {/* Footer - Reactions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={handleReaction}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionIcon}>{getReactionIcon()}</Text>
            {reactions.heart > 0 && (
              <Text
                style={[
                  styles.reactionCount,
                  { color: getReactionCountColor() },
                ]}
              >
                {reactions.heart}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reactionButton}
            onPress={handleComment}
          >
            <Text style={styles.reactionIcon}>💬</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  feedCardContainer: {
    marginBottom: spacing.md,
  },
  feedCard: {
    marginBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  authorBadge: {
    backgroundColor: colors.chipBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  authorBadgeMe: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  authorBadgeText: {
    ...theme.typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
  authorBadgeMeText: {
    ...theme.typography.caption,
    color: colors.card,
    fontWeight: "500",
  },
  typeText: {
    ...theme.typography.bodySmall,
    fontWeight: "600",
    color: colors.text,
    textTransform: "uppercase",
  },
  timestamp: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },
  contentText: {
    ...theme.typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: theme.typography.body.lineHeight,
  },
  photoContainer: {
    marginBottom: spacing.sm,
  },
  photo: {
    width: "100%",
    height: 180,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  reactionIcon: {
    fontSize: 18,
  },
  reactionIconActive: {
    // Heart is already red when active
  },
  reactionCount: {
    ...theme.typography.caption,
    color: colors.textMuted,
    minWidth: 16,
    textAlign: "center",
  },
});
