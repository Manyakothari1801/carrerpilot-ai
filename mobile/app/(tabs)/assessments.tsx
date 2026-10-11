import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { apiErrorMessage } from "@/src/api/client";
import { assessmentService } from "@/src/assessments/assessmentService";
import type {
  AssessmentSummary,
  AttemptSummary,
  ScheduledExam,
} from "@/src/assessments/assessmentTypes";
import { formatDateTime, humanize } from "@/src/assessments/assessmentUtils";
import { AppCard } from "@/src/components/AppCard";
import { CosmoCompanion } from "@/src/components/CosmoCompanion";
import { PrimaryButton, SecondaryButton } from "@/src/components/PrimaryButton";
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
type Section = "upcoming" | "available" | "history";
const webBase = process.env.EXPO_PUBLIC_WEB_APP_URL?.trim().replace(/\/+$/, "");
export default function Assessments() {
  const s = useThemeStyles(styles),
    { theme } = useAppTheme(),
    [section, setSection] = useState<Section>("upcoming"),
    [catalog, setCatalog] = useState<AssessmentSummary[]>([]),
    [schedules, setSchedules] = useState<ScheduledExam[]>([]),
    [history, setHistory] = useState<AttemptSummary[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [a, b, c] = await Promise.allSettled([
      assessmentService.catalog(),
      assessmentService.schedules(),
      assessmentService.history(),
    ]);
    if (a.status === "fulfilled") setCatalog(a.value);
    if (b.status === "fulfilled") setSchedules(b.value);
    if (c.status === "fulfilled") setHistory(c.value);
    const failed = [a, b, c].find((item) => item.status === "rejected");
    if (failed?.status === "rejected") setError(apiErrorMessage(failed.reason));
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const active = useMemo(
    () =>
      schedules
        .filter((item) => !["CANCELLED", "COMPLETED"].includes(item.state))
        .sort(
          (a, b) =>
            new Date(a.scheduledStart).getTime() -
            new Date(b.scheduledStart).getTime(),
        ),
    [schedules],
  );
  const counts: Record<Section, number> = {
    upcoming: active.length,
    available: catalog.length,
    history: history.length,
  };
  const openWeb = async () => {
    if (!webBase) {
      setError(
        "Set EXPO_PUBLIC_WEB_APP_URL to your Career Guidance AI web address first.",
      );
      return;
    }
    await WebBrowser.openBrowserAsync(`${webBase}/student/scheduled-exams`);
  };
  const cancel = (item: ScheduledExam) =>
    Alert.alert(
      "Cancel scheduled assessment?",
      `${item.assessmentTitle} will remain in your history.`,
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Cancel assessment",
          style: "destructive",
          onPress: () =>
            void (async () => {
              setBusy(item.id);
              setError("");
              try {
                const next = await assessmentService.cancel(item.id);
                setSchedules((values) =>
                  values.map((value) => (value.id === next.id ? next : value)),
                );
              } catch (e) {
                setError(apiErrorMessage(e));
              } finally {
                setBusy("");
              }
            })(),
        },
      ],
    );
  if (loading)
    return (
      <Screen style={s.center}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={s.muted}>Loading assessments…</Text>
      </Screen>
    );
  return (
    <Screen>
      <ScreenHeader
        eyebrow="ASSESSMENT COMPANION"
        title="Plan here. Perform on web."
        subtitle="Browse and schedule assessments on mobile. Secure assessment attempts remain web-only."
        trailing={<SettingsAction />}
      />
      <View style={s.tabs}>
        {(["upcoming", "available", "history"] as Section[]).map((value) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: section === value }}
            key={value}
            onPress={() => setSection(value)}
            style={[s.tab, section === value && s.tabActive]}
          >
            <Text style={[s.tabText, section === value && s.tabTextActive]}>
              {humanize(value)}
            </Text>
            <Text style={[s.tabCount, section === value && s.tabCountActive]}>
              {counts[value]}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? (
        <View style={s.errorBox}>
          <Text style={s.error}>{error}</Text>
          <Pressable onPress={() => void load()}>
            <Text style={s.retry}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      {section === "upcoming" && (
        <View style={s.list}>
          {active.length ? (
            active.map((item) => (
              <ScheduleCard
                key={item.id}
                item={item}
                busy={busy === item.id}
                openWeb={openWeb}
                cancel={cancel}
                styles={s}
              />
            ))
          ) : (
            <Empty
              title="Nothing scheduled"
              copy="Choose an assessment and a future time from Available."
              styles={s}
            />
          )}
        </View>
      )}
      {section === "available" && (
        <View style={s.list}>
          {catalog.length ? (
            catalog.map((item) => (
              <CatalogCard key={item.id} item={item} styles={s} />
            ))
          ) : (
            <Empty
              title="No assessments available"
              copy="The assessment catalog is currently empty."
              styles={s}
            />
          )}
        </View>
      )}
      {section === "history" && (
        <View style={s.list}>
          {history.length ? (
            history.map((item) => (
              <HistoryCard key={item.id} item={item} styles={s} />
            ))
          ) : (
            <Empty
              title="No attempt history"
              copy="Completed web attempts will appear here."
              styles={s}
            />
          )}
        </View>
      )}
      <Text style={s.boundary}>
        Questions, timers, answers, grading, and submissions are intentionally
        available only in the web assessment experience.
      </Text>
    </Screen>
  );
}
function ScheduleCard({
  item,
  busy,
  openWeb,
  cancel,
  styles: s,
}: {
  item: ScheduledExam;
  busy: boolean;
  openWeb: () => Promise<void>;
  cancel: (item: ScheduledExam) => void;
  styles: ReturnType<typeof styles>;
}) {
  const canOpen = item.canStart || item.state === "IN_PROGRESS";
  return (
    <AppCard>
      <View style={s.between}>
        <Text style={s.cardTitle}>{item.assessmentTitle}</Text>
        <Text
          style={[
            s.status,
            item.state === "AVAILABLE" || item.state === "IN_PROGRESS"
              ? s.statusGood
              : item.state === "MISSED"
                ? s.statusBad
                : s.statusNeutral,
          ]}
        >
          {humanize(item.state)}
        </Text>
      </View>
      <Text style={s.date}>{formatDateTime(item.scheduledStart)}</Text>
      <Text style={s.meta}>
        {humanize(item.difficulty)} · {item.durationMinutes} min ·{" "}
        {item.totalQuestions} questions
      </Text>
      {item.rescheduleCount > 0 ? (
        <Text style={s.small}>
          Rescheduled {item.rescheduleCount} time
          {item.rescheduleCount === 1 ? "" : "s"}
        </Text>
      ) : null}
      <View style={s.actions}>
        {canOpen ? (
          <PrimaryButton
            title="Take Assessment on Web"
            onPress={() => void openWeb()}
          />
        ) : null}
        {item.canReschedule ? (
          <SecondaryButton
            title="Reschedule"
            onPress={() =>
              router.push({
                pathname: "/schedule-assessment",
                params: {
                  scheduleId: item.id,
                  assessmentId: item.assessmentId,
                  title: item.assessmentTitle,
                  currentStart: item.scheduledStart,
                },
              } as never)
            }
          />
        ) : null}
        {item.canCancel ? (
          <SecondaryButton
            title={busy ? "Cancelling…" : "Cancel"}
            danger
            onPress={() => cancel(item)}
          />
        ) : null}
      </View>
      {item.state === "MISSED" ? (
        <Text style={s.small}>
          This assessment window has closed. Schedule a new attempt from
          Available.
        </Text>
      ) : null}
    </AppCard>
  );
}
function CatalogCard({
  item,
  styles: s,
}: {
  item: AssessmentSummary;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <AppCard>
      <View style={s.between}>
        <Text style={s.cardTitle}>{item.title}</Text>
        <Text style={s.badge}>{humanize(item.difficulty)}</Text>
      </View>
      <Text style={s.copy}>{item.description}</Text>
      <Text style={s.meta}>
        {humanize(item.assessmentType)} · {item.durationMinutes} min ·{" "}
        {item.totalQuestions} questions
      </Text>
      <Text style={s.small}>
        Pass mark: {item.passingPercentage}%
        {item.targetRole ? ` · ${item.targetRole}` : ""}
      </Text>
      <View style={s.actions}>
        <PrimaryButton
          title="Schedule Assessment"
          onPress={() =>
            router.push({
              pathname: "/schedule-assessment",
              params: { assessmentId: item.id, title: item.title },
            } as never)
          }
        />
      </View>
    </AppCard>
  );
}
function HistoryCard({
  item,
  styles: s,
}: {
  item: AttemptSummary;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <AppCard>
      <View style={s.between}>
        <Text style={s.cardTitle}>{item.assessmentTitle}</Text>
        <Text style={[s.score, item.passed === false && s.scoreFail]}>
          {item.scorePercentage == null
            ? humanize(item.status)
            : `${item.scorePercentage}%`}
        </Text>
      </View>
      <Text style={s.meta}>Started {formatDateTime(item.startedAt)}</Text>
      {item.submittedAt ? (
        <Text style={s.small}>
          Submitted {formatDateTime(item.submittedAt)}
        </Text>
      ) : null}
      {item.scorePercentage != null ? (
        <Text style={s.small}>
          {item.passed ? "Passed" : "Not passed"} · Server-graded result
        </Text>
      ) : (
        <Text style={s.small}>
          Continue this attempt from the web assessment experience.
        </Text>
      )}
    </AppCard>
  );
}
function Empty({
  title,
  copy,
  styles: s,
}: {
  title: string;
  copy: string;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <AppCard style={s.empty}>
      <CosmoCompanion
        message="No pressure—your next assessment step will appear here."
        compact
      />
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.muted}>{copy}</Text>
    </AppCard>
  );
}
const styles = (t: ThemeTokens) => ({
  center: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: spacing.lg,
  },
  eyebrow: {
    color: t.primary,
    fontSize: type.caption,
    fontWeight: "900" as const,
    letterSpacing: 1.4,
  },
  title: {
    color: t.textPrimary,
    fontSize: type.title,
    fontWeight: "900" as const,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  tabs: {
    flexDirection: "row" as const,
    gap: spacing.sm,
    marginBottom: spacing.xl,
    backgroundColor: t.backgroundAlt,
    borderRadius: radius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center" as const,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  tabActive: { borderColor: t.primaryPressed, backgroundColor: t.surface },
  tabText: {
    color: t.textMuted,
    fontWeight: "800" as const,
    fontSize: type.caption,
  },
  tabTextActive: { color: t.primary },
  tabCount: {
    color: t.textMuted,
    fontSize: 9,
    fontWeight: "900" as const,
    marginTop: 3,
  },
  tabCountActive: { color: t.primary },
  list: { gap: spacing.md },
  between: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    gap: spacing.md,
  },
  cardTitle: {
    color: t.textPrimary,
    fontWeight: "900" as const,
    fontSize: 17,
    flex: 1,
  },
  emptyTitle: {
    color: t.textPrimary,
    fontWeight: "900" as const,
    fontSize: 18,
  },
  date: { color: t.primary, fontWeight: "800" as const, marginTop: spacing.md },
  copy: { color: t.textSecondary, lineHeight: 20, marginTop: spacing.md },
  meta: { color: t.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  small: {
    color: t.textMuted,
    fontSize: type.caption,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  status: {
    fontSize: 10,
    fontWeight: "900" as const,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    overflow: "hidden" as const,
  },
  statusGood: { color: t.success, backgroundColor: t.successSurface },
  statusBad: { color: t.error, backgroundColor: t.errorSurface },
  statusNeutral: { color: t.primary, backgroundColor: t.accentSurface },
  badge: { color: t.primary, fontSize: 10, fontWeight: "900" as const },
  score: { color: t.success, fontWeight: "900" as const, fontSize: 20 },
  scoreFail: { color: t.error },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  empty: {
    alignItems: "center" as const,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  muted: { color: t.textMuted, lineHeight: 21, textAlign: "center" as const },
  boundary: {
    color: t.textMuted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center" as const,
    marginVertical: spacing.xxl,
  },
  errorBox: {
    backgroundColor: t.errorSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  error: { color: t.error, lineHeight: 20 },
  retry: {
    color: t.primary,
    fontWeight: "900" as const,
    marginTop: spacing.sm,
  },
});
