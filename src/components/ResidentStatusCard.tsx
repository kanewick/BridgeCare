import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, theme, shadow } from "../theme";
import { QuickAddDropdown } from "./QuickAddDropdown";

interface ResidentStatusCardProps {
  resident: {
    id: string;
    name: string;
    room?: string;
  };
  updateCount: number;
  lastUpdate?: {
    type: string;
    createdAt: string;
  };
  typeLabels: Record<string, string>;
  onPress: () => void;
  onQuickAdd: (residentId: string, actionId: string) => void;
}

export const ResidentStatusCard: React.FC<ResidentStatusCardProps> = ({
  resident,
  updateCount,
  lastUpdate,
  typeLabels,
  onPress,
  onQuickAdd,
}) => {
  const needsAttention = updateCount === 0;
  const hasMultipleUpdates = updateCount > 1;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeStatus = () => {
    if (!lastUpdate) return "No updates yet today";

    const now = new Date();
    const updateTime = new Date(lastUpdate.createdAt);
    const hoursDiff = Math.floor(
      (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60)
    );

    if (hoursDiff < 1) return "Recent";
    if (hoursDiff < 3) return `${hoursDiff}h ago`;
    return `${hoursDiff}h ago`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.residentCard,
        needsAttention && styles.residentCardAttention,
      ]}
      onPress={onPress}
    >
      <View style={styles.residentCardHeader}>
        <View style={styles.residentInfo}>
          <View style={styles.residentNameRow}>
            <Text style={styles.residentName}>{resident.name}</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
              style={styles.detailsIcon}
            />
          </View>
          {resident.room && (
            <Text style={styles.residentRoom}>Room {resident.room}</Text>
          )}
        </View>
        <View style={styles.residentStats}>
          {needsAttention ? (
            <View style={styles.attentionBadge}>
              <Text style={styles.attentionBadgeText}>Needs Attention</Text>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.updateCount,
                  hasMultipleUpdates && styles.updateCountMultiple,
                ]}
              >
                {updateCount}
              </Text>
              <Text style={styles.updateCountLabel}>
                {updateCount === 1 ? "update" : "updates"}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.residentCardFooter}>
        <View style={styles.lastUpdateInfo}>
          {lastUpdate ? (
            <>
              <Text style={styles.lastUpdateType}>
                {typeLabels[lastUpdate.type]} •{" "}
                {formatTime(lastUpdate.createdAt)}
              </Text>
              <Text style={styles.timeStatus}>{getTimeStatus()}</Text>
            </>
          ) : (
            <Text style={styles.noUpdateText}>No updates today</Text>
          )}
        </View>

        <QuickAddDropdown
          onActionSelect={(actionId) => onQuickAdd(resident.id, actionId)}
          style={styles.quickAddDropdown}
          testID={`quick-add-${resident.id}`}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  residentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  residentName: {
    ...theme.typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
  },
  detailsIcon: {
    marginLeft: spacing.xs,
  },
  residentRoom: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },
  residentStats: {
    alignItems: "center",
    marginLeft: spacing.md,
    minWidth: 80,
  },
  attentionBadge: {
    backgroundColor: colors.warning,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  attentionBadgeText: {
    ...theme.typography.caption,
    color: colors.card,
    fontWeight: "600",
    textAlign: "center",
  },
  updateCount: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    lineHeight: 28,
  },
  updateCountMultiple: {
    color: colors.success,
  },
  updateCountLabel: {
    ...theme.typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 2,
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
    marginBottom: 2,
  },
  timeStatus: {
    ...theme.typography.caption,
    color: colors.textFaint,
    fontSize: 11,
  },
  noUpdateText: {
    ...theme.typography.caption,
    color: colors.warning,
    fontWeight: "500",
    fontStyle: "italic",
  },
  quickAddDropdown: {
    marginLeft: spacing.sm,
  },
});
