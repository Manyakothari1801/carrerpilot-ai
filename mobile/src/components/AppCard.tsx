import type { PropsWithChildren } from "react";
import { Text, View, type ViewStyle } from "react-native";
import {
  radius,
  spacing,
  type,
  type ThemeTokens,
  useThemeStyles,
} from "@/src/theme";
export function AppCard({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  const s = useThemeStyles(styles);
  return <View style={[s.card, style]}>{children}</View>;
}
export function SectionHeader({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow?: string;
}) {
  const s = useThemeStyles(styles);
  return (
    <View style={s.header}>
      {eyebrow && <Text style={s.eyebrow}>{eyebrow}</Text>}
      <Text style={s.title}>{title}</Text>
    </View>
  );
}
export function IconBadge({ symbol }: { symbol: string }) {
  const s = useThemeStyles(styles);
  return (
    <View style={s.icon}>
      <Text style={s.iconText}>{symbol}</Text>
    </View>
  );
}
export function ProgressBar({ value }: { value: number }) {
  const s = useThemeStyles(styles);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
      style={s.track}
    >
      <View
        style={[s.fill, { width: `${Math.max(0, Math.min(100, value))}%` }]}
      />
    </View>
  );
}
const styles = (t: ThemeTokens) => ({
  card: {
    backgroundColor: t.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: spacing.lg,
    shadowColor: t.shadowColor,
    shadowOpacity: t.mode === "light" ? 0.1 : 0,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: t.cardElevation,
  },
  header: { marginBottom: spacing.md },
  eyebrow: {
    fontSize: type.caption,
    fontWeight: "900" as const,
    letterSpacing: 1.3,
    textTransform: "uppercase" as const,
    color: t.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: type.section,
    fontWeight: "900" as const,
    color: t.textPrimary,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: t.accentSurface,
    borderWidth: 1,
    borderColor: t.strongBorder,
  },
  iconText: { fontSize: 18, fontWeight: "900" as const, color: t.primary },
  track: {
    height: 8,
    backgroundColor: t.backgroundAlt,
    borderRadius: radius.pill,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: t.cardBorder,
  },
  fill: {
    height: "100%" as const,
    backgroundColor: t.primary,
    borderRadius: radius.pill,
  },
});
