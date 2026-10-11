import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { apiErrorMessage } from "@/src/api/client";
import {
  AppCard,
  IconBadge,
  ProgressBar,
  SectionHeader,
} from "@/src/components/AppCard";
import { useFeedback } from "@/src/components/Feedback";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Screen } from "@/src/components/Screen";
import { SettingsAction } from "@/src/components/SettingsAction";
import { resumeService } from "@/src/resume/resumeService";
import type {
  AnalysisDetail,
  AnalysisFinding,
  ResumeSummary,
} from "@/src/resume/resumeTypes";
import { formatResumeScore } from "@/src/utils/scoreFormat";
import {
  radius,
  spacing,
  type,
  type ThemeTokens,
  useAppTheme,
  useThemeStyles,
} from "@/src/theme";
const PDF = "application/pdf",
  DOCX =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  MAX_BYTES = 5 * 1024 * 1024;
export default function ResumeScreen() {
  const s = useThemeStyles(styles),
    { theme } = useAppTheme(),
    { show } = useFeedback(),
    [resumes, setResumes] = useState<ResumeSummary[]>([]),
    [analysis, setAnalysis] = useState<AnalysisDetail | null>(null),
    [loading, setLoading] = useState(true),
    [uploading, setUploading] = useState(false),
    [analyzing, setAnalyzing] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(""),
    active = resumes.find((v) => v.active) ?? null;
  const load = useCallback(async () => {
    setError("");
    try {
      const values = await resumeService.list();
      setResumes(values);
      const current = values.find((v) => v.active);
      if (!current) {
        setAnalysis(null);
        return;
      }
      const history = await resumeService.history(current.id);
      setAnalysis(
        history[0]
          ? await resumeService.analysis(current.id, history[0].id)
          : null,
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
  const pick = async () => {
    setError("");
    const result = await DocumentPicker.getDocumentAsync({
      type: [PDF, DOCX],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0],
      extension = asset.name.toLowerCase().split(".").pop(),
      mime =
        asset.mimeType ??
        (extension === "pdf" ? PDF : extension === "docx" ? DOCX : "");
    if (
      !["pdf", "docx"].includes(extension ?? "") ||
      ![PDF, DOCX].includes(mime)
    ) {
      show("Choose a valid PDF or DOCX resume.", "error");
      return;
    }
    if (!asset.size || asset.size > MAX_BYTES) {
      show(
        asset.size
          ? "Resume exceeds the 5 MB upload limit."
          : "The selected file is empty.",
        "error",
      );
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      let uploaded = await resumeService.upload(
        { ...asset, mimeType: mime },
        setProgress,
      );
      if (active && !uploaded.active)
        uploaded = await resumeService.activate(uploaded.id);
      show("Resume uploaded and parsed successfully.", "success");
      await load();
    } catch (e) {
      show(apiErrorMessage(e), "error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  const run = async () => {
    if (!active) return;
    setAnalyzing(true);
    try {
      const value = await resumeService.analyze(active.id);
      setAnalysis(value);
      show(
        `Resume analysis complete — ATS score ${value.atsScore}/100.`,
        "success",
      );
    } catch (e) {
      show(apiErrorMessage(e), "error");
    } finally {
      setAnalyzing(false);
    }
  };
  const remove = (resume: ResumeSummary) =>
    Alert.alert("Resume actions", resume.originalFilename, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete resume",
        style: "destructive",
        onPress: () =>
          void resumeService
            .remove(resume.id)
            .then(() => {
              show("Resume deleted.", "success");
              return load();
            })
            .catch((e) => show(apiErrorMessage(e), "error")),
      },
    ]);
  if (loading)
    return (
      <Screen style={s.center}>
        <ActivityIndicator color={theme.primary} />
        <Text style={s.muted}>Preparing your resume workspace…</Text>
      </Screen>
    );
  return (
    <Screen>
      <View style={s.hero}>
        <View>
          <Text style={s.eyebrow}>DOCUMENT INTELLIGENCE</Text>
          <Text style={s.title}>Resume</Text>
        </View>
        <View style={s.heroActions}>
          {active ? (
            <Pressable
              accessibilityLabel="Resume actions"
              onPress={() => remove(active)}
              style={s.overflow}
            >
              <Text style={s.overflowText}>•••</Text>
            </Pressable>
          ) : null}
          <SettingsAction />
        </View>
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
      {!active ? (
        <Empty onUpload={() => void pick()} uploading={uploading} />
      ) : (
        <>
          <AppCard style={s.resume}>
            <View style={s.resumeTop}>
              <IconBadge symbol="▤" />
              <View style={s.resumeCopy}>
                <Text numberOfLines={1} style={s.filename}>
                  {active.originalFilename}
                </Text>
                <Text style={s.meta}>
                  {formatBytes(active.fileSize)} ·{" "}
                  {friendlyStatus(active.parseStatus)}
                </Text>
              </View>
              <Text style={s.active}>ACTIVE</Text>
            </View>
            {analysis ? (
              <View style={s.scoreRow}>
                <View style={s.scoreTile}>
                  <Text style={s.scoreLabel}>ATS SCORE</Text>
                  <Text style={s.score}>
                    {formatResumeScore(analysis.atsScore)}
                  </Text>
                  <ProgressBar value={analysis.atsScore} />
                </View>
                <View style={s.scoreTile}>
                  <Text style={s.scoreLabel}>OVERALL</Text>
                  <Text style={s.score}>
                    {formatResumeScore(analysis.overallScore)}
                  </Text>
                  <ProgressBar value={analysis.overallScore} />
                </View>
              </View>
            ) : null}
            <PrimaryButton
              title="Upload / Replace Resume"
              loading={uploading}
              onPress={() => void pick()}
            />
            {uploading ? <ProgressBar value={progress} /> : null}
          </AppCard>
          <AppCard style={s.action}>
            <Text style={s.cardTitle}>
              {analysis ? "Latest analysis" : "Ready for analysis"}
            </Text>
            <Text style={s.body}>
              {analysis
                ? `${new Date(analysis.createdAt).toLocaleDateString()} · ${analysis.status}`
                : "Run an explainable ATS review. Optional AI coaching never changes the ATS score."}
            </Text>
            <PrimaryButton
              title={analysis ? "Run New Analysis" : "Run Resume Analysis"}
              loading={analyzing}
              disabled={active.parseStatus !== "PARSED"}
              onPress={() => void run()}
            />
          </AppCard>
          {analysis ? <Summary value={analysis} styles={s} /> : null}
          {resumes.length > 1 ? (
            <>
              <SectionHeader eyebrow="Library" title="Other resumes" />
              {resumes
                .filter((v) => !v.active)
                .map((v) => (
                  <Pressable
                    key={v.id}
                    style={s.library}
                    onPress={() =>
                      void resumeService
                        .activate(v.id)
                        .then(load)
                        .catch((e) => show(apiErrorMessage(e), "error"))
                    }
                  >
                    <View style={s.resumeCopy}>
                      <Text numberOfLines={1} style={s.libraryName}>
                        {v.originalFilename}
                      </Text>
                      <Text style={s.meta}>
                        {formatBytes(v.fileSize)} · Tap to activate
                      </Text>
                    </View>
                    <Pressable hitSlop={8} onPress={() => remove(v)}>
                      <Text style={s.more}>•••</Text>
                    </Pressable>
                  </Pressable>
                ))}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}
function Summary({
  value,
  styles: s,
}: {
  value: AnalysisDetail;
  styles: ReturnType<typeof styles>;
}) {
  const priorities = value.findings
      .filter((f) => !f.aiGenerated && f.type !== "STRENGTH")
      .slice(0, 3),
    strengths = value.findings.filter((f) => f.type === "STRENGTH").slice(0, 3);
  return (
    <>
      <SectionHeader eyebrow="Latest result" title="At a glance" />
      <AppCard>
        <Text style={s.cardTitle}>Score breakdown</Text>
        {[
          ["Sections", value.sectionScore],
          ["Keywords", value.keywordScore],
          ["Action verbs", value.actionVerbScore],
          ["Quantification", value.quantificationScore],
          ["Readability", value.readabilityScore],
        ].map(([name, score]) => (
          <View style={s.metric} key={String(name)}>
            <View style={s.between}>
              <Text style={s.metricName}>{name}</Text>
              <Text style={s.metricValue}>{score}%</Text>
            </View>
            <ProgressBar value={Number(score)} />
          </View>
        ))}
      </AppCard>
      <Compact
        title="Top strengths"
        values={strengths}
        empty="No explicit strengths were stored."
        styles={s}
      />
      <Compact
        title="Improvement priorities"
        values={priorities}
        empty="No priority findings were stored."
        styles={s}
      />
      <View style={s.buttons}>
        <PrimaryButton
          title="View Full Report"
          onPress={() =>
            router.push({
              pathname: "/resume-analysis",
              params: { resumeId: value.resumeId, analysisId: value.id },
            })
          }
        />
      </View>
    </>
  );
}
function Compact({
  title,
  values,
  empty,
  styles: s,
}: {
  title: string;
  values: AnalysisFinding[];
  empty: string;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <AppCard style={s.compact}>
      <Text style={s.cardTitle}>{title}</Text>
      {values.length ? (
        values.map((v) => (
          <View key={v.id} style={s.point}>
            <View style={s.pointDot} />
            <Text style={s.pointText}>{v.title}</Text>
          </View>
        ))
      ) : (
        <Text style={s.mutedLeft}>{empty}</Text>
      )}
    </AppCard>
  );
}
function Empty({
  onUpload,
  uploading,
}: {
  onUpload(): void;
  uploading: boolean;
}) {
  const s = useThemeStyles(styles);
  return (
    <View style={s.empty}>
      <IconBadge symbol="▤" />
      <Text style={s.emptyTitle}>Upload your resume</Text>
      <Text style={s.muted}>
        Add a PDF or DOCX to unlock deterministic ATS analysis and optional AI
        writing guidance.
      </Text>
      <PrimaryButton
        title="Choose Resume"
        loading={uploading}
        onPress={onUpload}
      />
    </View>
  );
}
function friendlyStatus(value: string) {
  return value === "PARSED"
    ? "Ready"
    : value === "FAILED"
      ? "Needs attention"
      : "Processing";
}
function formatBytes(value: number) {
  return value < 1024 * 1024
    ? `${Math.round(value / 1024)} KB`
    : `${(value / 1024 / 1024).toFixed(1)} MB`;
}
const styles = (t: ThemeTokens) => ({
  center: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: spacing.md,
  },
  muted: { color: t.textMuted, textAlign: "center" as const, lineHeight: 21 },
  mutedLeft: { color: t.textMuted, lineHeight: 21, marginTop: spacing.md },
  hero: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: spacing.xl,
  },
  heroActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
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
  overflow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: t.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: t.cardBorder,
  },
  overflowText: {
    color: t.textSecondary,
    fontWeight: "900" as const,
    letterSpacing: 2,
  },
  error: {
    color: t.error,
    backgroundColor: t.errorSurface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  resume: { marginBottom: spacing.md },
  resumeTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
  },
  resumeCopy: { flex: 1 },
  filename: { color: t.textPrimary, fontWeight: "900" as const, fontSize: 16 },
  meta: { color: t.textMuted, fontSize: type.caption, marginTop: 4 },
  active: { color: t.success, fontSize: 10, fontWeight: "900" as const },
  scoreRow: {
    flexDirection: "row" as const,
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  scoreTile: {
    flex: 1,
    gap: spacing.sm,
    backgroundColor: t.accentSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: t.primaryPressed,
    padding: spacing.md,
  },
  scoreLabel: { color: t.textMuted, fontSize: 10, fontWeight: "900" as const },
  score: {
    color: t.primary,
    fontSize: 23,
    fontWeight: "900" as const,
    marginTop: 4,
  },
  action: { gap: spacing.md },
  cardTitle: { color: t.textPrimary, fontWeight: "900" as const, fontSize: 16 },
  body: { color: t.textSecondary, lineHeight: 21 },
  metric: { marginTop: spacing.lg, gap: spacing.sm },
  between: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  metricName: { color: t.textSecondary, fontWeight: "700" as const },
  metricValue: { color: t.primary, fontWeight: "900" as const },
  compact: { marginTop: spacing.md },
  point: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pointDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: t.primary,
  },
  pointText: { color: t.textSecondary, flex: 1 },
  buttons: { gap: spacing.sm, marginVertical: spacing.xl },
  library: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: t.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  libraryName: { color: t.textPrimary, fontWeight: "800" as const },
  more: { color: t.textMuted, fontWeight: "900" as const, padding: spacing.sm },
  empty: {
    alignItems: "center" as const,
    gap: spacing.lg,
    backgroundColor: t.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: t.cardBorder,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    color: t.textPrimary,
    fontWeight: "900" as const,
    fontSize: 23,
  },
});
