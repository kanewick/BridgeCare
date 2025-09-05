import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "family" | "staff";
  recipientId?: string; // For direct messages
  content: string;
  timestamp: string;
  isRead: boolean;
  residentId?: string; // Associated resident for context
}

export interface Conversation {
  id: string;
  title: string;
  participants: {
    id: string;
    name: string;
    role: "family" | "staff";
  }[];
  lastMessage?: Message;
  unreadCount: number;
  residentId?: string; // Associated resident
  isGroupChat: boolean;
  createdAt: string;
}

interface MessageState {
  conversations: Conversation[];
  messages: Message[];
  unreadCount: number;

  // Actions
  sendMessage: (
    content: string,
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: "family" | "staff",
    residentId?: string
  ) => void;
  markMessageAsRead: (messageId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  createConversation: (
    title: string,
    participants: { id: string; name: string; role: "family" | "staff" }[],
    residentId?: string
  ) => string;
  getConversationMessages: (conversationId: string) => Message[];
  getUnreadMessagesForRole: (role: "family" | "staff") => Message[];
  getConversationsForRole: (role: "family" | "staff") => Conversation[];
  getConversationsForUser: (userId: string) => Conversation[];
}

// Sample data
const sampleConversations: Conversation[] = [
  {
    id: "care-team-general",
    title: "Care Team - General",
    participants: [
      { id: "kallen-newick", name: "Kallen Newick", role: "family" },
      { id: "skarlette-choi", name: "Skarlette Choi", role: "staff" },
    ],
    unreadCount: 0,
    residentId: "5", // Associated with Bob Sargeant for Kallen
    isGroupChat: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bob-sargeant-care",
    title: "Bob Sargeant Care Discussion",
    participants: [
      { id: "kallen-newick", name: "Kallen Newick", role: "family" },
      { id: "skarlette-choi", name: "Skarlette Choi", role: "staff" },
    ],
    unreadCount: 0,
    residentId: "5",
    isGroupChat: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "robert-chen-care",
    title: "Robert Chen Care Discussion",
    participants: [
      // Removed Kallen - he should only be in Bob's conversations
      { id: "skarlette-choi", name: "Skarlette Choi", role: "staff" },
    ],
    unreadCount: 0,
    residentId: "2",
    isGroupChat: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const sampleMessages: Message[] = [
  {
    id: "msg-1",
    conversationId: "care-team-general",
    senderId: "skarlette-choi",
    senderName: "Skarlette Choi",
    senderRole: "staff",
    content:
      "Hello! I'm the primary nurse here. Please feel free to reach out if you have any questions about care.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: "msg-2",
    conversationId: "bob-sargeant-care",
    senderId: "kallen-newick",
    senderName: "Kallen Newick",
    senderRole: "family",
    content:
      "Hi Skarlette! How is Dad doing today? I saw he had his favorite pancakes for breakfast - that must have made him happy!",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    residentId: "5",
  },
  {
    id: "msg-3",
    conversationId: "bob-sargeant-care",
    senderId: "skarlette-choi",
    senderName: "Skarlette Choi",
    senderRole: "staff",
    content:
      "Yes! Bob's face lit up when he saw the pancakes. He's been in great spirits today and participated actively in morning exercises. His medication routine is going smoothly too.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    residentId: "5",
  },
  {
    id: "msg-4",
    conversationId: "care-team-general",
    senderId: "skarlette-choi",
    senderName: "Skarlette Choi",
    senderRole: "staff",
    content:
      "Good morning! Just wanted to let you know that Bob had a wonderful night's sleep and is looking forward to today's activities.",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    residentId: "5",
  },
];

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      conversations: sampleConversations,
      messages: sampleMessages,
      unreadCount: 0,

      sendMessage: (
        content,
        conversationId,
        senderId,
        senderName,
        senderRole,
        residentId
      ) => {
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId,
          senderName,
          senderRole,
          content,
          timestamp: new Date().toISOString(),
          isRead: false,
          residentId,
        };

        set((state) => {
          const updatedMessages = [...state.messages, newMessage];
          const updatedConversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: newMessage,
                unreadCount: conv.unreadCount + 1,
              };
            }
            return conv;
          });

          return {
            messages: updatedMessages,
            conversations: updatedConversations,
            unreadCount: state.unreadCount + 1,
          };
        });
      },

      markMessageAsRead: (messageId) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          ),
        }));
      },

      markConversationAsRead: (conversationId) => {
        set((state) => {
          const conversationMessages = state.messages.filter(
            (msg) => msg.conversationId === conversationId && !msg.isRead
          );

          const updatedMessages = state.messages.map((msg) =>
            msg.conversationId === conversationId
              ? { ...msg, isRead: true }
              : msg
          );

          const updatedConversations = state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          );

          return {
            messages: updatedMessages,
            conversations: updatedConversations,
            unreadCount: Math.max(
              0,
              state.unreadCount - conversationMessages.length
            ),
          };
        });
      },

      createConversation: (title, participants, residentId) => {
        const newConversation: Conversation = {
          id: `conv-${Date.now()}`,
          title,
          participants,
          unreadCount: 0,
          residentId,
          isGroupChat: participants.length > 2,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          conversations: [...state.conversations, newConversation],
        }));

        return newConversation.id;
      },

      getConversationMessages: (conversationId) => {
        const { messages } = get();
        return messages
          .filter((msg) => msg.conversationId === conversationId)
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
      },

      getUnreadMessagesForRole: (role) => {
        const { messages } = get();
        return messages.filter((msg) => !msg.isRead && msg.senderRole !== role);
      },

      getConversationsForRole: (role) => {
        const { conversations } = get();
        return conversations
          .filter((conv) => conv.participants.some((p) => p.role === role))
          .sort((a, b) => {
            const aTime = a.lastMessage?.timestamp || a.createdAt;
            const bTime = b.lastMessage?.timestamp || b.createdAt;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });
      },

      // Get conversations for a specific user (with access control)
      getConversationsForUser: (userId: string) => {
        const { conversations } = get();
        return conversations
          .filter((conv) => conv.participants.some((p) => p.id === userId))
          .sort((a, b) => {
            const aTime = a.lastMessage?.timestamp || a.createdAt;
            const bTime = b.lastMessage?.timestamp || b.createdAt;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });
      },
    }),
    {
      name: "message-storage-v2", // Force refresh with updated conversation data
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
