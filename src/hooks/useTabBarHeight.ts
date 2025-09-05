import { useSafeAreaInsets } from "react-native-safe-area-context";

// Constants from CustomTabBar
const TAB_BAR_HEIGHT = 80;

/**
 * Hook to get the tab bar height including safe area for proper screen padding
 */
export const useTabBarHeight = () => {
  const { bottom: safeAreaBottom } = useSafeAreaInsets();

  return {
    tabBarHeight: TAB_BAR_HEIGHT,
    tabBarHeightWithSafeArea: TAB_BAR_HEIGHT + safeAreaBottom,
    safeAreaBottom,
  };
};

/**
 * Hook to get the proper content container style for ScrollViews
 * that need to account for the tab bar
 */
export const useContentContainerStyle = (additionalPadding: number = 20) => {
  const { tabBarHeightWithSafeArea } = useTabBarHeight();

  return {
    paddingBottom: tabBarHeightWithSafeArea + additionalPadding,
  };
};
