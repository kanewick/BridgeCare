import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Avatar } from "../Avatar";
import { colors, radius, spacing, shadow, theme } from "../../theme";

interface Resident {
  id: string;
  name: string;
  room?: string;
  avatar?: string;
  photoConsent?: boolean;
}

interface ResidentPickerProps {
  residents: Resident[];
  selectedResidentId?: string | null;
  onSelectResident: (residentId: string) => void;
  recentResidentIds?: string[];
  testID?: string;
}

const ResidentChip: React.FC<{
  resident: Resident;
  isSelected: boolean;
  onPress: () => void;
  testID: string;
}> = ({ resident, isSelected, onPress, testID }) => {
  const scaleAnim = useSharedValue(1);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    scaleAnim.value = withSpring(0.95, { damping: 20, stiffness: 300 }, () => {
      scaleAnim.value = withSpring(1, { damping: 20, stiffness: 300 });
    });

    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.chipSelected]}
        onPress={handlePress}
        testID={testID}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`Select ${resident.name}${
          resident.room ? ` in room ${resident.room}` : ""
        }`}
      >
        <Avatar size="sm" name={resident.name} imageUrl={resident.avatar} />
        <View style={styles.chipContent}>
          <Text
            style={[styles.chipName, isSelected && styles.chipNameSelected]}
          >
            {resident.name}
          </Text>
          {resident.room && (
            <Text
              style={[styles.chipRoom, isSelected && styles.chipRoomSelected]}
            >
              Room {resident.room}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={colors.primary}
            style={styles.chipCheck}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ResidentPicker: React.FC<ResidentPickerProps> = ({
  residents,
  selectedResidentId,
  onSelectResident,
  recentResidentIds = [],
  testID = "resident-picker",
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAllResidents, setShowAllResidents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get selected resident
  const selectedResident = residents.find((r) => r.id === selectedResidentId);

  // Get recent residents (last 5)
  const recentResidents = recentResidentIds
    .map((id) => residents.find((r) => r.id === id))
    .filter(Boolean)
    .slice(0, 5) as Resident[];

  // Get filtered residents for "All" section
  const filteredResidents = residents.filter((resident) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resident.room &&
        resident.room.toLowerCase().includes(searchQuery.toLowerCase()));

    const notInRecent = !recentResidentIds.includes(resident.id);

    return matchesSearch && (showAllResidents ? true : notInRecent);
  });

  const renderRecentResident = ({ item }: { item: Resident }) => (
    <ResidentChip
      resident={item}
      isSelected={selectedResidentId === item.id}
      onPress={() => {
        onSelectResident(item.id);
        setIsMinimized(true);
      }}
      testID={`${testID}-chip-recent-${item.id}`}
    />
  );

  const renderAllResident = ({ item }: { item: Resident }) => (
    <ResidentChip
      resident={item}
      isSelected={selectedResidentId === item.id}
      onPress={() => {
        onSelectResident(item.id);
        setIsMinimized(true);
      }}
      testID={`${testID}-chip-all-${item.id}`}
    />
  );

  return (
    <View
      style={[styles.container, isMinimized && styles.containerMinimized]}
      testID={testID}
    >
      {/* Minimized view - show only blue chip */}
      {isMinimized && selectedResident ? (
        <TouchableOpacity
          style={styles.minimizedContent}
          onPress={() => setIsMinimized(false)}
          testID={`${testID}-selected-chip`}
        >
          <View style={styles.minimizedChip}>
            <Text style={styles.minimizedChipText}>
              {selectedResident.name}
              {selectedResident.room && ` • Room ${selectedResident.room}`}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <>
          {/* Header with minimize/expand toggle */}
          <TouchableOpacity
            style={styles.header}
            onPress={() => setIsMinimized(!isMinimized)}
            testID={`${testID}-toggle`}
            accessibilityRole="button"
            accessibilityLabel={`${
              isMinimized ? "Expand" : "Minimize"
            } resident selection`}
          >
            <View style={styles.headerContent}>
              <Text style={styles.sectionTitle}>Select Resident</Text>
            </View>
            <Ionicons name="chevron-up" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </>
      )}

      {/* Expanded view - show all residents */}
      {!isMinimized && (
        <>
          {/* Recent Residents */}
          {recentResidents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.subsectionTitle}>Recent</Text>
              <FlatList
                data={recentResidents}
                renderItem={renderRecentResident}
                keyExtractor={(item) => `recent-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => (
                  <View style={styles.chipSeparator} />
                )}
              />
            </View>
          )}

          {/* All Residents Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.allResidentsHeader}
              onPress={() => setShowAllResidents(!showAllResidents)}
              testID={`${testID}-toggle-all`}
              accessibilityRole="button"
              accessibilityLabel={`${
                showAllResidents ? "Hide" : "Show"
              } all residents`}
            >
              <Text style={styles.subsectionTitle}>All Residents</Text>
              <Ionicons
                name={showAllResidents ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {showAllResidents && (
              <>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search"
                    size={16}
                    color={colors.textMuted}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search residents..."
                    placeholderTextColor={colors.textFaint}
                    testID={`${testID}-search`}
                    accessibilityLabel="Search residents"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery("")}
                      style={styles.clearButton}
                      testID={`${testID}-clear-search`}
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* All Residents Grid */}
                <FlatList
                  data={filteredResidents}
                  renderItem={renderAllResident}
                  keyExtractor={(item) => `all-${item.id}`}
                  numColumns={1}
                  scrollEnabled={false}
                  contentContainerStyle={styles.verticalList}
                  ItemSeparatorComponent={() => (
                    <View style={styles.verticalSeparator} />
                  )}
                />
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  containerMinimized: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  headerMinimized: {
    paddingVertical: 2,
    marginBottom: 0,
  },
  headerContent: {
    flex: 1,
  },
  roomText: {
    ...theme.typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  roomTextMinimized: {
    fontSize: 12,
    marginTop: 1,
  },
  minimizedContent: {
    // No margin needed since it's the only content
  },
  minimizedChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  minimizedChipText: {
    ...theme.typography.captionMedium,
    color: colors.primary,
    textAlign: "center",
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: 0,
  },
  sectionTitleMinimized: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: spacing.md,
  },
  subsectionTitle: {
    ...theme.typography.bodyMedium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  allResidentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  horizontalList: {
    paddingRight: spacing.lg,
  },
  verticalList: {
    marginTop: spacing.sm,
  },
  chipSeparator: {
    width: spacing.sm,
  },
  verticalSeparator: {
    height: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    ...shadow.sm,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  chipContent: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  chipName: {
    ...theme.typography.bodyMedium,
    color: colors.text,
  },
  chipNameSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  chipRoom: {
    ...theme.typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  chipRoomSelected: {
    color: colors.primary,
  },
  chipCheck: {
    marginLeft: spacing.sm,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
