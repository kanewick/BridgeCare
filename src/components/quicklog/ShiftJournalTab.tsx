import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Keyboard,
} from "react-native";
import { colors, spacing, radius, theme } from "../../theme";
import { IconDisplay } from "../IconDisplay";
import { Card } from "../Card";
import { Badge } from "../Badge";
import { useFeedStore } from "../../store/feedStore";
import { useShiftJournalStore } from "../../store/shiftJournalStore";
import { ShiftJournalEntry, getCurrentShift } from "../../data/checklists";

interface ShiftJournalTabProps {
  residentId: string | null;
  testID?: string;
}

interface JournalEntryCardProps {
  entry: ShiftJournalEntry;
  onDelete?: (id: string) => void;
}

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "secondary", emoji: "🔵" },
  normal: { label: "Normal", color: "primary", emoji: "🟢" },
  high: { label: "High", color: "warning", emoji: "🟡" },
  urgent: { label: "Urgent", color: "error", emoji: "🔴" },
} as const;

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onDelete,
}) => {
  const priorityConfig = PRIORITY_CONFIG[entry.priority];

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(entry.id),
        },
      ]
    );
  };

  return (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryMeta}>
          <Badge label={`${priorityConfig.emoji} ${priorityConfig.label}`} />
          {entry.isHandover && <Badge label="📋 Handover" />}
          <Text style={styles.timestamp}>
            {new Date(entry.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <IconDisplay
              emoji="🗑️"
              icon="trash-outline"
              size={16}
              color={colors.textMuted}
              useIcons={true}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.entryContent}>{entry.content}</Text>

      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      )}

      {entry.audioUrl && (
        <TouchableOpacity style={styles.audioButton}>
          <IconDisplay
            emoji="🎵"
            icon="play-outline"
            size={16}
            color={colors.primary}
            useIcons={true}
          />
          <Text style={styles.audioText}>Voice Note</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

export const ShiftJournalTab: React.FC<ShiftJournalTabProps> = ({
  residentId,
  testID = "shift-journal-tab",
}) => {
  const { currentUserId, getResidentById } = useFeedStore();
  const { getEntries, addEntry, deleteEntry, extractTags } =
    useShiftJournalStore();

  // Form state
  const [content, setContent] = useState("");
  const [priority, setPriority] =
    useState<ShiftJournalEntry["priority"]>("normal");
  const [isHandover, setIsHandover] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const textInputRef = useRef<TextInput>(null);
  const currentShift = getCurrentShift();
  const resident = residentId ? getResidentById(residentId) : null;

  // Get entries for current resident
  const relevantEntries = getEntries(
    residentId || undefined,
    undefined,
    undefined
  );

  const handleSubmit = () => {
    if (!content.trim() || !currentUserId) {
      Alert.alert("Error", "Please enter some content for the journal entry.");
      return;
    }

    addEntry({
      residentId: residentId || undefined,
      staffId: currentUserId,
      shift: currentShift,
      content: content.trim(),
      isHandover,
      priority,
      tags: extractTags(content),
    });

    // Clear form
    setContent("");
    setPriority("normal");
    setIsHandover(false);

    Keyboard.dismiss();
    textInputRef.current?.blur();
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
  };

  const toggleRecording = async () => {
    // Mock voice recording - in real app would use expo-av
    setIsRecording(!isRecording);

    if (isRecording) {
      // Stop recording
      Alert.alert(
        "Voice Note",
        "Voice recording would be saved here. For now, please use text input.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      testID={testID}
    >
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <IconDisplay
            emoji="📝"
            icon="document-text-outline"
            size={24}
            color={colors.primary}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {residentId && resident ? `${resident.name} - ` : ""}
              {currentShift.charAt(0).toUpperCase() +
                currentShift.slice(1)}{" "}
              Shift Journal
            </Text>
            <Text style={styles.headerSubtitle}>
              Add notes for handover and shift documentation
            </Text>
          </View>
        </View>
      </Card>

      {/* Entry Form */}
      <Card style={styles.formCard}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>New Entry</Text>
          <View style={styles.formOptions}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                isHandover && styles.activeOptionButton,
              ]}
              onPress={() => setIsHandover(!isHandover)}
            >
              <Text
                style={[
                  styles.optionText,
                  isHandover && styles.activeOptionText,
                ]}
              >
                📋 Handover
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Priority Selector */}
        <View style={styles.priorityContainer}>
          <Text style={styles.priorityLabel}>Priority:</Text>
          <View style={styles.priorityButtons}>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.priorityButton,
                  priority === key && styles.activePriorityButton,
                ]}
                onPress={() =>
                  setPriority(key as ShiftJournalEntry["priority"])
                }
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === key && styles.activePriorityButtonText,
                  ]}
                >
                  {config.emoji} {config.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text Input */}
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder={`What happened during the ${currentShift} shift?`}
          placeholderTextColor={colors.textFaint}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Input Actions */}
        <View style={styles.inputActions}>
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={toggleRecording}
          >
            <IconDisplay
              emoji={isRecording ? "⏹️" : "🎤"}
              icon={isRecording ? "stop" : "mic"}
              size={16}
              color={isRecording ? colors.error : colors.textMuted}
              useIcons={true}
            />
            <Text
              style={[styles.recordText, isRecording && styles.recordingText]}
            >
              {isRecording ? "Stop" : "Voice"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !content.trim() && styles.disabledSubmitButton,
            ]}
            onPress={handleSubmit}
            disabled={!content.trim()}
          >
            <Text
              style={[
                styles.submitText,
                !content.trim() && styles.disabledSubmitText,
              ]}
            >
              Add Entry
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          Tip: Use #tags to categorize entries (e.g., #agitation #medication
          #family)
        </Text>
      </Card>

      {/* Entries List */}
      <View style={styles.entriesContainer}>
        {relevantEntries.length === 0 ? (
          <Card style={styles.emptyCard}>
            <IconDisplay emoji="📖" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Journal Entries</Text>
            <Text style={styles.emptyText}>
              {residentId
                ? `No entries yet for ${
                    resident?.name || "this resident"
                  } today.`
                : "No shift notes have been added yet today."}
            </Text>
          </Card>
        ) : (
          relevantEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={handleDeleteEntry}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  headerCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  formCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  formOptions: {
    flexDirection: "row",
  },
  optionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.chipBg,
  },
  activeOptionButton: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  activeOptionText: {
    color: colors.card,
  },
  priorityContainer: {
    marginBottom: spacing.md,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priorityButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  priorityButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  activePriorityButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  activePriorityButtonText: {
    color: colors.card,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  inputActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.chipBg,
  },
  recordingButton: {
    backgroundColor: colors.errorSoft,
  },
  recordText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  recordingText: {
    color: colors.error,
  },
  submitButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  disabledSubmitButton: {
    backgroundColor: colors.border,
  },
  submitText: {
    fontSize: 14,
    color: colors.card,
    fontWeight: "600",
  },
  disabledSubmitText: {
    color: colors.textFaint,
  },
  helpText: {
    fontSize: 12,
    color: colors.textFaint,
    fontStyle: "italic",
  },
  entriesContainer: {
    paddingHorizontal: spacing.lg,
  },
  entryCard: {
    marginBottom: spacing.md,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  entryMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textFaint,
    fontWeight: "500",
  },
  deleteButton: {
    padding: spacing.xs,
  },
  entryContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "500",
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
  },
  audioText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
