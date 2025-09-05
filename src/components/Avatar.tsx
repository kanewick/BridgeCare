import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors, radius, theme } from "../theme";

interface AvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  name: string;
  imageUrl?: string;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = "md",
  name,
  imageUrl,
  backgroundColor,
}) => {
  const avatarSize = theme.avatar.sizes[size];

  // Generate consistent color based on name
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;

    const hash = name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colorIndex = hash % theme.avatar.fallbackColors.length;
    return theme.avatar.fallbackColors[colorIndex];
  };

  // Get initials from name
  const getInitials = () => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const containerStyle = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: getBackgroundColor(),
    },
  ];

  const textStyle = [
    styles.initials,
    {
      fontSize: avatarSize * 0.4,
      lineHeight: avatarSize * 0.5,
    },
  ];

  if (imageUrl) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
          accessibilityLabel={`Profile photo of ${name}`}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={textStyle} accessibilityLabel={`Avatar for ${name}`}>
        {getInitials()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
