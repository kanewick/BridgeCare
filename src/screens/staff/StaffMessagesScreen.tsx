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
  ArrowLeft,
} from "phosphor-react-native";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { useAppTheme } from "../../store/themeStore";
import { useMessageStore } from "../../store/messageStore";
import { useFeedStore } from "../../store/feedStore";
import { Header } from "../../components/Header";

export const StaffMessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { effectiveTheme } = useAppTheme();
  const contentContainerStyle = useContentContainerStyle();
  const { getConversationsForUser, markConversationAsRead } = useMessageStore();
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
    danger: effectiveTheme === "dark" ? "#ef4444" : "#dc2626",
  };

  const handleConversationPress = (conversationId: string, title: string) => {
    // Navigate to conversation screen (we'll use the same one as family)
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
            <Users size={20} color="#ffffff" weight="bold" />
          ) : (
            <ChatCircle size={20} color="#ffffff" weight="bold" />
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
            style={[styles.conversationSubtitle, { color: colors.primary }]}
          >
            {subtitle}
          </Text>
          <Text
            style={[styles.lastMessage, { color: colors.textMuted }]}
            numberOfLines={2}
          >
            {lastMessage}
          </Text>
        </View>
      </View>
      {unread && (
        <View
          style={[styles.unreadBadge, { backgroundColor: colors.danger }]}
        />
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Messages"
        subtitle="Family communications"
        showBack={true}
        hideNotifications={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Unread Messages
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {conversations.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Active Conversations
            </Text>
          </View>
        </View>

        {/* Conversations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Family Communications
          </Text>

          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <ChatCircle size={48} color={colors.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No messages yet
              </Text>
              <Text
                style={[styles.emptyStateText, { color: colors.textMuted }]}
              >
                Family members will be able to message you directly through the
                app
              </Text>
            </View>
          ) : (
            conversations.map((conversation) => {
              const familyMember = conversation.participants.find(
                (p) => p.role === "family"
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
                      : `${familyMember?.name || "Family Member"}${
                          resident
                            ? ` • ${resident.name} (Room ${resident.room})`
                            : ""
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

        {/* Guidelines */}
        <View style={styles.section}>
          <View
            style={[
              styles.guidelinesCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.guidelinesTitle, { color: colors.text }]}>
              📋 Communication Guidelines
            </Text>
            <Text style={[styles.guidelinesText, { color: colors.textMuted }]}>
              • Respond to family messages within 24 hours when possible{"\n"}•
              Keep messages professional and compassionate{"\n"}• Share positive
              updates and important care information{"\n"}• For urgent matters,
              use direct phone communication{"\n"}• Document important
              conversations in care notes
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statsCard: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  conversationLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    flex: 1,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  guidelinesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  guidelinesText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
