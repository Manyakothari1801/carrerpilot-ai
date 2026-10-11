import { Redirect, Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthContext";
import { useAppTheme } from "@/src/theme";

const icon = (symbol: string, color: ColorValue) => (
  <Text style={{ color, fontSize: 20, fontWeight: "900" }}>{symbol}</Text>
);

export default function Layout() {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 9, fontWeight: "700", marginTop: 0 },
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(6, insets.bottom),
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 1,
          elevation: theme.cardElevation,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => icon("⌂", color) }}
      />
      <Tabs.Screen
        name="resume"
        options={{
          title: "Resume",
          tabBarIcon: ({ color }) => icon("▤", color),
        }}
      />
      <Tabs.Screen
        name="careers"
        options={{
          title: "Careers",
          tabBarIcon: ({ color }) => icon("◇", color),
        }}
      />
      <Tabs.Screen
        name="assessments"
        options={{
          title: "Assessments",
          tabBarIcon: ({ color }) => icon("✓", color),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => icon("●", color),
        }}
      />
    </Tabs>
  );
}
