import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing, theme, chip } from '../theme';

interface TagButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const TagButton: React.FC<TagButtonProps> = ({ 
  label, 
  selected, 
  onPress, 
  style,
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.tagButton,
        selected ? styles.selected : styles.unselected,
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.label,
        selected ? styles.selectedText : styles.unselectedText,
        disabled && styles.disabledText,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tagButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 44,
  },
  selected: {
    backgroundColor: chip.activeBg,
    borderColor: chip.activeBorder,
  },
  unselected: {
    backgroundColor: chip.inactiveBg,
    borderColor: colors.border,
  },
  disabled: {
    backgroundColor: chip.inactiveBg,
    borderColor: colors.border,
    opacity: 0.5,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  selectedText: {
    color: colors.primary,
  },
  unselectedText: {
    color: colors.textMuted,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
