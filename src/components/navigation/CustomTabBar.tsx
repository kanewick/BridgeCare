import React from "react";
import {
  View,
  Pressable,
  Text,
  Platform,
  StyleSheet,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolateColor,
} from "react-native-reanimated";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { TabBarIcon, IconName } from "./TabBarIcon";
import { useAppTheme } from "../../store/themeStore";

// --- Constants ---
const TAB_BAR_HEIGHT = 80;
const FAB_SIZE = 64;
const FAB_ELEVATION = 16;
const ANIMATION_DURATION = 300;

// --- Helper Functions ---
// Map route names to icons for the TabBarIcon component
const getIconName = (routeName: string): IconName => {
  switch (routeName) {
    // Staff navigation icons
    case "Dashboard":
      return "Dashboard";
    case "Residents":
      return "Residents";
    case "QuickLog":
      return "QuickLog";
    case "Profile":
      return "Profile";
    case "Settings":
      return "Settings";
    case "Care":
      return "Care";
    // Family navigation icons
    case "Home":
      return "Home";
    case "ResidentProfile":
      return "ResidentProfile";
    case "Messages":
      return "Messages";
    case "Media":
      return "Media";
    case "More":
      return "More";
    default:
      return "Dashboard"; // Fallback
  }
};

// --- Theme Colors ---
const COLORS = {
  light: {
    background: "#ffffff",
    border: "#f1f5f9",
    shadow: "#64748b",
    primary: "#0ea5e9",
    primarySoft: "#e0f2fe",
    text: "#1e293b",
    textMuted: "#64748b",
    textActive: "#0ea5e9",
    fabBackground: "#0ea5e9",
    fabShadow: "#0369a1",
  },
  dark: {
    background: "#0f172a",
    border: "#334155",
    shadow: "#020617",
    primary: "#38bdf8",
    primarySoft: "#1e293b",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    textActive: "#38bdf8",
    fabBackground: "#0ea5e9",
    fabShadow: "#0369a1",
  },
};

// --- Helper Components ---
type TabBarItemProps = {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  options: any;
  routeName: string;
  colorScheme: "light" | "dark";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TabBarItem: React.FC<TabBarItemProps> = ({
  isFocused,
  onPress,
  onLongPress,
  label,
  options,
  routeName,
  colorScheme,
}) => {
  const colors = COLORS[colorScheme];
  const scale = useSharedValue(1);
  const backgroundOpacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 1, {
      damping: 15,
      stiffness: 150,
    });
    backgroundOpacity.value = withSpring(isFocused ? 1 : 0, {
      damping: 20,
      stiffness: 300,
    });
  }, [isFocused]);

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    });

    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel ?? `${label} tab`}
      style={[styles.tabItem, animatedContainerStyle]}
    >
      {/* Animated background highlight */}
      <Animated.View
        style={[
          styles.tabBackground,
          { backgroundColor: colors.primarySoft },
          animatedBackgroundStyle,
        ]}
      />

      {/* Icon */}
      <View style={styles.iconContainer}>
        <TabBarIcon
          name={getIconName(routeName)}
          focused={isFocused}
          color={isFocused ? colors.textActive : colors.textMuted}
          size={24}
          animated
        />
      </View>

      {/* Label */}
      <Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? colors.textActive : colors.textMuted,
            fontWeight: isFocused ? "600" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

// --- FAB Component ---
type FABProps = {
  onPress: () => void;
  isFocused: boolean;
  colorScheme: "light" | "dark";
};

const FloatingActionButton: React.FC<FABProps> = ({
  onPress,
  isFocused,
  colorScheme,
}) => {
  const colors = COLORS[colorScheme];
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withSpring(isFocused ? 45 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 8, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 8, stiffness: 400 });
    });

    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onPress();
  };

  return (
    <View style={styles.fabContainer}>
      {/* FAB Shadow/Border */}
      <View style={[styles.fabShadow, { backgroundColor: colors.fabShadow }]} />

      {/* Main FAB */}
      <AnimatedPressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Quick Log - Add new entry"
        style={[
          styles.fab,
          { backgroundColor: colors.fabBackground },
          animatedStyle,
        ]}
      >
        <TabBarIcon
          name="QuickLog"
          focused={isFocused}
          color="#ffffff"
          size={28}
          animated={false}
        />
      </AnimatedPressable>
    </View>
  );
};

// --- Main Tab Bar Component ---
export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const { effectiveTheme } = useAppTheme();
  const colors = COLORS[effectiveTheme];
  // Determine which tab should be the FAB based on available routes
  const fabRouteName = state.routes.find((route) => route.name === "QuickLog")
    ? "QuickLog"
    : "Messages";

  const fabRoute = state.routes.find((route) => route.name === fabRouteName);
  const fabIndex = state.routes.findIndex(
    (route) => route.name === fabRouteName
  );
  const isFabFocused = state.index === fabIndex;

  const onFabPress = () => {
    if (!fabRoute) return;

    const event = navigation.emit({
      type: "tabPress",
      target: fabRoute.key,
      canPreventDefault: true,
    });

    if (!isFabFocused && !event.defaultPrevented) {
      navigation.navigate(fabRoute.name, fabRoute.params);
    }
  };

  const tabBarStyle = [
    styles.tabBar,
    {
      backgroundColor: colors.background,
      borderTopColor: colors.border,
      paddingBottom: safeAreaBottom,
      height: TAB_BAR_HEIGHT + safeAreaBottom,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={tabBarStyle}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel?.toString() ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          // Render FAB for QuickLog
          if (route.name === fabRouteName) {
            return (
              <View key={route.key} style={styles.fabPlaceholder}>
                <FloatingActionButton
                  onPress={onFabPress}
                  isFocused={isFabFocused}
                  colorScheme={effectiveTheme}
                />
              </View>
            );
          }

          return (
            <TabBarItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              label={label}
              options={options}
              routeName={route.name}
              colorScheme={effectiveTheme}
            />
          );
        })}
      </View>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 56,
    position: "relative",
  },
  tabBackground: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 16,
  },
  iconContainer: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 14,
  },
  fabPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
  },
  fabContainer: {
    position: "relative",
    marginTop: -FAB_ELEVATION,
    zIndex: 10,
  },
  fabShadow: {
    position: "absolute",
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    top: 2,
    left: 0,
    opacity: 0.3,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
