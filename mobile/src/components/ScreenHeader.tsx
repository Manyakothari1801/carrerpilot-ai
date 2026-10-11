import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { spacing, type ThemeTokens, type, useThemeStyles } from "@/src/theme";

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
  reserveTrailingSpace = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  reserveTrailingSpace?: boolean;
}) {
  const s = useThemeStyles(styles);
  return (
    <View style={s.wrap}>
      <View style={[s.copy, reserveTrailingSpace && s.reserved]}>
        {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <View style={s.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = (t: ThemeTokens) => ({
  wrap: {
    position: "relative" as const,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  copy: { flex: 1, minWidth: 0 },
  reserved: { paddingRight: 56 },
  trailing: {
    marginLeft: spacing.md,
    minWidth: 44,
    alignItems: "flex-end" as const,
  },
  eyebrow: {
    color: t.primary,
    fontSize: type.caption,
    fontWeight: "900" as const,
    letterSpacing: 1.4,
  },
  title: {
    color: t.textPrimary,
    fontSize: type.hero,
    fontWeight: "900" as const,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: type.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});
