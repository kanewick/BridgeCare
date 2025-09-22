import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, shadow, theme } from "../theme";
import { Avatar } from "./Avatar";
import { StatusChip, StatusType } from "./StatusChip";

interface ResidentCardProps {
  resident: {
    id: string;
    name: string;
    room?: string;
    avatar?: string;
    photoConsent?: boolean;
  };
  isSelected?: boolean;
  onPress: () => void;
  status?: StatusType;
}

export const ResidentCard: React.FC<ResidentCardProps> = ({
  resident,
  isSelected = false,
  onPress,
  status = "active",
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim.current, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim.current, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  };

  const getConsentIcon = () => {
    if (resident.photoConsent === undefined) return null;

    return (
      <View style={styles.consentContainer}>
        <Ionicons
          name={resident.photoConsent ? "camera" : "camera-outline"}
          size={16}
          color={resident.photoConsent ? colors.success : colors.textMuted}
          style={styles.consentIcon}
        />
        <Text style={styles.consentLabel}>
          {resident.photoConsent ? "Photos OK" : "No photos"}
        </Text>
      </View>
    );
  };

  const getStatusAccentColor = () => {
    switch (status) {
      case "active":
        return colors.statusActive;
      case "inactive":
        return colors.statusInactive;
      case "restricted":
        return colors.statusRestricted;
      default:
        return colors.statusInactive;
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        { transform: [{ scale: scaleAnim.current }] },
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Select ${resident.name}${
          resident.room ? ` in room ${resident.room}` : ""
        }`}
        accessibilityState={{ selected: isSelected }}
      >
        {/* Status accent bar */}
        <View
          style={[
            styles.statusAccent,
            { backgroundColor: getStatusAccentColor() },
          ]}
        />

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Left: Avatar and info */}
          <View style={styles.leftSection}>
            <Avatar size="lg" name={resident.name} imageUrl={resident.avatar} />
            <View style={styles.residentInfo}>
              <Text style={styles.residentName}>{resident.name}</Text>
              {resident.room && (
                <Text style={styles.roomNumber}>Room {resident.room}</Text>
              )}
              <View style={styles.statusRow}>
                <StatusChip status={status} />
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.selectedText}>Selected</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Right: Photo consent */}
          <View style={styles.rightSection}>{getConsentIcon()}</View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadow.card,
    marginBottom: spacing.md,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadow.md,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  statusAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  residentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  residentName: {
    ...theme.typography.residentName,
    color: colors.text,
    marginBottom: 2,
  },
  roomNumber: {
    ...theme.typography.roomNumber,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    gap: 4,
  },
  selectedText: {
    ...theme.typography.captionMedium,
    color: colors.primary,
    fontSize: 11,
  },
  rightSection: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  consentContainer: {
    alignItems: "center",
    gap: 4,
  },
  consentIcon: {
    marginBottom: 2,
  },
  consentLabel: {
    ...theme.typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 11,
  },
});
