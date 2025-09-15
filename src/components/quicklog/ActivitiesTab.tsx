import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { colors } from "../../theme";
import { RecentsRow, RecentAction } from "./RecentsRow";
import { NoteField } from "./NoteField";
import { PhotoPicker } from "./PhotoPicker";
import { QuickActionsSection } from "./QuickActionsSection";
import { ActionBottomSheet } from "./ActionBottomSheet";
import { SelectedState } from "./ActionTile";
import { useFeedStore } from "../../store/feedStore";
import {
  QUICK_ACTIONS,
  CATEGORY_ORDER,
  getActionsByCategory,
  getActionById,
  getDefaultVariant,
  getNextCycleVariant,
  QuickAction,
} from "../../data/quickActions";

interface ActivitiesTabProps {
  residentId: string | null;
  testID?: string;
}

export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  residentId,
  testID = "activities-tab",
}) => {
  const { residents, addFeedItem } = useFeedStore();
  const keyboardHeight = useSharedValue(0);

  // Form state - new model
  const [selectedActions, setSelectedActions] = useState<SelectedState>({});
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [note, setNote] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bottom sheet state
  const [bottomSheetAction, setBottomSheetAction] =
    useState<QuickAction | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Recent residents (mock implementation - in real app would come from user activity)
  const recentResidentIds = useMemo(() => {
    return residents.slice(0, 3).map((r) => r.id);
  }, [residents]);

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        keyboardHeight.value = withSpring(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        keyboardHeight.value = withSpring(0);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const handleActionPress = (action: QuickAction) => {
    setBottomSheetAction(action);
    setShowBottomSheet(true);
  };

  const handleActionToggle = (actionId: string) => {
    const action = getActionById(actionId);
    if (!action) return;

    if (selectedActions[actionId]) {
      // If already selected, cycle to next variant or deselect
      const currentVariant = selectedActions[actionId];
      const nextVariant = getNextCycleVariant(action, currentVariant);

      if (nextVariant) {
        setSelectedActions((prev) => ({
          ...prev,
          [actionId]: nextVariant,
        }));
      } else {
        // No cycle defined, just deselect
        setSelectedActions((prev) => {
          const newState = { ...prev };
          delete newState[actionId];
          return newState;
        });
      }
    } else {
      // Select with default variant
      const defaultVariant = getDefaultVariant(action);
      setSelectedActions((prev) => ({
        ...prev,
        [actionId]: defaultVariant?.id || "default",
      }));
    }
  };

  const handleVariantToggle = (actionId: string, variantId: string) => {
    const isCurrentlySelected = selectedActions[actionId] === variantId;

    if (isCurrentlySelected) {
      // Deselect
      setSelectedActions((prev) => {
        const newState = { ...prev };
        delete newState[actionId];
        return newState;
      });
    } else {
      // Select this variant
      setSelectedActions((prev) => ({
        ...prev,
        [actionId]: variantId,
      }));
    }
  };

  const handleRecentSelect = (recentAction: RecentAction) => {
    const action = getActionById(recentAction.actionId);
    if (!action) return;

    setSelectedActions((prev) => ({
      ...prev,
      [recentAction.actionId]: recentAction.variantId,
    }));
  };

  const handleSubmit = async () => {
    if (!residentId) return;

    setIsSubmitting(true);

    try {
      const selectedActionIds = Object.keys(selectedActions);

      if (
        selectedActionIds.length === 0 &&
        !note &&
        selectedPhotos.length === 0
      ) {
        throw new Error("Please select at least one action or add a note");
      }

      // Submit each selected action as a separate feed item
      for (const actionId of selectedActionIds) {
        const action = getActionById(actionId);
        const variantId = selectedActions[actionId];

        if (action) {
          const variant = action.variants?.find((v) => v.id === variantId);
          const tags = variant ? [variant.id] : [];

          addFeedItem({
            residentId,
            authorId: "staff-user", // Would come from auth
            type: action.id as any,
            text: note || undefined,
            tags,
            photoUrl: selectedPhotos[0] || undefined,
          });
        }
      }

      // If only note/photo without action, create a note entry
      if (
        selectedActionIds.length === 0 &&
        (note || selectedPhotos.length > 0)
      ) {
        addFeedItem({
          residentId,
          authorId: "staff-user",
          type: "note",
          text: note || "Photo update",
          tags: [],
          photoUrl: selectedPhotos[0] || undefined,
        });
      }

      // Update recents
      const newRecents: RecentAction[] = selectedActionIds.map((actionId) => ({
        actionId,
        variantId: selectedActions[actionId],
        timestamp: new Date().toISOString(),
      }));

      setRecentActions((prev) => [...newRecents, ...prev].slice(0, 6));

      // Clear form
      setSelectedActions({});
      setNote("");
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Error submitting quick log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    return (
      Object.keys(selectedActions).length > 0 ||
      note.trim() ||
      selectedPhotos.length > 0
    );
  }, [selectedActions, note, selectedPhotos]);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: keyboardHeight.value > 0 ? keyboardHeight.value + 20 : 80,
    };
  });

  if (!residentId) {
    return (
      <View style={styles.container} testID={testID}>
        <View style={styles.emptyState}>
          {/* This would be rendered by parent component */}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, contentAnimatedStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recents Row */}
        <RecentsRow
          recents={recentActions}
          onSelectRecent={handleRecentSelect}
          testID="quick-log-recents"
        />

        {/* Categorized Quick Actions */}
        {CATEGORY_ORDER.map((categoryKey) => {
          const actions = getActionsByCategory(categoryKey);
          return (
            <QuickActionsSection
              key={categoryKey}
              categoryKey={categoryKey}
              actions={actions}
              selectedActions={selectedActions}
              onActionPress={handleActionPress}
              onActionToggle={handleActionToggle}
              testID={`quick-actions-${categoryKey}`}
            />
          );
        })}

        {/* Note Field */}
        <NoteField
          value={note}
          onChangeText={setNote}
          placeholder="Add any additional notes about this update..."
          testID="quick-log-note"
        />

        {/* Photo Picker */}
        <PhotoPicker
          selectedPhotos={selectedPhotos}
          onPhotosChange={setSelectedPhotos}
          testID="quick-log-photos"
        />

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            <Text
              style={[
                styles.submitButtonText,
                !isFormValid && styles.submitButtonTextDisabled,
              ]}
            >
              {isSubmitting ? "Adding Update..." : "Add Update"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* Action Bottom Sheet */}
      <ActionBottomSheet
        action={bottomSheetAction}
        selected={
          bottomSheetAction ? selectedActions[bottomSheetAction.id] : undefined
        }
        visible={showBottomSheet}
        onClose={() => {
          setShowBottomSheet(false);
          setBottomSheetAction(null);
        }}
        onVariantToggle={(actionId, variantId) => {
          handleVariantToggle(actionId, variantId);
          setShowBottomSheet(false);
          setBottomSheetAction(null);
        }}
        onNotesChange={() => {}}
        onMetricsChange={() => {}}
        testID="action-bottom-sheet"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  submitContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonTextDisabled: {
    color: colors.textTertiary,
  },
});
