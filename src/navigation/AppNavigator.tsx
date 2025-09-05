import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFeedStore } from "../store/feedStore";
import { StaffResidentDetailScreen } from "../screens/staff/StaffResidentDetailScreen";
import { StaffMessagesScreen } from "../screens/staff/StaffMessagesScreen";
import { FamilyMessageConversationScreen } from "../screens/family/FamilyMessageConversationScreen";
import { ResidentPostScreen } from "../screens/ResidentPostScreen";
import { SettingsScreen } from "../screens/shared/SettingsScreen";
import { StaffTabNavigator } from "./StaffTabNavigator";
import { FamilyTabNavigator } from "./FamilyTabNavigator";

// Define navigation types
export type RootStackParamList = {
  StaffTabs: undefined;
  FamilyTabs: undefined;
  ResidentTabs: undefined;
  ResidentDetail: { residentId: string };
  ConversationScreen: { conversationId: string; conversationTitle: string };
  StaffMessages: undefined;
};

// Stack navigators for each role
const RootStack = createStackNavigator<RootStackParamList>();
const ResidentTabs = createBottomTabNavigator();

// Resident Tab Navigator
const ResidentTabNavigator = () => {
  return (
    <ResidentTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <ResidentTabs.Screen
        name="Post"
        component={ResidentPostScreen}
        options={{ title: "Share Update" }}
      />
      <ResidentTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </ResidentTabs.Navigator>
  );
};

// Staff Stack Navigator - wraps StaffTabNavigator with modal screens
const StaffStackNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="StaffTabs" component={StaffTabNavigator} />
      <RootStack.Screen
        name="ResidentDetail"
        component={StaffResidentDetailScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <RootStack.Screen
        name="StaffMessages"
        component={StaffMessagesScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <RootStack.Screen
        name="ConversationScreen"
        component={FamilyMessageConversationScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </RootStack.Navigator>
  );
};

// Family Stack Navigator - wraps FamilyTabNavigator
const FamilyStackNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="FamilyTabs" component={FamilyTabNavigator} />
      <RootStack.Screen
        name="ConversationScreen"
        component={FamilyMessageConversationScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </RootStack.Navigator>
  );
};

// Main App Navigator
export const AppNavigator: React.FC = () => {
  const { currentRole } = useFeedStore();

  // Choose the correct navigator based on the user's role
  const renderRoleNavigator = () => {
    switch (currentRole) {
      case "staff":
        return <StaffStackNavigator />;
      case "family":
        return <FamilyStackNavigator />;
      case "resident":
        return <ResidentTabNavigator />;
      default:
        return <StaffStackNavigator />; // Default to staff
    }
  };

  return <NavigationContainer>{renderRoleNavigator()}</NavigationContainer>;
};
