import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { apiErrorMessage } from "@/src/api/client";
import { careerRecommendationService } from "@/src/careerRecommendation/careerRecommendationService";
import type {
  CareerRecommendationDetail,
  CareerRecommendationReadiness,
  CareerRecommendationSummary,
} from "@/src/careerRecommendation/careerRecommendationTypes";
import { AppCard, ProgressBar, SectionHeader } from "@/src/components/AppCard";
import { useFeedback } from "@/src/components/Feedback";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Screen } from "@/src/components/Screen";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { SettingsAction } from "@/src/components/SettingsAction";
import {
  radius,
  spacing,
  type,
  type ThemeTokens,
  useAppTheme,
  useThemeStyles,
} from "@/src/theme";
import {
  formatModelConfidence,
  modelConfidencePercent,
} from "@/src/utils/scoreFormat";
export default function Careers() {
  const s = useThemeStyles(styles),
    { theme } = useAppTheme(),
    { show } = useFeedback(),
    [readiness, setReadiness] = useState<CareerRecommendationReadiness | null>(
      null,
    ),
    [current, setCurrent] = useState<CareerRecommendationDetail | null>(null),
    [history, setHistory] = useState<CareerRecommendationSummary[]>([]),
    [loading, setLoading] = useState(true),
    [generating, setGenerating] = useState(false),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      const [ready, items] = await Promise.all([
        careerRecommendationService.readiness(),
        careerRecommendationService.history(),
      ]);
      setReadiness(ready);
      setHistory(items);
      setCurrent(
        items[0] ? await careerRecommendationService.get(items[0].id) : null,
      );
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const generate = async () => {
    setGenerating(true);
    try {
      const value = await careerRecommendationService.create();
      setCurrent(value);
      show("New career recommendation generated.", "success");
      await load();
    } catch (e) {
      show(apiErrorMessage(e), "error");
    } finally {
      setGenerating(false);
    }
  };
  if (loading)
    return (
      <Screen style={s.center}>
        <ActivityIndicator color={theme.primary} />
        <Text style={s.muted}>Reviewing your career evidence…</Text>
      </Screen>
    );
  return (
    <Screen>
      <ScreenHeader
        eyebrow="CAREER DISCOVERY"
        title="Careers"
        subtitle="Explore ranked directions, simulate profile changes, and turn one path into a plan."
        trailing={<SettingsAction />}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Pressable
        style={({ pressed }) => [s.twinHero, pressed && s.pressed]}
        onPress={() => router.push("/career-twin")}
      >
        <View style={s.twinIcon}>
          <Text style={s.toolIcon}>◇</Text>
        </View>
        <View style={s.itemCopy}>
          <Text style={s.heroLabel}>CAREERTWIN AI</Text>
          <Text style={s.toolTitle}>Preview profile changes</Text>
          <Text style={s.itemMeta}>
            Run a safe what-if simulation before changing your real profile.
          </Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </Pressable>
      {current?.recommendations[0] ? (
        <AppCard style={s.hero}>
          <Text style={s.heroLabel}>TOP RECOMMENDATION</Text>
          <Text style={s.heroTitle}>{current.recommendations[0].career}</Text>
          <View style={s.scoreLine}>
            <Text style={s.confidence}>Model confidence</Text>
            <Text style={s.confidenceValue}>
              {formatModelConfidence(current.recommendations[0].confidence)}
            </Text>
          </View>
          <ProgressBar
            value={modelConfidencePercent(
              current.recommendations[0].confidence,
            )}
          />
          <Text style={s.disclaimer}>
            This classifier confidence ranks career archetypes from your profile
            evidence. It is not a career-success or employment probability.
          </Text>
          <PrimaryButton
            title="Build Career Plan"
            onPress={() =>
              router.push({
                pathname: "/career-plan",
                params: {
                  recommendationId: current.id,
                  career: current.recommendations[0].career,
                },
              })
            }
          />
        </AppCard>
      ) : (
        <AppCard>
          <Text style={s.cardTitle}>No recommendation yet</Text>
          <Text style={s.body}>
            {readiness?.ready
              ? "Your profile is ready for the deterministic ML recommendation service."
              : `Complete: ${readiness?.missingFields.join(", ") || "required profile evidence"}.`}
          </Text>
          <PrimaryButton
            title="Generate Recommendation"
            loading={generating}
            disabled={!readiness?.ready}
            onPress={() => void generate()}
          />
        </AppCard>
      )}
      {current ? (
        <>
          <SectionHeader eyebrow="Ranked paths" title="Best profile matches" />
          <View style={s.list}>
            {current.recommendations.slice(0, 3).map((item) => (
              <AppCard key={item.rank}>
                <View style={s.between}>
                  <View style={s.rank}>
                    <Text style={s.rankText}>{item.rank}</Text>
                  </View>
                  <View style={s.itemCopy}>
                    <Text style={s.itemTitle}>{item.career}</Text>
                    <Text style={s.itemMeta}>
                      {item.profileSignals.slice(0, 2).join(" · ")}
                    </Text>
                  </View>
                  <View style={s.scoreBox}>
                    <Text style={s.itemScore}>
                      {formatModelConfidence(item.confidence)}
                    </Text>
                    <Text style={s.scoreCaption}>confidence</Text>
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        </>
      ) : null}
      <SectionHeader eyebrow="Career tools" title="Explore and prepare" />
      <View style={s.tools}>
        <Tool
          symbol="↗"
          title="Career Plan"
          copy="Track a chosen roadmap"
          route="/career-plan"
          styles={s}
        />
        <Tool
          symbol="◎"
          title="Job Match"
          copy="Compare resume and job evidence"
          route="/job-match"
          styles={s}
        />
      </View>
      {history.length > 1 ? (
        <>
          <SectionHeader eyebrow="Recent runs" title="Recommendation history" />
          <AppCard>
            {history.slice(0, 4).map((item, index) => (
              <Pressable
                key={item.id}
                style={[
                  s.history,
                  index < history.slice(0, 4).length - 1 && s.historyBorder,
                ]}
                onPress={() =>
                  void careerRecommendationService.get(item.id).then(setCurrent)
                }
              >
                <View style={s.itemCopy}>
                  <Text style={s.historyTitle}>{item.topCareer}</Text>
                  <Text style={s.itemMeta}>
                    {new Date(item.createdAt).toLocaleDateString()} ·{" "}
                    {item.modelVersion}
                  </Text>
                </View>
                <Text style={s.itemScore}>
                  {formatModelConfidence(item.topConfidence)}
                </Text>
              </Pressable>
            ))}
          </AppCard>
        </>
      ) : null}
    </Screen>
  );
}
function Tool({
  symbol,
  title,
  copy,
  route,
  styles: s,
}: {
  symbol: string;
  title: string;
  copy: string;
  route: string;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.tool, pressed && s.pressed]}
      onPress={() => router.push(route as never)}
    >
      <Text style={s.toolIcon}>{symbol}</Text>
      <View style={s.itemCopy}>
        <Text style={s.toolTitle}>{title}</Text>
        <Text style={s.itemMeta}>{copy}</Text>
      </View>
      <Text style={s.arrow}>›</Text>
    </Pressable>
  );
}
const styles = (t: ThemeTokens) => ({
  center: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: spacing.md,
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
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  muted: { color: t.textMuted },
  error: {
    color: t.error,
    backgroundColor: t.errorSurface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  twinHero: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    backgroundColor: t.accentSurface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: t.primaryPressed,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  twinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: t.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  hero: {
    backgroundColor: t.accentSurface,
    borderColor: t.primaryPressed,
    gap: spacing.md,
  },
  heroLabel: {
    color: t.primary,
    fontSize: 10,
    fontWeight: "900" as const,
    letterSpacing: 1.3,
  },
  heroTitle: { color: t.textPrimary, fontSize: 25, fontWeight: "900" as const },
  scoreLine: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  confidence: { color: t.textSecondary, fontWeight: "700" as const },
  confidenceValue: {
    color: t.primary,
    fontSize: 20,
    fontWeight: "900" as const,
  },
  disclaimer: { color: t.textMuted, fontSize: type.caption, lineHeight: 17 },
  cardTitle: { color: t.textPrimary, fontSize: 18, fontWeight: "900" as const },
  body: { color: t.textSecondary, lineHeight: 21, marginVertical: spacing.md },
  list: { gap: spacing.sm },
  between: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: t.accentSurface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  rankText: { color: t.primary, fontWeight: "900" as const },
  itemCopy: { flex: 1 },
  itemTitle: { color: t.textPrimary, fontWeight: "900" as const },
  itemMeta: {
    color: t.textMuted,
    fontSize: type.caption,
    lineHeight: 17,
    marginTop: 3,
  },
  scoreBox: { alignItems: "flex-end" as const },
  itemScore: { color: t.primary, fontWeight: "900" as const },
  scoreCaption: { color: t.textMuted, fontSize: 9, marginTop: 2 },
  tools: { gap: spacing.sm },
  tool: {
    minHeight: 72,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    backgroundColor: t.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: t.cardBorder,
  },
  toolIcon: {
    width: 36,
    color: t.primary,
    fontSize: 25,
    textAlign: "center" as const,
  },
  toolTitle: { color: t.textPrimary, fontWeight: "900" as const },
  arrow: { color: t.textMuted, fontSize: 27 },
  pressed: { opacity: 0.72 },
  history: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: t.cardBorder },
  historyTitle: { color: t.textPrimary, fontWeight: "800" as const },
});
