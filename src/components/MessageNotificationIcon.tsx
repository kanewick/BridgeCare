import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Bell } from "phosphor-react-native";
import { useAppTheme } from "../store/themeStore";
import { useMessageStore } from "../store/messageStore";

export const MessageNotificationIcon: React.FC = () => {
  const navigation = useNavigation();
  const { effectiveTheme } = useAppTheme();
  const { getUnreadMessagesForRole } = useMessageStore();

  const unreadMessages = getUnreadMessagesForRole("staff");
  const unreadCount = unreadMessages.length;

  const colors = {
    text: effectiveTheme === "dark" ? "#f8fafc" : "#1e293b",
    primary: effectiveTheme === "dark" ? "#38bdf8" : "#0ea5e9",
    danger: effectiveTheme === "dark" ? "#ef4444" : "#dc2626",
  };

  const handlePress = () => {
    // Navigate to staff messages screen (we'll create this)
    (navigation as any).navigate("StaffMessages");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Bell size={24} color={colors.text} weight="regular" />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.danger }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? "9+" : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
  },
});
