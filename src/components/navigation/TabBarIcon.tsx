import React from "react";
import { ColorValue } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  House,
  Users,
  Gear,
  User,
  Plus,
  Heart,
  ChatCircle,
  Images,
  DotsThree,
} from "phosphor-react-native";

// Define a type for the icon names for better type safety
export type IconName =
  | "Dashboard"
  | "QuickLog"
  | "Residents"
  | "Profile"
  | "Settings"
  | "Home"
  | "Feed"
  | "ResidentProfile"
  | "Messages"
  | "Media"
  | "More";

type TabBarIconProps = {
  name: IconName;
  focused: boolean;
  color: string | ColorValue;
  size: number;
  animated?: boolean;
};

// Map icon names to actual icon components
const iconMap: Record<IconName, React.FC<any>> = {
  // Staff navigation icons
  Dashboard: House,
  QuickLog: Plus,
  Residents: Users,
  Profile: User,
  Settings: Gear,
  // Family navigation icons
  Home: House,
  Feed: Heart,
  ResidentProfile: User,
  Messages: ChatCircle,
  Media: Images,
  More: DotsThree,
};

/**
 * A wrapper component to display tab bar icons consistently with smooth animations.
 */
export const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  focused,
  color,
  size,
  animated = true,
}) => {
  const IconComponent = iconMap[name];

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) return {};

    return {
      transform: [
        {
          scale: withSpring(focused ? 1.1 : 1, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  if (!IconComponent) {
    // Fallback to a default icon if the name is invalid
    return <House color={color.toString()} weight="regular" size={size} />;
  }

  const IconElement = (
    <IconComponent
      color={color.toString()}
      weight={focused ? "fill" : "regular"}
      size={size}
    />
  );

  if (!animated) {
    return IconElement;
  }

  return <Animated.View style={animatedStyle}>{IconElement}</Animated.View>;
};
