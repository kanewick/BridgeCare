import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CustomTabBar } from "../components/navigation/CustomTabBar";

// Import family screen components
import { FamilyHomeScreen } from "../screens/family/FamilyHomeScreen";
import { FamilyResidentProfileScreen } from "../screens/family/FamilyResidentProfileScreen";
import { FamilyMessagesScreen } from "../screens/family/FamilyMessagesScreen";
import { FamilyMediaScreen } from "../screens/family/FamilyMediaScreen";
import { FamilyMoreScreen } from "../screens/family/FamilyMoreScreen";

// Define the type for the tab navigator's screen list for type safety
export type FamilyTabParamList = {
  Home: undefined;
  ResidentProfile: undefined;
  Messages: undefined;
  Media: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<FamilyTabParamList>();

/**
 * The tab navigator for family users, featuring the same premium custom tab bar
 * with family-appropriate screens and navigation items.
 */
export const FamilyTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={FamilyHomeScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="ResidentProfile"
        component={FamilyResidentProfileScreen}
        options={{ title: "Resident" }}
      />
      <Tab.Screen
        name="Messages"
        component={FamilyMessagesScreen}
        options={{ title: "Messages" }}
      />
      <Tab.Screen
        name="Media"
        component={FamilyMediaScreen}
        options={{ title: "Media" }}
      />
      <Tab.Screen
        name="More"
        component={FamilyMoreScreen}
        options={{ title: "More" }}
      />
    </Tab.Navigator>
  );
};
