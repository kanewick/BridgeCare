import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { colors, spacing, radius, theme } from "../../theme";
import { Header } from "../../components/Header";
import { ActivitiesTab } from "../../components/quicklog/ActivitiesTab";
import { useFeedStore } from "../../store/feedStore";

interface RouteParams {
  residentId?: string;
  preselectedAction?: string;
  batchResidents?: string[];
}

export const StaffQuickLogScreen: React.FC = () => {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;

  const { residents, activeResidentId, setActiveResident } = useFeedStore();
  const [showResidentPicker, setShowResidentPicker] = useState(false);

  // Handle navigation parameters
  useEffect(() => {
    if (params?.residentId && params.residentId !== activeResidentId) {
      setActiveResident(params.residentId);
    }
  }, [params, activeResidentId, setActiveResident]);

  // Get selected resident
  const selectedResident = residents.find((r) => r.id === activeResidentId);

  const handleResidentSelect = (residentId: string) => {
    setActiveResident(residentId);
    setShowResidentPicker(false);
  };

  const handleHeaderPress = () => {
    setShowResidentPicker(true);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Quick Log"
        subtitle={
          selectedResident
            ? selectedResident.name
            : "Select a resident to get started"
        }
        showSettings={true}
        onPress={handleHeaderPress}
      />

      <ActivitiesTab
        residentId={activeResidentId}
        testID="activities-tab-content"
      />

      {/* Simple Resident Picker */}
      {showResidentPicker && (
        <View style={styles.residentPickerOverlay}>
          <View style={styles.residentPickerModal}>
            <Text style={styles.modalTitle}>Select Resident</Text>
            {residents.map((resident) => (
              <TouchableOpacity
                key={resident.id}
                style={[
                  styles.residentOption,
                  activeResidentId === resident.id &&
                    styles.residentOptionSelected,
                ]}
                onPress={() => handleResidentSelect(resident.id)}
              >
                <Text style={styles.residentOptionText}>{resident.name}</Text>
                {resident.room && (
                  <Text style={styles.residentRoom}>Room {resident.room}</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowResidentPicker(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  residentPickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  residentPickerModal: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    ...theme.typography.heading,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  residentOption: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  residentOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  residentOptionText: {
    ...theme.typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  residentRoom: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  closeButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.border,
    borderRadius: radius.md,
    alignItems: "center",
  },
  closeButtonText: {
    ...theme.typography.bodyMedium,
    color: colors.text,
    fontWeight: "600",
  },
});
