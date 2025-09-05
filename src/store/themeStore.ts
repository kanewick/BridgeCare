import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  getEffectiveTheme: () => "light" | "dark";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: "system",
      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
      getEffectiveTheme: () => {
        const { themeMode } = get();
        if (themeMode === "system") {
          // This will be overridden by the hook in components
          return "light";
        }
        return themeMode;
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Custom hook that combines theme store with system theme
export const useAppTheme = () => {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode } = useThemeStore();

  const effectiveTheme =
    themeMode === "system" ? systemColorScheme || "light" : themeMode;

  return {
    themeMode,
    setThemeMode,
    effectiveTheme,
    isSystemTheme: themeMode === "system",
  };
};
