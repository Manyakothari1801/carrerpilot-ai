import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { AppCard, ProgressBar, SectionHeader } from "@/src/components/AppCard";
import { CosmoCompanion } from "@/src/components/CosmoCompanion";
import { careerPlanService } from "@/src/careerPlan/careerPlanService";
import type { CareerPlan } from "@/src/careerPlan/careerPlanTypes";
import { useAuth } from "@/src/auth/AuthContext";
import { useProfile } from "@/src/profile/ProfileContext";
import { initials, profileCompletion } from "@/src/profile/profileUtils";
import {
  radius,
  spacing,
  type,
  type ThemeTokens,
  useThemeStyles,
} from "@/src/theme";
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
const quick = [
    ["Resume", "▤", "/(tabs)/resume"],
    ["Careers", "◇", "/(tabs)/careers"],
    ["Assessments", "✓", "/(tabs)/assessments"],
    ["Profile", "●", "/(tabs)/profile"],
  ] as const,
  tools = [
    ["CareerTwin", "◇", "/career-twin"],
    ["AI Interview", "◌", "/career-interview"],
    ["DSA Practice", "⌘", "/(tabs)/assessments"],
    ["Career Plan", "↗", "/career-plan"],
    ["Career Copilot", "✦", "/career-copilot"],
    ["Job Match", "◎", "/job-match"],
  ] as const;
export default function Home() {
  const s = useThemeStyles(styles),
    { user } = useAuth(),
    { profile, skills, loading, error, refresh } = useProfile(),
    [plan, setPlan] = useState<CareerPlan | null | undefined>(undefined),
    completion = profile ? profileCompletion(profile, skills) : 0,
    name = profile?.fullName || user?.fullName || "Student";

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void careerPlanService
        .current()
        .then((value) => active && setPlan(value))
        .catch(() => active && setPlan(undefined));
      return () => {
        active = false;
      };
    }, []),
  );

  const nextRoadmapItem = plan?.roadmap
    .slice()
    .sort((a, b) => a.stageOrder - b.stageOrder || a.itemOrder - b.itemOrder)
    .find((item) => item.status !== "READY");
  const guidance =
    completion < 100
      ? {
          title: "Complete your profile",
          message: `Your profile is ${completion}% complete. Add ${profile?.missingFields[0] || "the next missing profile detail"}.`,
          action: "Continue profile",
          route: "/profile-edit",
        }
      : plan === null
        ? {
            title: "Create your career plan",
            message:
              "Your profile is complete. Choose a recommendation to create a focused career roadmap.",
            action: "Choose career & build plan",
            route: "/(tabs)/careers",
          }
        : plan && nextRoadmapItem
          ? {
              title: `Continue ${plan.selectedCareer} roadmap`,
              message: `Next roadmap activity: ${nextRoadmapItem.nextAction || nextRoadmapItem.topic}`,
              action: "Open next roadmap step",
              route: "/career-plan",
            }
          : plan
            ? {
                title: "Review your career plan",
                message:
                  plan.nextActions[0] ||
                  "Your saved roadmap has no incomplete activity. Review it for your next decision.",
                action: "Review career plan",
                route: "/career-plan",
              }
            : {
                title: "Choose your next career step",
                message:
                  "Your profile is complete. Review your recommendations or open your saved career tools.",
                action: "Explore careers",
                route: "/(tabs)/careers",
              };
  return (
    <Screen>
      <View style={s.top}>
        <View style={s.topCopy}>
          <Text style={s.brand}>CAREER GUIDANCE AI</Text>
          <Text numberOfLines={2} style={s.title}>
            {greeting()}, {name.split(/\s+/)[0]}
          </Text>
          <Text style={s.subtitle}>One focused step at a time.</Text>
        </View>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials(name)}</Text>
        </View>
      </View>
      {profile ? <CosmoCompanion message={guidance.message} /> : null}
      {loading && !profile ? (
        <AppCard style={s.state}>
          <ActivityIndicator color={s.accent.color} />
          <Text style={s.muted}>Preparing your dashboard…</Text>
        </AppCard>
      ) : error && !profile ? (
        <AppCard style={s.state}>
          <Text style={s.error}>{error}</Text>
          <PrimaryButton title="Retry" onPress={() => void refresh()} />
        </AppCard>
      ) : (
        profile && (
          <>
            <AppCard style={s.completion}>
              <View style={s.orb} />
              <View style={s.between}>
                <View style={s.cardCopy}>
                  <Text style={s.cardEyebrow}>PROFILE READINESS</Text>
                  <Text style={s.cardTitle}>{guidance.title}</Text>
                </View>
                <Text style={s.percent}>{completion}%</Text>
              </View>
              <ProgressBar value={completion} />
              <Text style={s.body}>
                {completion < 100
                  ? `${profile.missingFields.length} profile ${profile.missingFields.length === 1 ? "item" : "items"} remaining.`
                  : "Your profile is ready for recommendations, resume intelligence, and planning."}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(guidance.route as never)}
              >
                <Text style={s.cta}>{guidance.action} →</Text>
              </Pressable>
            </AppCard>
            <SectionHeader eyebrow="Shortcuts" title="Quick actions" />
            <View style={s.grid}>
              {quick.map(([title, symbol, route]) => (
                <Action
                  key={title}
                  title={title}
                  symbol={symbol}
                  route={route}
                  styles={s}
                />
              ))}
            </View>
            <SectionHeader eyebrow="Your workspace" title="Career tools" />
            <View style={s.grid}>
              {tools.map(([title, symbol, route]) => (
                <Action
                  key={title}
                  title={title}
                  symbol={symbol}
                  route={route}
                  styles={s}
                />
              ))}
            </View>
          </>
        )
      )}
    </Screen>
  );
}
function Action({
  title,
  symbol,
  route,
  styles: s,
}: {
  title: string;
  symbol: string;
  route: string;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [s.action, pressed && s.pressed]}
      onPress={() => router.push(route as never)}
    >
      <Text style={s.icon}>{symbol}</Text>
      <Text style={s.actionTitle}>{title}</Text>
      <Text style={s.actionArrow}>↗</Text>
    </Pressable>
  );
}
const styles = (t: ThemeTokens) => ({
  top: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  topCopy: { flex: 1 },
  brand: {
    color: t.primary,
    fontSize: type.caption,
    fontWeight: "900" as const,
    letterSpacing: 1.4,
  },
  title: {
    fontSize: type.title,
    fontWeight: "900" as const,
    color: t.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: type.body,
    marginTop: spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: t.accentSurface,
    borderColor: t.primaryPressed,
    borderWidth: 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: { color: t.primary, fontSize: 17, fontWeight: "900" as const },
  state: { alignItems: "center" as const, gap: spacing.lg },
  accent: { color: t.primary },
  muted: { color: t.textMuted },
  error: { color: t.error, textAlign: "center" as const },
  completion: {
    position: "relative" as const,
    overflow: "hidden" as const,
    backgroundColor: t.accentSurface,
    borderColor: t.primaryPressed,
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  orb: {
    position: "absolute" as const,
    right: -26,
    top: -34,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: t.surface,
    borderWidth: 18,
    borderColor: t.primaryPressed,
    opacity: 0.35,
  },
  between: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardCopy: { flex: 1 },
  cardEyebrow: {
    color: t.primary,
    fontSize: type.caption,
    fontWeight: "900" as const,
    letterSpacing: 1.1,
  },
  cardTitle: {
    color: t.textPrimary,
    fontSize: type.subtitle,
    fontWeight: "900" as const,
    marginTop: 4,
  },
  percent: { color: t.primary, fontSize: 28, fontWeight: "900" as const },
  body: {
    color: t.textSecondary,
    fontSize: type.body,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  cta: { color: t.primary, fontWeight: "900" as const, marginTop: spacing.md },
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.md,
  },
  action: {
    width: "48%" as const,
    minHeight: 104,
    backgroundColor: t.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: spacing.lg,
    elevation: t.cardElevation,
    shadowColor: t.shadowColor,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  icon: { color: t.primary, fontSize: 25, fontWeight: "900" as const },
  actionTitle: {
    color: t.textPrimary,
    fontWeight: "800" as const,
    fontSize: type.body,
    marginTop: spacing.md,
  },
  actionArrow: {
    position: "absolute" as const,
    right: spacing.md,
    top: spacing.md,
    color: t.textMuted,
    fontSize: 17,
  },
});
