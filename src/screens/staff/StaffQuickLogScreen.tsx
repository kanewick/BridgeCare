import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Keyboard,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { colors } from "../../theme";
import { Header } from "../../components/Header";
import { ResidentPicker } from "../../components/quicklog/ResidentPicker";
import { NoteField } from "../../components/quicklog/NoteField";
import { PhotoPicker } from "../../components/quicklog/PhotoPicker";
import { RecentsRow, RecentAction } from "../../components/quicklog/RecentsRow";
import { QuickActionsSection } from "../../components/quicklog/QuickActionsSection";
import { ActionBottomSheet } from "../../components/quicklog/ActionBottomSheet";
import { SelectedState } from "../../components/quicklog/ActionTile";
import { useFeedStore } from "../../store/feedStore";
import {
  QUICK_ACTIONS,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  getActionsByCategory,
  getActionById,
  getDefaultVariant,
  getNextCycleVariant,
  QuickAction,
} from "../../data/quickActions";

interface RouteParams {
  residentId?: string;
  preselectedAction?: string;
  batchResidents?: string[];
}

export const StaffQuickLogScreen: React.FC = () => {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;

  const { residents, activeResidentId, setActiveResident, addFeedItem } =
    useFeedStore();

  const contentContainerStyle = useContentContainerStyle(80); // Padding for tab bar clearance
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

  // Handle navigation parameters
  useEffect(() => {
    if (params?.residentId && params.residentId !== activeResidentId) {
      setActiveResident(params.residentId);
    }

    if (params?.preselectedAction) {
      const action = getActionById(params.preselectedAction);
      if (action) {
        // Auto-select the action and open its bottom sheet
        setTimeout(() => {
          setBottomSheetAction(action);
          setShowBottomSheet(true);
        }, 300); // Small delay to let the screen settle
      }
    }
  }, [params, activeResidentId, setActiveResident]);

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        keyboardHeight.value = withSpring(e.endCoordinates.height, {
          damping: 20,
          stiffness: 300,
        });
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        keyboardHeight.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Get selected resident and their photo consent
  const selectedResident = residents.find((r) => r.id === activeResidentId);
  const hasPhotoConsent = selectedResident?.photoConsent ?? false;

  // Form validation
  const isFormValid = useMemo(() => {
    const hasSelectedActions = Object.keys(selectedActions).length > 0;
    return Boolean(
      activeResidentId &&
        (hasSelectedActions || note.trim() || selectedPhotos.length > 0)
    );
  }, [activeResidentId, selectedActions, note, selectedPhotos.length]);

  // Handlers
  const handleResidentSelect = (residentId: string) => {
    setActiveResident(residentId);
  };

  // New interaction handlers
  const handleActionToggle = (actionId: string) => {
    const action = getActionById(actionId);
    if (!action) return;

    const isSelected = Boolean(selectedActions[actionId]);

    if (!isSelected) {
      // First selection - use default variant or no variant
      const defaultVariant = getDefaultVariant(action);
      const variants = defaultVariant ? [defaultVariant.id] : [];

      setSelectedActions((prev) => ({
        ...prev,
        [actionId]: {
          variants: Array.isArray(variants) ? variants : [],
          notes: "",
        },
      }));
    } else {
      // Already selected - for simpler UX, check if we should cycle or deselect
      const currentData = selectedActions[actionId];
      const currentVariant = currentData?.variants?.[0]; // First variant

      // For cycling actions, cycle through once then allow deselection
      if (
        action.cycle &&
        currentVariant &&
        action.variants &&
        action.variants.length > 1
      ) {
        const nextVariant = getNextCycleVariant(action, currentVariant);
        // If we're back to the beginning of the cycle or no next variant, deselect
        if (!nextVariant || nextVariant === action.cycle[0]) {
          // Deselect instead of cycling back
          setSelectedActions((prev) => {
            const newState = { ...prev };
            delete newState[actionId];
            return newState;
          });
          return;
        } else {
          // Cycle to next variant
          setSelectedActions((prev) => ({
            ...prev,
            [actionId]: {
              ...currentData,
              variants: [nextVariant],
            },
          }));
          return;
        }
      }

      // Otherwise, deselect immediately for easier UX
      setSelectedActions((prev) => {
        const newState = { ...prev };
        delete newState[actionId];
        return newState;
      });
    }
  };

  const handleActionOpen = (actionId: string) => {
    try {
      const action = getActionById(actionId);
      if (!action) {
        return;
      }

      setBottomSheetAction(action);
      setShowBottomSheet(true);
    } catch (error) {
      console.error("Error opening action sheet:", error);
    }
  };

  const handleVariantToggle = (actionId: string, variantId: string) => {
    setSelectedActions((prev) => {
      const currentData = prev[actionId] || { variants: [] };
      const variants = currentData.variants.includes(variantId)
        ? currentData.variants.filter((id) => id !== variantId)
        : [...currentData.variants, variantId];

      if (variants.length === 0) {
        const newState = { ...prev };
        delete newState[actionId];
        return newState;
      }

      return {
        ...prev,
        [actionId]: { ...currentData, variants },
      };
    });
  };

  const handleActionNotes = (actionId: string, notes: string) => {
    setSelectedActions((prev) => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        notes: notes.trim() || undefined,
      },
    }));
  };

  const handleActionMetrics = (actionId: string, metrics: any) => {
    setSelectedActions((prev) => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        metrics,
      },
    }));
  };

  const handleRecentSelect = (actionId: string, variant?: string) => {
    const action = getActionById(actionId);
    if (!action) return;

    const variants = variant ? [variant] : [];
    setSelectedActions((prev) => ({
      ...prev,
      [actionId]: { variants },
    }));
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setBottomSheetAction(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !isFormValid) return;

    setIsSubmitting(true);

    try {
      // Haptic feedback
      if (Platform.OS === "ios") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Determine the primary type based on what's selected
      const actionIds = Object.keys(selectedActions);
      let type = "note";
      if (actionIds.length > 0) {
        type = actionIds[0];
      } else if (selectedPhotos.length > 0) {
        type = "photo";
      }

      // Create tags array including variants
      const tags = actionIds.map((actionId) => {
        const actionData = selectedActions[actionId];
        const action = getActionById(actionId);
        const parts = [actionId];

        if (actionData.variants.length > 0) {
          parts.push(...actionData.variants);
        }

        return parts.join(":");
      });

      // Combine main note with action-specific notes
      const allNotes: string[] = [];

      // Add main note if present
      if (note.trim()) {
        allNotes.push(note.trim());
      }

      // Add action-specific notes
      actionIds.forEach((actionId) => {
        const actionData = selectedActions[actionId];
        const action = getActionById(actionId);

        if (actionData.notes?.trim()) {
          const actionLabel = action?.label || actionId;
          allNotes.push(`${actionLabel}: ${actionData.notes.trim()}`);
        }
      });

      const combinedNoteText =
        allNotes.length > 0 ? allNotes.join("\n\n") : undefined;

      // Update recents before clearing form
      const newRecents: RecentAction[] = actionIds.map((actionId) => ({
        actionId,
        variant: selectedActions[actionId].variants[0], // Use first variant
        timestamp: Date.now(),
      }));

      setRecentActions((prev) => {
        const combined = [...newRecents, ...prev];
        // Keep only last 6 unique actions
        const unique = combined.reduce((acc: RecentAction[], current) => {
          const exists = acc.find(
            (item) =>
              item.actionId === current.actionId &&
              item.variant === current.variant
          );
          if (!exists) acc.push(current);
          return acc;
        }, []);
        return unique.slice(0, 6);
      });

      // Create the feed item
      const feedItem = {
        residentId: activeResidentId!,
        authorId: "skarlette-choi", // In a real app, this would come from auth
        type: type as any,
        text: combinedNoteText,
        tags,
        photoUrl: selectedPhotos[0] || undefined,
      };

      addFeedItem(feedItem);

      // Show success message with undo option
      Alert.alert(
        "Update Posted! 🎉",
        `Update posted for ${selectedResident?.name}. Family members will see this in their feed.`,
        [
          {
            text: "Undo",
            style: "cancel",
            onPress: () => {
              // In a real app, implement undo functionality
            },
          },
          { text: "OK" },
        ]
      );

      // Clear form
      setSelectedActions({});
      setNote("");
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Error posting update:", error);
      Alert.alert("Error", "Failed to post update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animated styles for smooth keyboard handling
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: contentContainerStyle.paddingBottom,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <Header
          title="Quick Log"
          subtitle={
            selectedResident
              ? `Adding update for ${selectedResident.name}`
              : "Fast updates for residents"
          }
          showSettings={true}
        />
      </View>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <View style={styles.keyboardAvoid}>
            <Animated.ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.contentContainer,
                contentAnimatedStyle,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <ResidentPicker
                residents={residents}
                selectedResidentId={activeResidentId}
                onSelectResident={handleResidentSelect}
                recentResidentIds={recentResidentIds}
                testID="quick-log-resident-picker"
              />

              {/* Recents Row */}
              <RecentsRow
                recents={recentActions}
                onSelectRecent={handleRecentSelect}
                testID="quick-log-recents"
              />

              {/* Categorized Quick Actions */}
              {CATEGORY_ORDER.map((categoryKey) => {
                const actions = getActionsByCategory(categoryKey);
                const title = CATEGORY_LABELS[categoryKey];

                return (
                  <QuickActionsSection
                    key={categoryKey}
                    title={title}
                    actions={actions}
                    selected={selectedActions}
                    onToggle={handleActionToggle}
                    onOpen={handleActionOpen}
                    hasPhotoConsent={hasPhotoConsent}
                    testID={`quick-log-section-${categoryKey}`}
                  />
                );
              })}

              <NoteField
                value={note}
                onChangeText={setNote}
                testID="quick-log-note"
              />

              <PhotoPicker
                selectedPhotos={selectedPhotos}
                onPhotosChange={setSelectedPhotos}
                hasPhotoConsent={hasPhotoConsent}
                residentName={selectedResident?.name}
                testID="quick-log-photo"
              />

              {/* Validation hint */}
              {!isFormValid && (
                <View style={styles.validationHint}>
                  <Text style={styles.validationText}>
                    Select a resident and at least one action, note, or photo.
                  </Text>
                </View>
              )}

              {/* Post Update Button */}
              <TouchableOpacity
                style={[
                  styles.postButton,
                  isFormValid
                    ? styles.postButtonEnabled
                    : styles.postButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                testID="quick-log-submit"
              >
                <Text
                  style={[
                    styles.postButtonText,
                    isFormValid
                      ? styles.postButtonTextEnabled
                      : styles.postButtonTextDisabled,
                  ]}
                >
                  {isSubmitting ? "Posting..." : "Post Update"}
                </Text>
              </TouchableOpacity>
            </Animated.ScrollView>
          </View>

          {/* Action Bottom Sheet */}
          <ActionBottomSheet
            action={bottomSheetAction}
            selected={selectedActions}
            visible={showBottomSheet}
            onClose={handleCloseBottomSheet}
            onVariantToggle={handleVariantToggle}
            onNotesChange={handleActionNotes}
            onMetricsChange={handleActionMetrics}
            resident={
              selectedResident
                ? { name: selectedResident.name, room: selectedResident.room }
                : undefined
            }
            testID="quick-log-bottom-sheet"
          />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerWrapper: {
    backgroundColor: "red", // Debug: make it visible
    minHeight: 100, // Debug: ensure it has height
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  validationHint: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FB923C",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  validationText: {
    color: "#EA580C",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  postButton: {
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  postButtonEnabled: {
    backgroundColor: colors.primary,
  },
  postButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  postButtonTextEnabled: {
    color: "#FFFFFF",
  },
  postButtonTextDisabled: {
    color: "#FFFFFF",
  },
});
