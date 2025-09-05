import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Pressable,
  Dimensions,
} from "react-native";
import {
  Images,
  VideoCamera,
  Plus,
  Heart,
  Download,
  Share,
} from "phosphor-react-native";
import { useContentContainerStyle } from "../../hooks/useTabBarHeight";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 60) / 2; // 3 columns with spacing

export const FamilyMediaScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const contentContainerStyle = useContentContainerStyle();

  const colors = {
    background: colorScheme === "dark" ? "#0f172a" : "#f8fafc",
    card: colorScheme === "dark" ? "#1e293b" : "#ffffff",
    text: colorScheme === "dark" ? "#f8fafc" : "#1e293b",
    textMuted: colorScheme === "dark" ? "#94a3b8" : "#64748b",
    primary: colorScheme === "dark" ? "#38bdf8" : "#0ea5e9",
    border: colorScheme === "dark" ? "#334155" : "#e2e8f0",
    accent: colorScheme === "dark" ? "#f59e0b" : "#f59e0b",
  };

  const MediaItem: React.FC<{
    title: string;
    date: string;
    type: "photo" | "video";
    likes?: number;
  }> = ({ title, date, type, likes = 0 }) => (
    <Pressable
      style={[
        styles.mediaItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.mediaPreview, { backgroundColor: colors.border }]}>
        {type === "video" ? (
          <VideoCamera size={32} color={colors.textMuted} />
        ) : (
          <Images size={32} color={colors.textMuted} />
        )}
      </View>
      <View style={styles.mediaInfo}>
        <Text
          style={[styles.mediaTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text style={[styles.mediaDate, { color: colors.textMuted }]}>
          {date}
        </Text>
        {likes > 0 && (
          <View style={styles.likesContainer}>
            <Heart size={12} color={colors.accent} weight="fill" />
            <Text style={[styles.likesText, { color: colors.accent }]}>
              {likes}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  const ActionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress: () => void;
  }> = ({ icon, title, subtitle, onPress }) => (
    <Pressable
      style={[
        styles.actionCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>{icon}</View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
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
            Media & Memories
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Photos and videos of Margaret's journey
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsContainer}>
            <ActionCard
              icon={<Plus size={24} color={colors.primary} />}
              title="Upload Photo"
              subtitle="Share a memory"
              onPress={() => {}}
            />

            <ActionCard
              icon={<Download size={24} color={colors.accent} />}
              title="Download All"
              subtitle="Save to device"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Recent Media */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            This Week
          </Text>

          <View style={styles.mediaGrid}>
            <MediaItem
              title="Music Therapy Session"
              date="Today, 2:30 PM"
              type="photo"
              likes={5}
            />

            <MediaItem
              title="Garden Walk"
              date="Today, 10:15 AM"
              type="photo"
              likes={3}
            />

            <MediaItem
              title="Afternoon Tea Time"
              date="Yesterday"
              type="photo"
              likes={7}
            />

            <MediaItem
              title="Birthday Celebration"
              date="Monday"
              type="video"
              likes={12}
            />
          </View>
        </View>

        {/* Last Month */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Last Month
          </Text>

          <View style={styles.mediaGrid}>
            <MediaItem
              title="Family Visit"
              date="2 weeks ago"
              type="photo"
              likes={15}
            />

            <MediaItem
              title="Arts & Crafts"
              date="2 weeks ago"
              type="photo"
              likes={4}
            />

            <MediaItem
              title="Morning Exercise"
              date="3 weeks ago"
              type="video"
              likes={6}
            />

            <MediaItem
              title="Baking Session"
              date="3 weeks ago"
              type="photo"
              likes={9}
            />

            <MediaItem
              title="Reading Time"
              date="4 weeks ago"
              type="photo"
              likes={2}
            />

            <MediaItem
              title="Garden Party"
              date="4 weeks ago"
              type="video"
              likes={18}
            />
          </View>
        </View>

        {/* Upload Guidelines */}
        <View style={styles.section}>
          <View
            style={[
              styles.guidelinesCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.guidelinesHeader}>
              <Share size={20} color={colors.primary} />
              <Text style={[styles.guidelinesTitle, { color: colors.text }]}>
                Sharing Guidelines
              </Text>
            </View>
            <Text style={[styles.guidelinesText, { color: colors.textMuted }]}>
              • Family members can upload photos and videos
              {"\n"}• All uploads are reviewed before sharing
              {"\n"}• Please respect privacy of other residents
              {"\n"}• Maximum file size: 10MB per upload
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
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionContent: {
    alignItems: "center",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mediaItem: {
    width: PHOTO_SIZE,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  mediaPreview: {
    height: PHOTO_SIZE * 0.6,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaInfo: {
    padding: 12,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  mediaDate: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 6,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likesText: {
    fontSize: 12,
    fontWeight: "600",
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
