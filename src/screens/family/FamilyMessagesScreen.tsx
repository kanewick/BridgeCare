import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ChatCircle,
  Users,
  Clock,
  Check,
  PaperPlaneTilt,
} from "phosphor-react-native";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { useAppTheme } from "../../store/themeStore";
import { useMessageStore } from "../../store/messageStore";
import { useFeedStore } from "../../store/feedStore";

export const FamilyMessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { effectiveTheme } = useAppTheme();
  const contentContainerStyle = useContentContainerStyle();
  const { getConversationsForUser, createConversation } = useMessageStore();
  const { getResidentById, currentUser } = useFeedStore();

  // Get conversations for the current user (automatically filtered by participation)
  const conversations = currentUser
    ? getConversationsForUser(currentUser.id)
    : [];

  const colors = {
    background: effectiveTheme === "dark" ? "#0f172a" : "#f8fafc",
    card: effectiveTheme === "dark" ? "#1e293b" : "#ffffff",
    text: effectiveTheme === "dark" ? "#f8fafc" : "#1e293b",
    textMuted: effectiveTheme === "dark" ? "#94a3b8" : "#64748b",
    primary: effectiveTheme === "dark" ? "#38bdf8" : "#0ea5e9",
    border: effectiveTheme === "dark" ? "#334155" : "#e2e8f0",
    success: effectiveTheme === "dark" ? "#10b981" : "#059669",
    accent: effectiveTheme === "dark" ? "#f59e0b" : "#f59e0b",
  };

  const handleMessageCareTeam = () => {
    // Navigate to the general care team conversation
    const careTeamConversation = conversations.find(
      (c) => c.id === "care-team-general"
    );
    if (careTeamConversation) {
      (navigation as any).navigate("ConversationScreen", {
        conversationId: careTeamConversation.id,
        conversationTitle: careTeamConversation.title,
      });
    }
  };

  const handleConversationPress = (conversationId: string, title: string) => {
    (navigation as any).navigate("ConversationScreen", {
      conversationId,
      conversationTitle: title,
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const ConversationCard: React.FC<{
    title: string;
    subtitle: string;
    lastMessage: string;
    time: string;
    unread?: boolean;
    isGroup?: boolean;
    onPress?: () => void;
  }> = ({
    title,
    subtitle,
    lastMessage,
    time,
    unread = false,
    isGroup = false,
    onPress,
  }) => (
    <Pressable
      style={[
        styles.conversationCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.conversationLeft}>
        <View
          style={[styles.avatarContainer, { backgroundColor: colors.primary }]}
        >
          {isGroup ? (
            <Users size={20} color="#ffffff" weight="fill" />
          ) : (
            <ChatCircle size={20} color="#ffffff" weight="fill" />
          )}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationTitle, { color: colors.text }]}>
              {title}
            </Text>
            <Text
              style={[styles.conversationTime, { color: colors.textMuted }]}
            >
              {time}
            </Text>
          </View>
          <Text
            style={[styles.conversationSubtitle, { color: colors.textMuted }]}
          >
            {subtitle}
          </Text>
          <Text
            style={[styles.lastMessage, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
        </View>
      </View>
      {unread && (
        <View
          style={[styles.unreadBadge, { backgroundColor: colors.primary }]}
        />
      )}
    </Pressable>
  );

  const QuickActionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress: () => void;
  }> = ({ icon, title, subtitle, onPress }) => (
    <Pressable
      style={[
        styles.quickAction,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.quickActionIcon}>{icon}</View>
      <View style={styles.quickActionContent}>
        <Text style={[styles.quickActionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.quickActionSubtitle, { color: colors.textMuted }]}>
          {subtitle}
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Messages
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Stay connected with Margaret's care team
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>

          <View style={styles.quickActionsContainer}>
            <QuickActionCard
              icon={<ChatCircle size={24} color={colors.primary} />}
              title="Message Care Team"
              subtitle="Send a direct message"
              onPress={handleMessageCareTeam}
            />

            <QuickActionCard
              icon={<Users size={24} color={colors.accent} />}
              title="Family Group Chat"
              subtitle="Chat with other family members"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Recent Conversations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Conversations
          </Text>

          {conversations.length === 0 ? (
            <View style={styles.emptyConversations}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No conversations yet. Start by messaging the care team!
              </Text>
            </View>
          ) : (
            conversations.map((conversation) => {
              const staffMember = conversation.participants.find(
                (p) => p.role === "staff"
              );
              const resident = conversation.residentId
                ? getResidentById(conversation.residentId)
                : null;

              return (
                <ConversationCard
                  key={conversation.id}
                  title={conversation.title}
                  subtitle={
                    conversation.isGroupChat
                      ? `${conversation.participants.length} members`
                      : `${staffMember?.name || "Care Team"}${
                          resident ? ` • About ${resident.name}` : ""
                        }`
                  }
                  lastMessage={
                    conversation.lastMessage?.content || "No messages yet"
                  }
                  time={
                    conversation.lastMessage
                      ? formatTime(conversation.lastMessage.timestamp)
                      : formatTime(conversation.createdAt)
                  }
                  unread={conversation.unreadCount > 0}
                  isGroup={conversation.isGroupChat}
                  onPress={() =>
                    handleConversationPress(conversation.id, conversation.title)
                  }
                />
              );
            })
          )}
        </View>

        {/* Message Guidelines */}
        <View style={styles.section}>
          <View
            style={[
              styles.guidelinesCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.guidelinesHeader}>
              <Check size={20} color={colors.success} />
              <Text style={[styles.guidelinesTitle, { color: colors.text }]}>
                Message Guidelines
              </Text>
            </View>
            <Text style={[styles.guidelinesText, { color: colors.textMuted }]}>
              • Messages are checked regularly during business hours (8 AM - 6
              PM)
              {"\n"}• For urgent matters, please call the care home directly
              {"\n"}• Photos and updates are shared in the main feed
              {"\n"}• All messages are secure and private
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
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
  quickActionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionContent: {
    alignItems: "center",
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  conversationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  conversationLeft: {
    flexDirection: "row",
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  conversationTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  conversationSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyConversations: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  guidelinesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  guidelinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  guidelinesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
