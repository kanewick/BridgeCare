import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CustomTabBar } from "../components/navigation/CustomTabBar";

// Import your screen components
import { StaffDashboardScreen } from "../screens/staff/StaffDashboardScreen";
import { StaffQuickLogScreen } from "../screens/staff/StaffQuickLogScreen";
import { StaffResidentsScreen } from "../screens/staff/StaffResidentsScreen";
import { StaffProfileScreen } from "../screens/staff/StaffProfileScreen";
import { SettingsScreen } from "../screens/shared/SettingsScreen";

// Define the type for the tab navigator's screen list for type safety
export type StaffTabParamList = {
  Dashboard: undefined;
  Residents: undefined;
  QuickLog: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<StaffTabParamList>();

/**
 * The tab navigator for staff users, featuring a custom tab bar with a
 * centered Floating Action Button.
 */
export const StaffTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={StaffDashboardScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Residents"
        component={StaffResidentsScreen}
        options={{ title: "Residents" }}
      />
      <Tab.Screen
        name="QuickLog"
        component={StaffQuickLogScreen}
        options={{ title: "Quick Log" }}
      />
      <Tab.Screen
        name="Profile"
        component={StaffProfileScreen}
        options={{ title: "Profile" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Tab.Navigator>
  );
};
