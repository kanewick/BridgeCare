import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { CaretLeft } from "phosphor-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../store/themeStore";
import { MessageNotificationIcon } from "./MessageNotificationIcon";
import { FamilyNotificationIcon } from "./FamilyNotificationIcon";
import { useFeedStore } from "../store/feedStore";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  hideNotifications?: boolean; // Hide notification bell (for message screens)
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
  hideNotifications = false,
}) => {
  const navigation = useNavigation();
  const { effectiveTheme } = useAppTheme();
  const { currentRole, currentUser } = useFeedStore();

  const colors = {
    background: effectiveTheme === "dark" ? "#0f172a" : "#ffffff",
    text: effectiveTheme === "dark" ? "#f8fafc" : "#1e293b",
    textMuted: effectiveTheme === "dark" ? "#94a3b8" : "#64748b",
    border: effectiveTheme === "dark" ? "#334155" : "#f1f5f9",
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Left: Back Button or Spacer */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <CaretLeft size={24} color={colors.text} weight="bold" />
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        {/* Center: Title and Subtitle */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          ) : currentUser ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {currentUser.name}
            </Text>
          ) : null}
        </View>

        {/* Right: Custom Action, Message Icon for Staff/Family, or Spacer */}
        <View style={styles.rightSection}>
          {rightAction ? (
            rightAction
          ) : !hideNotifications && currentRole === "staff" ? (
            <MessageNotificationIcon />
          ) : !hideNotifications && currentRole === "family" ? (
            <FamilyNotificationIcon />
          ) : (
            <View style={styles.spacer} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    // Dynamic background color handled in component
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  leftSection: {
    width: 44,
    alignItems: "flex-start",
  },
  rightSection: {
    width: 44,
    alignItems: "flex-end",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  spacer: {
    width: 44,
    height: 44,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 2,
  },
});
