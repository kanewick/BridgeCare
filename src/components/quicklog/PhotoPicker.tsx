import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, radius, spacing, shadow, theme } from "../../theme";

interface PhotoPickerProps {
  selectedPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
  hasPhotoConsent: boolean;
  residentName?: string;
  testID?: string;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  selectedPhotos,
  onPhotosChange,
  hasPhotoConsent,
  residentName,
  testID = "photo-picker",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useSharedValue(1);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to select images.",
        [{ text: "OK" }]
      );
      return false;
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "Please allow camera access to take photos.",
        [{ text: "OK" }]
      );
      return false;
    }

    return true;
  };

  const handleAddPhoto = async () => {
    if (!hasPhotoConsent) {
      Alert.alert(
        "Photo Not Allowed",
        `${
          residentName || "This resident"
        } has not given consent for photos. Please check with the family or update their consent settings.`,
        [{ text: "OK" }]
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert("Add Photo", "How would you like to add a photo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Camera",
        onPress: () => takePhoto(),
      },
      {
        text: "Photo Library",
        onPress: () => pickPhoto(),
      },
    ]);
  };

  const takePhoto = async () => {
    setIsLoading(true);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newPhotos = [...selectedPhotos, result.assets[0].uri];
        onPhotosChange(newPhotos);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const pickPhoto = async () => {
    setIsLoading(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newPhotos = [...selectedPhotos, result.assets[0].uri];
        onPhotosChange(newPhotos);
      }
    } catch (error) {
      console.error("Error picking photo:", error);
      Alert.alert("Error", "Failed to select photo. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhoto = async (photoUri: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPhotos = selectedPhotos.filter((uri) => uri !== photoUri);
    onPhotosChange(newPhotos);
  };

  const handleAddPhotoPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    scaleAnim.value = withSpring(0.95, { damping: 20, stiffness: 300 }, () => {
      scaleAnim.value = withSpring(1, { damping: 20, stiffness: 300 });
    });

    handleAddPhoto();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>Photos (Optional)</Text>

      {/* Photo Consent Warning */}
      {!hasPhotoConsent && (
        <View style={styles.warningContainer}>
          <Ionicons
            name="warning"
            size={16}
            color={colors.warning}
            style={styles.warningIcon}
          />
          <Text style={styles.warningText}>
            {residentName || "This resident"} has not given photo consent
          </Text>
        </View>
      )}

      {/* Selected Photos */}
      {selectedPhotos.length > 0 && (
        <View style={styles.photosContainer}>
          {selectedPhotos.map((photoUri, index) => (
            <View key={index} style={styles.photoItem}>
              <Image source={{ uri: photoUri }} style={styles.photoThumbnail} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => handleRemovePhoto(photoUri)}
                testID={`${testID}-remove-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${index + 1}`}
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add Photo Button */}
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.addPhotoButton,
            !hasPhotoConsent && styles.addPhotoButtonDisabled,
          ]}
          onPress={handleAddPhotoPress}
          disabled={!hasPhotoConsent || isLoading}
          testID={`${testID}-add`}
          accessibilityRole="button"
          accessibilityLabel="Add photo"
          accessibilityState={{ disabled: !hasPhotoConsent }}
        >
          <Ionicons
            name={isLoading ? "hourglass" : "camera"}
            size={24}
            color={hasPhotoConsent ? colors.primary : colors.textMuted}
            style={styles.addPhotoIcon}
          />
          <Text
            style={[
              styles.addPhotoText,
              !hasPhotoConsent && styles.addPhotoTextDisabled,
            ]}
          >
            {isLoading ? "Processing..." : "Take Photo"}
          </Text>
          {selectedPhotos.length > 0 && (
            <View style={styles.photoCount}>
              <Text style={styles.photoCountText}>{selectedPhotos.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Help Text */}
      <Text style={styles.helpText}>
        {hasPhotoConsent
          ? "Tap to take a photo or select from your library"
          : "Photo consent required to add images"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  warningIcon: {
    marginRight: spacing.sm,
  },
  warningText: {
    ...theme.typography.bodySmall,
    color: colors.warning,
    flex: 1,
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  photoItem: {
    position: "relative",
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.chipBg,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.card,
    borderRadius: 10,
    ...shadow.sm,
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
    ...shadow.sm,
  },
  addPhotoButtonDisabled: {
    backgroundColor: colors.chipBg,
    opacity: 0.6,
  },
  addPhotoIcon: {
    marginRight: spacing.sm,
  },
  addPhotoText: {
    ...theme.typography.bodyMedium,
    color: colors.primary,
    fontWeight: "600",
  },
  addPhotoTextDisabled: {
    color: colors.textMuted,
  },
  photoCount: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  photoCountText: {
    ...theme.typography.caption,
    color: colors.card,
    fontWeight: "700",
    fontSize: 10,
  },
  helpText: {
    ...theme.typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
