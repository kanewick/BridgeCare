import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { colors, radius, spacing, theme } from "../theme";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { TagButton } from "../components/TagButton";
import { Header } from "../components/Header";
import { useFeedStore } from "../store/feedStore";
import { useContentContainerStyle } from "../hooks/useTabBarHeight";

export const ResidentPostScreen: React.FC = () => {
  const { currentUserId, addFeedItem } = useFeedStore();
  const contentContainerStyle = useContentContainerStyle();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityTypes = [
    { key: "meal", label: "🍽️ Meal", emoji: "🍽️" },
    { key: "activity", label: "🏃 Activity", emoji: "🏃" },
    { key: "rest", label: "😴 Rest", emoji: "😴" },
    { key: "photo", label: "📷 Photo", emoji: "📷" },
    { key: "note", label: "📝 Note", emoji: "📝" },
  ];

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handlePhotoCapture = () => {
    // For now, we'll simulate photo capture with a placeholder
    Alert.alert(
      "Photo Capture",
      "Photo capture functionality would be implemented here with Expo Image Picker.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Use Demo Photo",
          onPress: () => {
            setPhoto(
              "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop"
            );
          },
        },
      ]
    );
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!currentUserId) {
      Alert.alert("Error", "User not identified. Please log in again.");
      return;
    }

    if (selectedTypes.length === 0 && !note && !photo) {
      Alert.alert(
        "Error",
        "Please add at least one activity type, note, or photo."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine the type based on what's selected
      let type: "meal" | "activity" | "rest" | "photo" | "note";

      if (selectedTypes.length > 0) {
        type = selectedTypes[0] as any;
      } else if (photo) {
        type = "photo";
      } else {
        type = "note";
      }

      // Create the feed item (resident posts about themselves)
      const feedItem = {
        residentId: currentUserId, // Resident posts about themselves
        authorId: currentUserId,
        type,
        text: note || undefined,
        tags: selectedTypes,
        photoUrl: photo || undefined,
      };

      addFeedItem(feedItem);

      Alert.alert(
        "Success!",
        "Your update has been posted. Your family will see this in their feed.",
        [{ text: "OK" }]
      );

      // Clear form
      setSelectedTypes([]);
      setNote("");
      setPhoto(null);
    } catch (error) {
      console.error("Error posting update:", error);
      Alert.alert("Error", `Failed to post update: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badges for form validation
  const statusBadges = [
    ...selectedTypes.map((type) => ({ label: type, color: "primary" })),
    ...(note ? [{ label: "Note", color: "success" }] : []),
    ...(photo ? [{ label: "Photo", color: "success" }] : []),
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Share Your Day"
        subtitle="Let your family know how you're doing"
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            contentContainerStyle,
          ]}
        >
          {/* Activity Type Selection */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>
              What would you like to share?
            </Text>
            <View style={styles.typeButtons}>
              {activityTypes.map((type) => (
                <TagButton
                  key={type.key}
                  label={type.label}
                  selected={selectedTypes.includes(type.key)}
                  onPress={() => handleTypeToggle(type.key)}
                  style={styles.typeButton}
                />
              ))}
            </View>
          </Card>

          {/* Note Input */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Add Details (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Tell your family about your day..."
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>

          {/* Photo Section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Add a Photo (optional)</Text>
            {photo ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.photoThumbnail} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={handleRemovePhoto}
                >
                  <Text style={styles.removePhotoButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handlePhotoCapture}
              >
                <Text style={styles.photoButtonText}>📷 Take Photo</Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Status Badges */}
          {statusBadges.length > 0 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Ready to Share</Text>
              <View style={styles.statusBadges}>
                {statusBadges.map((badge, index) => (
                  <Badge
                    key={index}
                    label={badge.label}
                    style={styles.statusBadge}
                  />
                ))}
              </View>
            </Card>
          )}

          {/* Submit Button */}
          <Card style={styles.section}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Sharing..." : "Share Update"}
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionDescription: {
    ...theme.typography.body,
    color: colors.textMuted,
    lineHeight: theme.typography.body.lineHeight,
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  typeButton: {
    marginBottom: spacing.xs,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 80,
    color: colors.text,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  photoButton: {
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  photoButtonText: {
    ...theme.typography.body,
    color: colors.textMuted,
  },
  photoPreview: {
    alignItems: "center",
  },
  photoThumbnail: {
    width: "100%",
    height: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  removePhotoButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  removePhotoButtonText: {
    color: colors.card,
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: "600",
  },
  statusBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusBadge: {
    marginBottom: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitButtonText: {
    color: colors.card,
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: "700",
  },
});
