import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, radius, spacing, shadow } from "../../theme";
import { StickyFooter } from "../common/StickyFooter";
import { QuickAction, getActionById } from "../../data/quickActions";
import { SelectedState } from "./ActionTile";

interface ActionBottomSheetProps {
  action: QuickAction | null;
  selected: SelectedState;
  visible: boolean;
  onClose: () => void;
  onVariantToggle: (actionId: string, variantId: string) => void;
  onNotesChange: (actionId: string, notes: string) => void;
  onMetricsChange: (actionId: string, metrics: any) => void;
  resident?: { name: string; room?: string };
  testID?: string;
}

export const ActionBottomSheet: React.FC<ActionBottomSheetProps> = ({
  action,
  selected,
  visible,
  onClose,
  onVariantToggle,
  onNotesChange,
  onMetricsChange,
  resident,
  testID = "action-bottom-sheet",
}) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["40%", "70%"], []);

  const [localNotes, setLocalNotes] = useState("");
  const [painValue, setPainValue] = useState(0);
  const [tempValue, setTempValue] = useState("");
  const [bpValue, setBpValue] = useState("");
  const [hrValue, setHrValue] = useState("");
  const [timeValue, setTimeValue] = useState<"now" | "earlier" | "scheduled">(
    "now"
  );

  // Animation values
  const chipScale = useSharedValue(1);

  // Initialize local state when sheet opens
  useEffect(() => {
    if (visible && action) {
      const selectedData = selected[action.id];
      setLocalNotes(selectedData?.notes || "");
      setPainValue(selectedData?.metrics?.pain || 0);
      setTempValue(selectedData?.metrics?.temp?.toString() || "");
      setBpValue(selectedData?.metrics?.bp || "");
      setHrValue(selectedData?.metrics?.hr?.toString() || "");
      setTimeValue((selectedData?.metrics as any)?.when || "now");
    }
  }, [visible, action, selected]);

  // Handle sheet visibility
  useEffect(() => {
    if (visible && action) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, action]);

  const handleSheetChanges = useCallback((index: number) => {
    // Handle sheet state changes if needed
  }, []);

  const handleVariantPress = async (variantId: string) => {
    if (!action) return;

    // Haptic feedback
    if (Platform.OS === "ios") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Chip animation
    chipScale.value = withSpring(0.98, { damping: 8, stiffness: 300 }, () => {
      chipScale.value = withSpring(1, { damping: 8, stiffness: 300 });
    });

    onVariantToggle(action.id, variantId);
  };

  const handleNotesSubmit = () => {
    if (action) {
      onNotesChange(action.id, localNotes);
    }
  };

  const handleMetricsSubmit = () => {
    if (!action) return;

    const metrics: any = {};

    if (action.id === "pain") {
      metrics.pain = painValue;
    }

    if (action.id === "vitals") {
      if (tempValue) metrics.temp = parseFloat(tempValue);
      if (bpValue) metrics.bp = bpValue;
      if (hrValue) metrics.hr = parseInt(hrValue);
    }

    if (
      action.id === "meal" ||
      action.id === "rest" ||
      action.id === "activity"
    ) {
      metrics.when = timeValue;
    }

    onMetricsChange(action.id, metrics);
  };

  const handleConfirm = async () => {
    if (!action) return;

    // Submit any pending changes
    handleNotesSubmit();
    handleMetricsSubmit();

    // Success haptic
    if (Platform.OS === "ios") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onClose();
  };

  const handleClear = () => {
    if (!action) return;

    // Reset all selections for this action
    const resetData = {
      variants: [],
      notes: "",
      metrics: {},
    };

    onNotesChange(action.id, "");
    onMetricsChange(action.id, {});

    // Clear variants
    const selectedData = selected[action.id];
    if (selectedData?.variants) {
      selectedData.variants.forEach((variantId) => {
        onVariantToggle(action.id, variantId);
      });
    }

    // Reset local state
    setLocalNotes("");
    setPainValue(0);
    setTempValue("");
    setBpValue("");
    setHrValue("");
    setTimeValue("now");
  };

  const getContextPreview = (): string => {
    if (!action) return "";

    const selectedData = selected[action.id];
    const parts: string[] = [];

    // Add selected variants
    if (selectedData?.variants?.length) {
      const variantLabels = selectedData.variants.map((variantId) => {
        const variant = action.variants?.find((v) => v.id === variantId);
        return variant?.label || variantId;
      });
      parts.push(variantLabels.join(", "));
    }

    // Add notes indicator
    if (localNotes.trim()) {
      parts.push("Notes added");
    }

    // Add metrics indicators
    if (action.id === "pain" && painValue > 0) {
      parts.push(`Pain ${painValue}/10`);
    }

    if (action.id === "vitals" && (tempValue || bpValue || hrValue)) {
      parts.push("Vitals recorded");
    }

    return parts.join(" · ") || "No selections";
  };

  const hasSelections = (): boolean => {
    if (!action) return false;
    const selectedData = selected[action.id];
    return Boolean(
      selectedData?.variants?.length ||
        localNotes.trim() ||
        (action.id === "pain" && painValue > 0) ||
        (action.id === "vitals" && (tempValue || bpValue || hrValue))
    );
  };

  const chipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chipScale.value }],
  }));

  if (!action) return null;

  const selectedData = selected[action.id];
  const selectedVariants = selectedData?.variants || [];

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      onDismiss={onClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <BottomSheetView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.emojiChip}>
                <Text style={styles.emoji}>{action.emoji}</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{action.label}</Text>
                {resident && (
                  <Text style={styles.subtitle}>
                    {resident.name} · Room {resident.room}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              testID={`${testID}-close`}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentWrapper}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Options Section */}
              {action.variants && action.variants.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Options</Text>
                  <View style={styles.chipContainer}>
                    {action.variants.map((variant) => {
                      const isSelected = selectedVariants.includes(variant.id);
                      return (
                        <Animated.View
                          key={variant.id}
                          style={chipAnimatedStyle}
                        >
                          <TouchableOpacity
                            style={[
                              styles.chip,
                              isSelected && styles.chipSelected,
                            ]}
                            onPress={() => handleVariantPress(variant.id)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            accessibilityLabel={`${variant.label}, ${
                              isSelected ? "selected" : "not selected"
                            }`}
                            testID={`${testID}-variant-${variant.id}`}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isSelected && styles.chipTextSelected,
                              ]}
                            >
                              {variant.label}
                            </Text>
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.primary}
                                style={styles.chipIcon}
                              />
                            )}
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    })}
                  </View>
                  <Text style={styles.chipCaption}>
                    {action.variants.length === 1
                      ? "Choose one"
                      : "Choose all that apply"}
                  </Text>
                </View>
              )}

              {/* Pain Scale Section */}
              {action.id === "pain" && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Pain Level</Text>
                    <View style={styles.valueBadge}>
                      <Text style={styles.valueBadgeText}>{painValue}/10</Text>
                    </View>
                  </View>
                  <View style={styles.painScaleContainer}>
                    {Array.from({ length: 11 }, (_, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.painScaleButton,
                          painValue === index && styles.painScaleButtonSelected,
                        ]}
                        onPress={() => {
                          setPainValue(index);
                          handleMetricsSubmit();
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: painValue === index }}
                        accessibilityLabel={`Pain level ${index}`}
                      >
                        <Text
                          style={[
                            styles.painScaleText,
                            painValue === index && styles.painScaleTextSelected,
                          ]}
                        >
                          {index}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.painLabels}>
                    <Text style={styles.painLabel}>No pain</Text>
                    <Text style={styles.painLabel}>Severe</Text>
                  </View>
                </View>
              )}

              {/* Vitals Section */}
              {action.id === "vitals" && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Vital Signs</Text>
                  <View style={styles.vitalsContainer}>
                    <View style={styles.vitalInput}>
                      <Text style={styles.vitalLabel}>Temperature (°C)</Text>
                      <TextInput
                        style={styles.input}
                        value={tempValue}
                        onChangeText={setTempValue}
                        onBlur={handleMetricsSubmit}
                        placeholder="36.5"
                        keyboardType="decimal-pad"
                        maxLength={5}
                      />
                    </View>
                    <View style={styles.vitalInput}>
                      <Text style={styles.vitalLabel}>Blood Pressure</Text>
                      <TextInput
                        style={styles.input}
                        value={bpValue}
                        onChangeText={setBpValue}
                        onBlur={handleMetricsSubmit}
                        placeholder="120/80"
                        maxLength={10}
                      />
                    </View>
                    <View style={styles.vitalInput}>
                      <Text style={styles.vitalLabel}>Heart Rate (bpm)</Text>
                      <TextInput
                        style={styles.input}
                        value={hrValue}
                        onChangeText={setHrValue}
                        onBlur={handleMetricsSubmit}
                        placeholder="72"
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Time Selection Section */}
              {(action.id === "meal" ||
                action.id === "rest" ||
                action.id === "activity") && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>When</Text>
                  <View style={styles.chipContainer}>
                    {[
                      { id: "now", label: "Now" },
                      { id: "earlier", label: "Earlier" },
                      { id: "scheduled", label: "Scheduled" },
                    ].map((timeOption) => (
                      <Animated.View
                        key={timeOption.id}
                        style={chipAnimatedStyle}
                      >
                        <TouchableOpacity
                          style={[
                            styles.chip,
                            timeValue === timeOption.id && styles.chipSelected,
                          ]}
                          onPress={() => {
                            setTimeValue(timeOption.id as any);
                            handleMetricsSubmit();
                          }}
                          accessibilityRole="button"
                          accessibilityState={{
                            selected: timeValue === timeOption.id,
                          }}
                          accessibilityLabel={timeOption.label}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              timeValue === timeOption.id &&
                                styles.chipTextSelected,
                            ]}
                          >
                            {timeOption.label}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </View>
                </View>
              )}

              {/* Notes Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
                <View style={styles.notesContainer}>
                  <TextInput
                    style={styles.notesInput}
                    value={localNotes}
                    onChangeText={setLocalNotes}
                    onBlur={handleNotesSubmit}
                    placeholder={`Add notes about ${action.label.toLowerCase()}...`}
                    multiline
                    maxLength={200}
                    textAlignVertical="top"
                  />
                  <Text style={styles.characterCount}>
                    {localNotes.length}/200
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Sticky Footer */}
          <View style={styles.footerContainer}>
            <StickyFooter
              primaryLabel="Add to update"
              onPrimaryPress={handleConfirm}
              primaryDisabled={!hasSelections()}
              secondaryLabel={hasSelections() ? "Clear" : undefined}
              onSecondaryPress={hasSelections() ? handleClear : undefined}
              contextPreview={getContextPreview()}
              testID={`${testID}-footer`}
            />
          </View>
        </BottomSheetView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handleIndicator: {
    backgroundColor: colors.border,
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    position: "relative",
  },
  contentWrapper: {
    flex: 1,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  emojiChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chipBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textFaint,
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  valueBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  valueBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  chipSelected: {
    backgroundColor: "#E6F6FD",
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  chipIcon: {
    marginLeft: spacing.xs,
  },
  chipCaption: {
    fontSize: 12,
    color: colors.textFaint,
    marginTop: spacing.sm,
  },
  painScaleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
  },
  painScaleButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  painScaleButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  painScaleText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  painScaleTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  painLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  painLabel: {
    fontSize: 12,
    color: colors.textFaint,
  },
  vitalsContainer: {
    gap: spacing.md,
  },
  vitalInput: {
    gap: spacing.xs,
  },
  vitalLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    minHeight: 44,
  },
  notesContainer: {
    position: "relative",
  },
  notesInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: colors.textFaint,
    textAlign: "right",
    marginTop: spacing.xs,
  },
  footerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
