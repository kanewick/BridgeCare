import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, theme, shadow } from "../theme";

interface Resident {
  id: string;
  name: string;
  room?: string;
}

interface BatchLoggingModalProps {
  visible: boolean;
  residents: Resident[];
  selectedAction: {
    id: string;
    label: string;
    emoji: string;
  } | null;
  onClose: () => void;
  onSubmit: (residentIds: string[], actionId: string) => void;
}

export const BatchLoggingModal: React.FC<BatchLoggingModalProps> = ({
  visible,
  residents,
  selectedAction,
  onClose,
  onSubmit,
}) => {
  const [selectedResidents, setSelectedResidents] = useState<Set<string>>(
    new Set()
  );

  const handleResidentToggle = (residentId: string) => {
    const newSelection = new Set(selectedResidents);
    if (newSelection.has(residentId)) {
      newSelection.delete(residentId);
    } else {
      newSelection.add(residentId);
    }
    setSelectedResidents(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedResidents.size === residents.length) {
      setSelectedResidents(new Set());
    } else {
      setSelectedResidents(new Set(residents.map((r) => r.id)));
    }
  };

  const handleSubmit = () => {
    if (selectedResidents.size === 0) {
      Alert.alert("No Selection", "Please select at least one resident.");
      return;
    }

    if (!selectedAction) {
      Alert.alert("No Action", "Please select an action type.");
      return;
    }

    onSubmit(Array.from(selectedResidents), selectedAction.id);
    setSelectedResidents(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelectedResidents(new Set());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Batch Logging</Text>
            {selectedAction && (
              <Text style={styles.subtitle}>
                {selectedAction.emoji} {selectedAction.label} for multiple
                residents
              </Text>
            )}
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.selectionControls}>
            <TouchableOpacity
              onPress={handleSelectAll}
              style={styles.selectAllButton}
            >
              <Text style={styles.selectAllText}>
                {selectedResidents.size === residents.length
                  ? "Deselect All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.selectionCount}>
              {selectedResidents.size} of {residents.length} selected
            </Text>
          </View>

          <ScrollView
            style={styles.residentsList}
            showsVerticalScrollIndicator={false}
          >
            {residents.map((resident) => {
              const isSelected = selectedResidents.has(resident.id);
              return (
                <TouchableOpacity
                  key={resident.id}
                  style={[
                    styles.residentItem,
                    isSelected && styles.residentItemSelected,
                  ]}
                  onPress={() => handleResidentToggle(resident.id)}
                >
                  <View style={styles.residentInfo}>
                    <Text
                      style={[
                        styles.residentName,
                        isSelected && styles.residentNameSelected,
                      ]}
                    >
                      {resident.name}
                    </Text>
                    {resident.room && (
                      <Text
                        style={[
                          styles.residentRoom,
                          isSelected && styles.residentRoomSelected,
                        ]}
                      >
                        Room {resident.room}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.card}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedResidents.size === 0 && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={selectedResidents.size === 0}
          >
            <Text
              style={[
                styles.submitButtonText,
                selectedResidents.size === 0 && styles.submitButtonTextDisabled,
              ]}
            >
              Log for {selectedResidents.size} Resident
              {selectedResidents.size !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    ...theme.typography.heading,
    color: colors.text,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  selectionControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  selectAllButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectAllText: {
    ...theme.typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  selectionCount: {
    ...theme.typography.bodySmall,
    color: colors.textMuted,
  },
  residentsList: {
    flex: 1,
  },
  residentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    minHeight: 64, // Better tap target
  },
  residentItemSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
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
  residentNameSelected: {
    color: colors.primary,
  },
  residentRoom: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },
  residentRoomSelected: {
    color: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
    ...shadow.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textFaint,
  },
  submitButtonText: {
    ...theme.typography.button,
    color: colors.card,
  },
  submitButtonTextDisabled: {
    color: colors.textMuted,
  },
});
