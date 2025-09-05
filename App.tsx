import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { queryClient } from "./src/state/queryClient";
import { colors } from "./src/theme";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
