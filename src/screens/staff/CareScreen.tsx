import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme";
import { Header } from "../../components/Header";
import { CareDashboardScreen } from "./CareDashboardScreen";

export const CareScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Care"
        subtitle="Your shift's care delivery stats & tasks"
        showSettings={true}
      />
      <CareDashboardScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
