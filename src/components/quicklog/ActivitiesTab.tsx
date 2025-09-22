import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, theme } from "../../theme";
import { useFeedStore } from "../../store/feedStore";

interface ActivitiesTabProps {
  residentId: string | null;
  testID?: string;
}

// Action types with sub-options for quick logging
const QUICK_ACTIONS = [
  {
    id: "meal",
    label: "Meal",
    icon: "restaurant-outline" as const,
    color: "#10B981",
    options: [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Snack",
      "Full meal",
      "Partial meal",
      "Refused meal",
    ],
  },
  {
    id: "meds",
    label: "Medication",
    icon: "medical-outline" as const,
    color: "#3B82F6",
    options: [
      "Morning meds",
      "Afternoon meds",
      "Evening meds",
      "PRN medication",
      "Refused medication",
    ],
  },
  {
    id: "activity",
    label: "Activity",
    icon: "walk-outline" as const,
    color: "#F59E0B",
    options: [
      "Walking",
      "Physiotherapy",
      "Group activity",
      "Recreation",
      "Exercise",
      "Outdoor time",
    ],
  },
  {
    id: "rest",
    label: "Rest",
    icon: "bed-outline" as const,
    color: "#8B5CF6",
    options: ["Nap", "Sleep", "Bed rest", "Restless", "Good sleep"],
  },
  {
    id: "bathroom",
    label: "Bathroom",
    icon: "water-outline" as const,
    color: "#06B6D4",
    options: ["Toilet", "Incontinence", "Assistance needed", "Independent"],
  },
  {
    id: "hygiene",
    label: "Hygiene",
    icon: "sparkles-outline" as const,
    color: "#EC4899",
    options: [
      "Shower",
      "Bath",
      "Wash",
      "Teeth brushing",
      "Hair care",
      "Assistance needed",
    ],
  },
] as const;

export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  residentId,
  testID = "activities-tab",
}) => {
  const { addFeedItem } = useFeedStore();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [currentActionForOptions, setCurrentActionForOptions] = useState<
    string | null
  >(null);

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(selectedAction === actionId ? null : actionId);
    if (selectedAction !== actionId) {
      setSelectedOption(null); // Clear option when changing action
    }
  };

  const handleLongPress = (actionId: string) => {
    setCurrentActionForOptions(actionId);
    setShowOptionsModal(true);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setSelectedAction(currentActionForOptions);
    setShowOptionsModal(false);
  };

  const handleSubmit = async () => {
    if (!residentId || !selectedAction) {
      Alert.alert("Missing Information", "Please select an action to log.");
      return;
    }

    setIsSubmitting(true);

    try {
      const logText = selectedOption
        ? `${selectedOption}${note.trim() ? ` - ${note.trim()}` : ""}`
        : note.trim() || undefined;

      addFeedItem({
        residentId,
        authorId: "staff-user",
        type: selectedAction as any,
        text: logText,
        tags: selectedOption ? [selectedOption] : [],
      });

      // Reset form
      setSelectedAction(null);
      setSelectedOption(null);
      setNote("");

      Alert.alert("Success", "Update logged successfully!");
    } catch (error) {
      console.error("Error submitting quick log:", error);
      Alert.alert("Error", "Failed to log update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!residentId) {
    return (
      <View style={styles.container} testID={testID}>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyStateText}>
            Please select a resident to begin logging
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Action Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What would you like to log?</Text>
            <View style={styles.actionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.actionButton,
                    selectedAction === action.id && styles.actionButtonSelected,
                    { borderColor: action.color },
                  ]}
                  onPress={() => handleActionSelect(action.id)}
                  onLongPress={() => handleLongPress(action.id)}
                  delayLongPress={500}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: selectedAction === action.id,
                  }}
                  accessibilityLabel={`${action.label} action - Hold to see options`}
                  accessibilityHint="Hold for more options"
                >
                  <Ionicons
                    name={action.icon}
                    size={32}
                    color={
                      selectedAction === action.id ? "#FFFFFF" : action.color
                    }
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      selectedAction === action.id &&
                        styles.actionButtonTextSelected,
                      {
                        color:
                          selectedAction === action.id
                            ? "#FFFFFF"
                            : action.color,
                      },
                    ]}
                  >
                    {action.label}
                  </Text>
                  {selectedAction === action.id && selectedOption && (
                    <Text
                      style={[styles.selectedOptionText, { color: "#FFFFFF" }]}
                    >
                      {selectedOption}
                    </Text>
                  )}
                  <View style={styles.longPressIndicator}>
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={16}
                      color={
                        selectedAction === action.id ? "#FFFFFF" : action.color
                      }
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Note Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add a note (optional)</Text>
            <View style={styles.noteContainer}>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add any additional details about this update..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={300}
                textAlignVertical="top"
                accessibilityLabel="Note input"
              />
              <Text style={styles.characterCount}>{note.length}/300</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedAction || isSubmitting) && styles.submitButtonDisabled,
              selectedAction && {
                backgroundColor:
                  QUICK_ACTIONS.find((a) => a.id === selectedAction)?.color ||
                  colors.primary,
              },
            ]}
            onPress={handleSubmit}
            disabled={!selectedAction || isSubmitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: !selectedAction || isSubmitting }}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Logging..." : "Log Update"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <Text style={styles.modalTitle}>
              Choose{" "}
              {
                QUICK_ACTIONS.find((a) => a.id === currentActionForOptions)
                  ?.label
              }{" "}
              Option
            </Text>
            <ScrollView style={styles.optionsScrollView}>
              {currentActionForOptions &&
                QUICK_ACTIONS.find(
                  (a) => a.id === currentActionForOptions
                )?.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.optionButton}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Text style={styles.optionButtonText}>{option}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    ...theme.typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionButton: {
    width: "47%",
    aspectRatio: 1.2,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  actionButtonSelected: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    ...theme.typography.bodyMedium,
    fontWeight: "600",
    textAlign: "center",
  },
  actionButtonTextSelected: {
    color: "#FFFFFF",
  },
  noteContainer: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  noteInput: {
    ...theme.typography.body,
    color: colors.text,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: "top",
  },
  characterCount: {
    ...theme.typography.caption,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    ...theme.typography.body,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  selectedOptionText: {
    ...theme.typography.caption,
    textAlign: "center",
    marginTop: spacing.xs,
    fontWeight: "500",
  },
  longPressIndicator: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  optionsModal: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: "90%",
    maxHeight: "70%",
  },
  modalTitle: {
    ...theme.typography.heading,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  optionsScrollView: {
    maxHeight: 300,
  },
  optionButton: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  optionButtonText: {
    ...theme.typography.body,
    color: colors.text,
    textAlign: "center",
    fontWeight: "500",
  },
  cancelButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.border,
    borderRadius: radius.md,
    alignItems: "center",
  },
  cancelButtonText: {
    ...theme.typography.body,
    color: colors.text,
    fontWeight: "600",
  },
});
