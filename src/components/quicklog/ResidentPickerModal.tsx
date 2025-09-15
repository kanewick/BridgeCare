import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, theme, shadow } from "../../theme";
import { Resident } from "../../store/feedStore";

// Local ResidentChip component (copied from ResidentPicker.tsx)
const ResidentChip: React.FC<{
  resident: Resident;
  isSelected: boolean;
  onPress: () => void;
  testID: string;
}> = ({ resident, isSelected, onPress, testID }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Select ${resident.name}`}
    >
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {resident.name}
      </Text>
      {resident.room && (
        <Text style={[styles.chipRoom, isSelected && styles.chipRoomSelected]}>
          Room {resident.room}
        </Text>
      )}
    </TouchableOpacity>
  );
};

interface ResidentPickerModalProps {
  visible: boolean;
  onClose: () => void;
  residents: Resident[];
  selectedResidentId: string | null;
  onSelectResident: (residentId: string) => void;
  recentResidentIds: string[];
  testID?: string;
}

const { height: screenHeight } = Dimensions.get("window");

export const ResidentPickerModal: React.FC<ResidentPickerModalProps> = ({
  visible,
  onClose,
  residents,
  selectedResidentId,
  onSelectResident,
  recentResidentIds,
  testID = "resident-picker-modal",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleResidentSelect = (residentId: string) => {
    onSelectResident(residentId);
    onClose();
  };

  const filteredResidents = residents.filter((resident) =>
    resident.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentResidents = residents.filter((resident) =>
    recentResidentIds.includes(resident.id)
  );

  const renderResident = ({ item }: { item: Resident }) => (
    <ResidentChip
      resident={item}
      isSelected={item.id === selectedResidentId}
      onPress={() => handleResidentSelect(item.id)}
      testID={`${testID}-chip-${item.id}`}
    />
  );

  const renderRecentResident = ({ item }: { item: Resident }) => (
    <ResidentChip
      resident={item}
      isSelected={item.id === selectedResidentId}
      onPress={() => handleResidentSelect(item.id)}
      testID={`${testID}-chip-recent-${item.id}`}
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            testID={`${testID}-close`}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Resident</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Recent Residents */}
        {recentResidents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <FlatList
              data={recentResidents}
              renderItem={renderRecentResident}
              keyExtractor={(item) => `recent-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipList}
            />
          </View>
        )}

        {/* All Residents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Residents</Text>
          <FlatList
            data={filteredResidents}
            renderItem={renderResident}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.residentGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...theme.typography.heading,
    color: colors.text,
  },
  headerSpacer: {
    width: 40, // Same width as close button for centering
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  residentGrid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    alignItems: "center",
    minWidth: 120,
  },
  chipSelected: {
    backgroundColor: colors.chipActive,
    borderColor: colors.chipActiveBorder,
  },
  chipText: {
    ...theme.typography.bodyMedium,
    color: colors.text,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: colors.primary,
  },
  chipRoom: {
    ...theme.typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  chipRoomSelected: {
    color: colors.primary,
  },
});
