import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { StyleSheet, useColorScheme } from "react-native";
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";
export interface ThemeTokens {
  mode: ResolvedTheme;
  background: string;
  backgroundAlt: string;
  surface: string;
  elevatedSurface: string;
  cardBorder: string;
  strongBorder: string;
  primary: string;
  primaryPressed: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  successSurface: string;
  warning: string;
  error: string;
  errorSurface: string;
  inputBackground: string;
  inputBorder: string;
  tabBarBackground: string;
  accentSurface: string;
  overlay: string;
  statusBarStyle: "light" | "dark";
  shadowColor: string;
  cardElevation: number;
  text: string;
  muted: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  primaryDark: string;
  danger: string;
  dangerSurface: string;
}
export const darkTheme: ThemeTokens = {
  mode: "dark",
  background: "#070912",
  backgroundAlt: "#0D1020",
  surface: "#111522",
  elevatedSurface: "#151A2A",
  cardBorder: "#272B3A",
  strongBorder: "#3B3F55",
  primary: "#A78BFA",
  primaryPressed: "#8B5CF6",
  secondary: "#C084FC",
  textPrimary: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  success: "#34D399",
  successSurface: "#0A2924",
  warning: "#FBBF24",
  error: "#FB7185",
  errorSurface: "#2A1320",
  inputBackground: "#151A2A",
  inputBorder: "#3B3F55",
  tabBarBackground: "#0D1020",
  accentSurface: "#211A3A",
  overlay: "rgba(7,9,18,.74)",
  statusBarStyle: "light",
  shadowColor: "#000000",
  cardElevation: 0,
  text: "#F8FAFC",
  muted: "#94A3B8",
  surfaceElevated: "#151A2A",
  border: "#272B3A",
  borderStrong: "#3B3F55",
  primaryDark: "#8B5CF6",
  danger: "#FB7185",
  dangerSurface: "#2A1320",
};
export const lightTheme: ThemeTokens = {
  mode: "light",
  background: "#F9F7FF",
  backgroundAlt: "#F0EBFF",
  surface: "#FFFFFF",
  elevatedSurface: "#FCFAFF",
  cardBorder: "#E5DDF5",
  strongBorder: "#CFC1EC",
  primary: "#7B5BE7",
  primaryPressed: "#6544D5",
  secondary: "#B36AE2",
  textPrimary: "#211A38",
  textSecondary: "#514A66",
  textMuted: "#777087",
  success: "#16805D",
  successSurface: "#EAF8F2",
  warning: "#B7791F",
  error: "#C43D57",
  errorSurface: "#FFF0F3",
  inputBackground: "#FFFFFF",
  inputBorder: "#D8CDED",
  tabBarBackground: "#FFFFFF",
  accentSurface: "#F1ECFF",
  overlay: "rgba(30,27,46,.38)",
  statusBarStyle: "dark",
  shadowColor: "#3E2768",
  cardElevation: 3,
  text: "#1E1B2E",
  muted: "#756E86",
  surfaceElevated: "#FCFAFF",
  border: "#E5DDF5",
  borderStrong: "#CFC1EC",
  primaryDark: "#6544D5",
  danger: "#C43D57",
  dangerSurface: "#FFF0F3",
};
export const spacing = {
  xs: 4,
  sm: 6,
  md: 9,
  lg: 13,
  xl: 17,
  xxl: 22,
  hero: 28,
} as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;
export const type = {
  caption: 11,
  body: 14,
  label: 12,
  subtitle: 16,
  section: 20,
  title: 27,
  hero: 29,
} as const;
const KEY = "career_guidance_ai_theme";
interface ThemeValue {
  theme: ThemeTokens;
  preference: ThemePreference;
  resolved: ResolvedTheme;
  ready: boolean;
  setPreference(value: ThemePreference): Promise<void>;
}
const Context = createContext<ThemeValue | null>(null);
export function AppThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme(),
    [preference, setPreferenceState] = useState<ThemePreference>("system"),
    [ready, setReady] = useState(false);
  useEffect(() => {
    void AsyncStorage.getItem(KEY)
      .then((value) => {
        if (value === "light" || value === "dark" || value === "system")
          setPreferenceState(value);
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);
  const resolved: ResolvedTheme =
      preference === "system"
        ? system === "dark"
          ? "dark"
          : "light"
        : preference,
    theme = resolved === "dark" ? darkTheme : lightTheme;
  const setPreference = async (value: ThemePreference) => {
    setPreferenceState(value);
    try {
      await AsyncStorage.setItem(KEY, value);
    } catch {
      return;
    }
  };
  const context = useMemo(
    () => ({ theme, preference, resolved, ready, setPreference }),
    [theme, preference, resolved, ready],
  );
  return <Context.Provider value={context}>{children}</Context.Provider>;
}
export function useAppTheme() {
  const value = useContext(Context);
  if (!value) throw new Error("AppThemeProvider is missing");
  return value;
}
export function useThemeStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: ThemeTokens) => T,
) {
  const { theme } = useAppTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [factory, theme]);
}
