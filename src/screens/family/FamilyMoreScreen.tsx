import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Pressable,
} from "react-native";
import {
  User,
  Bell,
  Shield,
  Question,
  Phone,
  EnvelopeSimple,
  Star,
  SignOut,
  CaretRight,
  Bug,
} from "phosphor-react-native";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { useFeedStore } from "../../store/feedStore";
import { useAppTheme } from "../../store/themeStore";

export const FamilyMoreScreen: React.FC = () => {
  const { effectiveTheme } = useAppTheme();
  const contentContainerStyle = useContentContainerStyle();
  const { switchRole } = useFeedStore();
  const { themeMode, setThemeMode } = useAppTheme();

  const colors = {
    background: effectiveTheme === "dark" ? "#0f172a" : "#f8fafc",
    card: effectiveTheme === "dark" ? "#1e293b" : "#ffffff",
    text: effectiveTheme === "dark" ? "#f8fafc" : "#1e293b",
    textMuted: effectiveTheme === "dark" ? "#94a3b8" : "#64748b",
    primary: effectiveTheme === "dark" ? "#38bdf8" : "#0ea5e9",
    border: effectiveTheme === "dark" ? "#334155" : "#e2e8f0",
    danger: effectiveTheme === "dark" ? "#ef4444" : "#dc2626",
    warning: effectiveTheme === "dark" ? "#f59e0b" : "#d97706",
  };

  const OptionItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    color?: string;
  }> = ({ icon, title, subtitle, onPress, showArrow = true, color }) => (
    <Pressable
      style={[
        styles.optionItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        <View style={styles.optionIcon}>{icon}</View>
        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, { color: color || colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && <CaretRight size={16} color={colors.textMuted} />}
    </Pressable>
  );

  const ContactCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    onPress: () => void;
  }> = ({ icon, title, value, onPress }) => (
    <Pressable
      style={[
        styles.contactCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.contactIcon}>{icon}</View>
      <View style={styles.contactContent}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.contactValue, { color: colors.primary }]}>
          {value}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <User size={32} color="#ffffff" weight="fill" />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            Johnson Family
          </Text>
          <Text style={[styles.relationship, { color: colors.textMuted }]}>
            Margaret's Family • 3 Members
          </Text>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Emergency Contact
          </Text>

          <ContactCard
            icon={<Phone size={20} color={colors.primary} />}
            title="Care Home Reception"
            value="01234 567 890"
            onPress={() => {}}
          />

          <ContactCard
            icon={<EnvelopeSimple size={20} color={colors.primary} />}
            title="Email Support"
            value="support@bridgecare.com"
            onPress={() => {}}
          />
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Settings
          </Text>

          <OptionItem
            icon={<User size={20} color={colors.primary} />}
            title="Family Profile"
            subtitle="Manage family member details"
            onPress={() => {}}
          />

          <OptionItem
            icon={<Bell size={20} color={colors.primary} />}
            title="Notifications"
            subtitle="Update preferences and settings"
            onPress={() => {}}
          />

          <OptionItem
            icon={<Shield size={20} color={colors.primary} />}
            title="Privacy & Security"
            subtitle="Control your privacy settings"
            onPress={() => {}}
          />
        </View>

        {/* Development Tools */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Development Tools
          </Text>

          <OptionItem
            icon={<Bug size={20} color={colors.warning} />}
            title="Switch to Staff Mode"
            subtitle="For testing and development"
            onPress={() => switchRole("staff")}
            color={colors.warning}
          />

          {/* Theme Controls */}
          <View style={[styles.themeControls, { borderColor: colors.border }]}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              🎨 Theme Settings
            </Text>
            <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>
              Current:{" "}
              {themeMode === "system"
                ? "System Default"
                : themeMode === "dark"
                ? "Dark Mode"
                : "Light Mode"}
            </Text>

            <View style={styles.themeButtons}>
              <Pressable
                style={[
                  styles.themeButton,
                  {
                    backgroundColor:
                      themeMode === "light" ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setThemeMode("light")}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    {
                      color: themeMode === "light" ? colors.card : colors.text,
                    },
                  ]}
                >
                  ☀️ Light
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.themeButton,
                  {
                    backgroundColor:
                      themeMode === "dark" ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setThemeMode("dark")}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    { color: themeMode === "dark" ? colors.card : colors.text },
                  ]}
                >
                  🌙 Dark
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.themeButton,
                  {
                    backgroundColor:
                      themeMode === "system" ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setThemeMode("system")}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    {
                      color: themeMode === "system" ? colors.card : colors.text,
                    },
                  ]}
                >
                  📱 System
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            App Settings
          </Text>

          <OptionItem
            icon={<Star size={20} color={colors.warning} />}
            title="Rate the App"
            subtitle="Help us improve BridgeCare"
            onPress={() => {}}
          />

          <OptionItem
            icon={<Question size={20} color={colors.primary} />}
            title="Help & Support"
            subtitle="Get help with using the app"
            onPress={() => {}}
          />
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.appName, { color: colors.text }]}>
              BridgeCare Family
            </Text>
            <Text style={[styles.version, { color: colors.textMuted }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              Stay connected with your loved one's care journey. Receive
              updates, photos, and messages from the care team.
            </Text>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <OptionItem
            icon={<SignOut size={20} color={colors.danger} />}
            title="Sign Out"
            onPress={() => {}}
            showArrow={false}
            color={colors.danger}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            © 2024 BridgeCare. All rights reserved.
          </Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Made with ❤️ for families and care homes
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  relationship: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    fontWeight: "400",
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  // Theme control styles
  themeControls: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
