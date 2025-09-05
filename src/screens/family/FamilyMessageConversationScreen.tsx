import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { PaperPlaneTilt } from "phosphor-react-native";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";
import { useAppTheme } from "../../store/themeStore";
import { useMessageStore, Message } from "../../store/messageStore";
import { useFeedStore } from "../../store/feedStore";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";

type ConversationScreenRouteProp = RouteProp<
  {
    ConversationScreen: { conversationId: string; conversationTitle: string };
  },
  "ConversationScreen"
>;

export const FamilyMessageConversationScreen: React.FC = () => {
  const route = useRoute<ConversationScreenRouteProp>();
  const navigation = useNavigation();
  const { effectiveTheme } = useAppTheme();
  const contentContainerStyle = useContentContainerStyle();

  const { conversationId, conversationTitle } = route.params;
  const {
    getConversationMessages,
    sendMessage,
    markConversationAsRead,
    conversations,
  } = useMessageStore();
  const { currentUser, getResidentById } = useFeedStore();

  // Get the current conversation to access its residentId
  const currentConversation = conversations.find(
    (conv) => conv.id === conversationId
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const colors = {
    background: effectiveTheme === "dark" ? "#0f172a" : "#f8fafc",
    card: effectiveTheme === "dark" ? "#1e293b" : "#ffffff",
    text: effectiveTheme === "dark" ? "#f8fafc" : "#1e293b",
    textMuted: effectiveTheme === "dark" ? "#94a3b8" : "#64748b",
    primary: effectiveTheme === "dark" ? "#38bdf8" : "#0ea5e9",
    border: effectiveTheme === "dark" ? "#334155" : "#e2e8f0",
    myMessage: effectiveTheme === "dark" ? "#1e40af" : "#3b82f6",
    theirMessage: effectiveTheme === "dark" ? "#374151" : "#f3f4f6",
  };

  useEffect(() => {
    // Load messages for this conversation
    const conversationMessages = getConversationMessages(conversationId);
    setMessages(conversationMessages);

    // Mark conversation as read
    markConversationAsRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim() && currentUser) {
      sendMessage(
        inputText.trim(),
        conversationId,
        currentUser.id,
        currentUser.name,
        currentUser.role,
        currentConversation?.residentId
      );

      // Refresh messages
      const updatedMessages = getConversationMessages(conversationId);
      setMessages(updatedMessages);

      setInputText("");

      // Scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isMyMessage = currentUser
      ? message.senderId === currentUser.id
      : false;

    // Get resident info if this message is about a specific resident
    const resident = message.residentId
      ? getResidentById(message.residentId)
      : null;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage
            ? styles.myMessageContainer
            : styles.theirMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMyMessage
                ? colors.myMessage
                : colors.theirMessage,
            },
          ]}
        >
          {!isMyMessage && (
            <View>
              <Text style={[styles.senderName, { color: colors.primary }]}>
                {message.senderName}
                {resident && message.senderRole === "family" && (
                  <Text
                    style={[
                      styles.residentContext,
                      { color: colors.textMuted },
                    ]}
                  >
                    {" "}
                    • {resident.name} (Room {resident.room})
                  </Text>
                )}
              </Text>
            </View>
          )}
          <Text
            style={[
              styles.messageText,
              { color: isMyMessage ? "#ffffff" : colors.text },
            ]}
          >
            {message.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                color: isMyMessage ? "rgba(255,255,255,0.7)" : colors.textMuted,
              },
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={conversationTitle}
        showBack={true}
        hideNotifications={true}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text
                style={[styles.emptyStateText, { color: colors.textMuted }]}
              >
                No messages yet. Start the conversation!
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </ScrollView>

        {/* Message Input */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim()
                  ? colors.primary
                  : colors.border,
              },
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <PaperPlaneTilt
              size={20}
              color={inputText.trim() ? "#ffffff" : colors.textMuted}
              weight="bold"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for tab bar
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  theirMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  residentContext: {
    fontSize: 11,
    fontWeight: "400",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: "top",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
