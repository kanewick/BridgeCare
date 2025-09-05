import React from "react";
import { Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

interface IconDisplayProps {
  emoji: string;
  icon?: string;
  size?: number;
  color?: string;
  useIcons?: boolean; // Toggle between emoji and Ionicons
}

export const IconDisplay: React.FC<IconDisplayProps> = ({
  emoji,
  icon,
  size = 20,
  color = colors.primary,
  useIcons = false, // Default to emojis for now
}) => {
  if (useIcons && icon) {
    return (
      <Ionicons
        name={icon as any}
        size={size}
        color={color}
        style={styles.icon}
      />
    );
  }

  return <Text style={[styles.emoji, { fontSize: size }]}>{emoji}</Text>;
};

const styles = StyleSheet.create({
  emoji: {
    textAlign: "center",
    lineHeight: undefined, // Let it auto-calculate for better alignment
  },
  icon: {
    alignSelf: "center",
  },
});
