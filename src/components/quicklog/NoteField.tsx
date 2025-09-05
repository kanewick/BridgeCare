import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, radius, spacing, shadow, theme } from "../../theme";

interface NoteFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  testID?: string;
}

export const NoteField: React.FC<NoteFieldProps> = ({
  value,
  onChangeText,
  placeholder = "Add a note about this update (optional)...",
  maxLength = 500,
  testID = "note-field",
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>Note (Optional)</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          multiline
          maxLength={maxLength}
          textAlignVertical="top"
          testID={`${testID}-input`}
          accessibilityLabel="Note input"
          accessibilityHint="Enter additional details about this update"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      </View>
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
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputContainer: {
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 100,
  },
  input: {
    ...theme.typography.body,
    color: colors.text,
    flex: 1,
    minHeight: 80,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.sm,
  },
  characterCount: {
    ...theme.typography.caption,
    color: colors.textMuted,
  },
});
