import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import { radius, type ThemeTokens, useThemeStyles } from "@/src/theme";

export function SettingsAction({ onPress }: { onPress?: () => void }) {
  const s = useThemeStyles(styles);
  const openAppearance = () =>
    router.push({
      pathname: "/(tabs)/profile",
      params: { section: "appearance" },
    });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open appearance settings"
      hitSlop={8}
      onPress={onPress ?? openAppearance}
      style={({ pressed }) => [s.button, pressed && s.pressed]}
    >
      <Text style={s.icon}>⚙</Text>
    </Pressable>
  );
}

const styles = (t: ThemeTokens) => ({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.cardBorder,
  },
  icon: { color: t.primary, fontSize: 19, fontWeight: "900" as const },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
});
