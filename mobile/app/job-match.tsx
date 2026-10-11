import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { apiErrorMessage } from "@/src/api/client";
import {
  AppCard,
  IconBadge,
  ProgressBar,
  SectionHeader,
} from "@/src/components/AppCard";
import { FormField } from "@/src/components/FormField";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Screen } from "@/src/components/Screen";
import { jobMatchService } from "@/src/jobMatch/jobMatchService";
import type {
  AlignmentStatus,
  JobMatchDetail,
  JobMatchSkill,
  JobMatchSummary,
} from "@/src/jobMatch/jobMatchTypes";
import { resumeService } from "@/src/resume/resumeService";
import type { ResumeSummary } from "@/src/resume/resumeTypes";
import { careerRecommendationService } from "@/src/careerRecommendation/careerRecommendationService";
import type {
  CareerRecommendationDetail,
  CareerRecommendationReadiness,
  CareerRecommendationSummary,
} from "@/src/careerRecommendation/careerRecommendationTypes";
import {
  radius,
  spacing,
  type,
  type ThemeTokens,
  useAppTheme,
  useThemeStyles,
} from "@/src/theme";

export default function CareersScreen() {
  const s = useThemeStyles(styles),
    { theme } = useAppTheme();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]),
    [history, setHistory] = useState<JobMatchSummary[]>([]),
    [selectedResumeId, setSelectedResumeId] = useState(""),
    [jobTitle, setJobTitle] = useState(""),
    [companyName, setCompanyName] = useState(""),
    [jobDescription, setJobDescription] = useState(""),
    [result, setResult] = useState<JobMatchDetail | null>(null),
    [loading, setLoading] = useState(true),
    [submitting, setSubmitting] = useState(false),
    [openingId, setOpeningId] = useState(""),
    [error, setError] = useState(""),
    [fields, setFields] = useState<Record<string, string>>({});
  const [mlReadiness, setMlReadiness] =
      useState<CareerRecommendationReadiness | null>(null),
    [mlHistory, setMlHistory] = useState<CareerRecommendationSummary[]>([]),
    [mlResult, setMlResult] = useState<CareerRecommendationDetail | null>(null),
    [mlLoading, setMlLoading] = useState(false),
    [mlError, setMlError] = useState("");
  const parsed = resumes.filter((value) => value.parseStatus === "PARSED"),
    selected =
      selectedResumeId ||
      parsed.find((value) => value.active)?.id ||
      parsed[0]?.id ||
      "";
  const load = useCallback(async () => {
    setError("");
    setMlError("");
    const [resumeResult, matchResult, readyResult, recommendationResult] =
      await Promise.allSettled([
        resumeService.list(),
        jobMatchService.history(),
        careerRecommendationService.readiness(),
        careerRecommendationService.history(),
      ]);
    if (resumeResult.status === "fulfilled") {
      const resumeValues = resumeResult.value;
      setResumes(resumeValues);
      setSelectedResumeId((current) =>
        current && resumeValues.some((value) => value.id === current)
          ? current
          : (resumeValues.find(
              (value) => value.active && value.parseStatus === "PARSED",
            )?.id ??
            resumeValues.find((value) => value.parseStatus === "PARSED")?.id ??
            ""),
      );
    } else setError(apiErrorMessage(resumeResult.reason));
    if (matchResult.status === "fulfilled") setHistory(matchResult.value);
    else setError(apiErrorMessage(matchResult.reason));
    if (readyResult.status === "fulfilled") setMlReadiness(readyResult.value);
    else setMlError(apiErrorMessage(readyResult.reason));
    if (recommendationResult.status === "fulfilled")
      setMlHistory(recommendationResult.value);
    else setMlError(apiErrorMessage(recommendationResult.reason));
    setLoading(false);
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const analyze = async () => {
    const next: Record<string, string> = {},
      description = jobDescription.trim(),
      title = jobTitle.trim(),
      company = companyName.trim();
    if (!selected) next.resume = "Select a successfully parsed resume.";
    if (title.length < 2) next.jobTitle = "Enter a job title.";
    if (company.length > 160)
      next.companyName = "Company must be 160 characters or fewer.";
    if (description.length < 100)
      next.jobDescription =
        "Paste at least 100 characters from the job description.";
    if (description.length > 50000)
      next.jobDescription =
        "Job description must be 50,000 characters or fewer.";
    setFields(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    setError("");
    try {
      const value = await jobMatchService.create({
        resumeId: selected,
        jobTitle: title,
        companyName: company || undefined,
        jobDescription: description,
      });
      setResult(value);
      setHistory((current) => [
        value,
        ...current.filter((item) => item.id !== value.id),
      ]);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };
  const open = async (id: string) => {
    setOpeningId(id);
    setError("");
    try {
      setResult(await jobMatchService.get(id));
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setOpeningId("");
    }
  };
  const discover = async () => {
    setMlLoading(true);
    setMlError("");
    try {
      const value = await careerRecommendationService.create();
      setMlResult(value);
      setMlHistory((current) => [
        {
          id: value.id,
          topCareer: value.recommendations[0]?.career ?? "Recommendation",
          topConfidence: value.recommendations[0]?.confidence ?? 0,
          modelVersion: value.modelVersion,
          createdAt: value.createdAt,
        },
        ...current.filter((item) => item.id !== value.id),
      ]);
    } catch (e) {
      setMlError(apiErrorMessage(e));
    } finally {
      setMlLoading(false);
    }
  };
  const openRecommendation = async (id: string) => {
    setMlLoading(true);
    setMlError("");
    try {
      setMlResult(await careerRecommendationService.get(id));
    } catch (e) {
      setMlError(apiErrorMessage(e));
    } finally {
      setMlLoading(false);
    }
  };
  if (loading)
    return (
      <Screen style={s.center}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={s.muted}>Loading career tools…</Text>
      </Screen>
    );
  return (
    <Screen keyboard>
      <View style={s.hero}>
        <Text style={s.eyebrow}>CAREER DISCOVERY</Text>
        <Text style={s.title}>Careers</Text>
        <Text style={s.subtitle}>
          Explore profile-based ML recommendations, then compare a resume with
          a specific job separately.
        </Text>
      </View>
      <CareerRecommendations
        readiness={mlReadiness}
        history={mlHistory}
        result={mlResult}
        loading={mlLoading}
        error={mlError}
        discover={discover}
        open={openRecommendation}
        styles={s}
      />
      <SectionHeader eyebrow="Tool B · deterministic" title="Job Match" />
      <Text style={s.toolIntro}>
        Compare a parsed resume with one job description. These heuristic
        scores are separate from the ML career recommendations above.
      </Text>
      {error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      ) : null}
      {!parsed.length ? (
        <NoResume styles={s} />
      ) : (
        <>
          <SectionHeader eyebrow="Step 1" title="Select resume" />
          <View style={s.resumeList}>
            {parsed.map((resume) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected === resume.id }}
                key={resume.id}
                onPress={() => setSelectedResumeId(resume.id)}
                style={({ pressed }) => [
                  s.resumeChoice,
                  selected === resume.id && s.resumeChoiceActive,
                  pressed && s.pressed,
                ]}
              >
                <View style={s.radio}>
                  {selected === resume.id ? <View style={s.radioDot} /> : null}
                </View>
                <View style={s.resumeInfo}>
                  <Text numberOfLines={1} style={s.resumeName}>
                    {resume.originalFilename}
                  </Text>
                  <Text style={s.resumeMeta}>
                    {resume.active ? "Active resume" : "Parsed resume"}
                  </Text>
                </View>
                {resume.active ? <Text style={s.active}>ACTIVE</Text> : null}
              </Pressable>
            ))}
          </View>
          {fields.resume ? (
            <Text style={s.fieldError}>{fields.resume}</Text>
          ) : null}
          <SectionHeader eyebrow="Step 2" title="Job information" />
          <AppCard style={s.form}>
            <FormField
              label="Job title"
              value={jobTitle}
              maxLength={160}
              onChangeText={setJobTitle}
              placeholder="Backend Developer"
              autoCapitalize="words"
              error={fields.jobTitle}
            />
            <FormField
              label="Company (optional)"
              value={companyName}
              maxLength={160}
              onChangeText={setCompanyName}
              placeholder="Company name"
              autoCapitalize="words"
              error={fields.companyName}
            />
            <FormField
              label="Job description"
              value={jobDescription}
              maxLength={50000}
              onChangeText={setJobDescription}
              placeholder="Paste the complete responsibilities and qualifications…"
              multiline
              numberOfLines={12}
              textAlignVertical="top"
              style={s.descriptionInput}
              autoCapitalize="sentences"
              error={fields.jobDescription}
            />
            <View style={s.countRow}>
              <Text
                style={[
                  s.count,
                  jobDescription.trim().length < 100 && s.countWarning,
                ]}
              >
                {jobDescription.trim().length.toLocaleString()} / 50,000
              </Text>
              <Text style={s.minimum}>100 minimum</Text>
            </View>
            <PrimaryButton
              title="Analyze Match"
              loading={submitting}
              disabled={submitting}
              onPress={() => void analyze()}
            />
            <Text style={s.localNote}>
              All displayed scores come from the backend's deterministic
              matching engine. Gemini is not used.
            </Text>
          </AppCard>
        </>
      )}
      {result ? (
        <MatchResult
          value={result}
          resumeName={
            resumes.find((value) => value.id === result.resumeId)
              ?.originalFilename
          }
          styles={s}
        />
      ) : null}
      <SectionHeader eyebrow="Saved comparisons" title="Match history" />
      {history.length ? (
        <View style={s.history}>
          {history.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => void open(item.id)}
              disabled={openingId === item.id}
              style={({ pressed }) => [s.historyItem, pressed && s.pressed]}
            >
              <View style={s.historyCopy}>
                <Text numberOfLines={1} style={s.historyTitle}>
                  {item.jobTitle}
                </Text>
                <Text numberOfLines={1} style={s.historyMeta}>
                  {item.companyName || "Company not specified"} ·{" "}
                  {formatDate(item.createdAt)}
                </Text>
                <Text numberOfLines={1} style={s.historyResume}>
                  {resumes.find((value) => value.id === item.resumeId)
                    ?.originalFilename || "Saved resume"}
                </Text>
              </View>
              {openingId === item.id ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Text style={s.historyScore}>{item.overallMatchScore}%</Text>
              )}
            </Pressable>
          ))}
        </View>
      ) : (
        <AppCard style={s.historyEmpty}>
          <Text style={s.muted}>
            Your persisted comparisons will appear here after your first match.
          </Text>
        </AppCard>
      )}
    </Screen>
  );
}

function CareerRecommendations({
  readiness,
  history,
  result,
  loading,
  error,
  discover,
  open,
  styles: s,
}: {
  readiness: CareerRecommendationReadiness | null;
  history: CareerRecommendationSummary[];
  result: CareerRecommendationDetail | null;
  loading: boolean;
  error: string;
  discover(): Promise<void>;
  open(id: string): Promise<void>;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <View style={s.mlSection}>
      <SectionHeader
        eyebrow="Tool A · trained model"
        title="ML Career Recommendations"
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/career-plan" as never)}
        style={({ pressed }) => [s.planLink, pressed && s.pressed]}
      >
        <Text style={s.planLinkTitle}>My Career Plan</Text>
        <Text style={s.planLinkCopy}>Open your saved roadmap and readiness →</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/career-twin" as never)}
        style={({ pressed }) => [s.planLink, pressed && s.pressed]}
      >
        <Text style={s.planLinkTitle}>CareerTwin AI</Text>
        <Text style={s.planLinkCopy}>Explain recommendations and explore actionable simulations →</Text>
      </Pressable>
      <AppCard style={s.mlIntro}>
        <Text style={s.mlTitle}>Discover roles from your profile</Text>
        <Text style={s.mlCopy}>
          A trained multiclass model uses your degree, experience level, target
          role, and saved skills. Confidence is a model probability, not a
          guarantee of career success.
        </Text>
        {readiness && !readiness.ready ? (
          <View style={s.notReady}>
            <Text style={s.notReadyTitle}>More profile information needed</Text>
            <Text style={s.mlCopy}>
              Complete: {readiness.missingFields.join(", ")}.
            </Text>
            <PrimaryButton
              title="Complete Profile"
              onPress={() => router.push("/profile-edit")}
            />
          </View>
        ) : (
          <PrimaryButton
            title="Discover Careers"
            loading={loading}
            disabled={loading || !readiness}
            onPress={() => void discover()}
          />
        )}
        {error ? (
          <Text accessibilityRole="alert" style={s.mlError}>
            {error}
          </Text>
        ) : null}
      </AppCard>
      {result ? (
        <View style={s.mlResults}>
          {result.recommendations.map((item) => (
            <AppCard key={`${result.id}-${item.rank}`} style={s.mlCard}>
              <View style={s.mlRankRow}>
                <Text style={s.mlRank}>#{item.rank}</Text>
                <Text style={s.mlCareer}>{item.career}</Text>
                <Text style={s.mlConfidence}>
                  {Math.round(item.confidence * 100)}%
                </Text>
              </View>
              <ProgressBar value={item.confidence * 100} />
              <Text style={s.signalHeading}>PROFILE SIGNALS</Text>
              {item.profileSignals.length ? (
                item.profileSignals.map((signal) => (
                  <Text key={signal} style={s.signal}>
                    • {signal}
                  </Text>
                ))
              ) : (
                <Text style={s.signal}>No matching profile signal supplied.</Text>
              )}
              <PrimaryButton
                title="Build Career Plan"
                onPress={() =>
                  router.push({
                    pathname: "/career-plan",
                    params: { recommendationId: result.id, career: item.career },
                  } as never)
                }
              />
            </AppCard>
          ))}
          <Text style={s.version}>
            Model {result.modelVersion} · Features {result.featureSchemaVersion}
          </Text>
        </View>
      ) : null}
      {history.length ? (
        <View style={s.mlHistory}>
          <Text style={s.smallHeading}>SAVED RECOMMENDATIONS</Text>
          {history.slice(0, 5).map((item) => (
            <Pressable
              key={item.id}
              disabled={loading}
              onPress={() => void open(item.id)}
              style={({ pressed }) => [s.mlHistoryItem, pressed && s.pressed]}
            >
              <View style={s.historyCopy}>
                <Text style={s.historyTitle}>{item.topCareer}</Text>
                <Text style={s.historyMeta}>{formatDate(item.createdAt)}</Text>
              </View>
              <Text style={s.historyScore}>
                {Math.round(item.topConfidence * 100)}%
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function NoResume({ styles: s }: { styles: ReturnType<typeof styles> }) {
  return (
    <View style={s.empty}>
      <IconBadge symbol="CV" />
      <Text style={s.emptyTitle}>No resume available</Text>
      <Text style={s.emptyCopy}>
        Upload and parse a resume before comparing it with a job description.
      </Text>
      <PrimaryButton
        title="Upload Resume"
        onPress={() => router.push("/(tabs)/resume")}
      />
    </View>
  );
}

function MatchResult({
  value,
  resumeName,
  styles: s,
}: {
  value: JobMatchDetail;
  resumeName?: string;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <View style={s.result}>
      <SectionHeader eyebrow="Saved match result" title={value.jobTitle} />
      <AppCard style={s.overall}>
        <Text style={s.company}>
          {value.companyName || "Company not specified"}
        </Text>
        <Text style={s.overallScore}>{value.overallMatchScore}%</Text>
        <Text style={s.overallLabel}>Overall heuristic match</Text>
        <ProgressBar value={value.overallMatchScore} />
        <Text style={s.resumeUsed}>
          Resume: {resumeName || "Saved resume"} · {formatDate(value.createdAt)}
        </Text>
      </AppCard>
      <AppCard style={s.disclaimer}>
        <Text style={s.disclaimerText}>{value.disclaimer}</Text>
      </AppCard>
      <View style={s.scoreGrid}>
        <Score
          label="Skill coverage"
          value={value.skillMatchScore}
          styles={s}
        />
        <Score
          label="TF-IDF keywords"
          value={value.keywordMatchScore}
          styles={s}
        />
        <Score
          label="Semantic"
          value={value.semanticMatchScore}
          status={value.semanticStatus}
          styles={s}
        />
        <Score
          label="Experience"
          value={value.experienceMatchScore}
          status={value.experienceStatus}
          styles={s}
        />
        <Score
          label="Education"
          value={value.educationMatchScore}
          status={value.educationStatus}
          styles={s}
        />
      </View>
      {value.semanticStatus === "UNAVAILABLE" ? (
        <AppCard style={s.semanticNotice}>
          <Text style={s.semanticTitle}>Semantic comparison unavailable</Text>
          <Text style={s.body}>
            No embedding provider is enabled. The backend redistributed the
            overall-score weights across the available deterministic components.
          </Text>
        </AppCard>
      ) : null}
      <SkillSection
        title="Matched skills"
        items={value.matchedSkills}
        empty="No direct skill matches were detected."
        styles={s}
      />
      <SkillSection
        title="Missing skills"
        items={value.missingSkills}
        empty="No missing dictionary skills were detected."
        styles={s}
      />
      <SkillSection
        title="Partial matches"
        items={value.partialMatches}
        empty="No related-skill partial matches were detected."
        styles={s}
      />
      <SkillSection
        title="Additional resume skills"
        items={value.extraResumeSkills}
        empty="No additional canonical skills were detected."
        styles={s}
      />
      {value.missingSkills.length ? (
        <SkillSection
          title="Priority skill gaps"
          items={[...value.missingSkills].sort(
            (a, b) => priorityOrder(a.priority) - priorityOrder(b.priority),
          )}
          empty=""
          styles={s}
        />
      ) : null}
      <Text style={s.version}>Scoring version: {value.scoringVersion}</Text>
    </View>
  );
}

function Score({
  label,
  value,
  status,
  styles: s,
}: {
  label: string;
  value: number | null;
  status?: string;
  styles: ReturnType<typeof styles>;
}) {
  const numeric = typeof value === "number",
    state = statusLabel(status);
  return (
    <AppCard style={s.scoreCard}>
      <Text style={s.scoreLabel}>{label}</Text>
      <Text style={[s.componentScore, !numeric && s.unavailable]}>
        {numeric ? `${value}%` : state}
      </Text>
      {numeric ? <ProgressBar value={value} /> : null}
      {numeric && status ? <Text style={s.status}>{state}</Text> : null}
    </AppCard>
  );
}
function SkillSection({
  title,
  items,
  empty,
  styles: s,
}: {
  title: string;
  items: JobMatchSkill[];
  empty: string;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <View style={s.skillSection}>
      <Text style={s.sectionTitle}>{title}</Text>
      {items.length ? (
        items.map((item) => (
          <AppCard
            key={`${item.source}-${item.normalizedSkill}`}
            style={s.skillCard}
          >
            <View style={s.skillTop}>
              <Text style={s.skillName}>{item.skill}</Text>
              <View
                style={[
                  s.statusChip,
                  item.status === "MATCHED"
                    ? s.matchedChip
                    : item.status === "MISSING"
                      ? s.missingChip
                      : s.partialChip,
                ]}
              >
                <Text
                  style={[
                    s.statusChipText,
                    item.status === "MATCHED"
                      ? s.matchedText
                      : item.status === "MISSING"
                        ? s.missingText
                        : s.partialText,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <View style={s.chips}>
              <Chip text={item.importance} styles={s} />
              <Chip text={`${item.priority} PRIORITY`} styles={s} />
            </View>
            <Text style={s.evidence}>{item.evidence}</Text>
            <Text style={s.recommendation}>{item.recommendation}</Text>
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={s.muted}>{empty}</Text>
        </AppCard>
      )}
    </View>
  );
}
function Chip({
  text,
  styles: s,
}: {
  text: string;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <View style={s.chip}>
      <Text style={s.chipText}>{text}</Text>
    </View>
  );
}
const priorityOrder = (value: string) =>
    value === "HIGH" ? 0 : value === "MEDIUM" ? 1 : 2,
  statusLabel = (value?: string) =>
    value === "UNAVAILABLE"
      ? "Unavailable"
      : value === "NOT_REQUIRED"
        ? "Not required"
        : value === "UNKNOWN"
          ? "Unknown"
          : value
            ? value
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/^./, (c) => c.toUpperCase())
            : "Not available",
  formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

const styles = (t: ThemeTokens) => ({
  center: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: spacing.lg,
  },
  muted: { color: t.textMuted, lineHeight: 21, textAlign: "center" as const },
  hero: { marginBottom: spacing.xl },
  eyebrow: {
    color: t.primary,
    fontSize: type.caption,
    fontWeight: "900" as const,
    letterSpacing: 1.5,
  },
  title: {
    color: t.textPrimary,
    fontSize: type.hero,
    fontWeight: "900" as const,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  toolIntro: {
    color: t.textSecondary,
    lineHeight: 21,
    marginTop: -spacing.md,
    marginBottom: spacing.xl,
  },
  mlSection: { marginBottom: spacing.xxl },
  planLink: {
    backgroundColor: t.elevatedSurface,
    borderColor: t.primary,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  planLinkTitle: { color: t.textPrimary, fontWeight: "900" as const },
  planLinkCopy: { color: t.primary, fontSize: type.caption, marginTop: 4 },
  mlIntro: { gap: spacing.md, marginBottom: spacing.md },
  mlTitle: { color: t.textPrimary, fontSize: 18, fontWeight: "900" as const },
  mlCopy: { color: t.textSecondary, lineHeight: 21 },
  notReady: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: t.cardBorder,
    paddingTop: spacing.md,
  },
  notReadyTitle: { color: t.warning, fontWeight: "900" as const },
  mlError: {
    color: t.error,
    backgroundColor: t.errorSurface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  mlResults: { gap: spacing.md, marginTop: spacing.md },
  mlCard: { gap: spacing.md },
  mlRankRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
  },
  mlRank: { color: t.primary, fontWeight: "900" as const },
  mlCareer: { color: t.textPrimary, fontWeight: "900" as const, flex: 1 },
  mlConfidence: { color: t.primary, fontSize: 20, fontWeight: "900" as const },
  signalHeading: { color: t.textMuted, fontSize: 10, fontWeight: "900" as const },
  signal: { color: t.textSecondary, fontSize: type.caption, lineHeight: 18 },
  mlHistory: { gap: spacing.sm, marginTop: spacing.xl },
  smallHeading: { color: t.textMuted, fontSize: 10, fontWeight: "900" as const },
  mlHistoryItem: {
    minHeight: 64,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  error: {
    color: t.error,
    backgroundColor: t.errorSurface,
    borderColor: t.error,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  resumeList: { gap: spacing.sm, marginBottom: spacing.sm },
  resumeChoice: {
    minHeight: 64,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    backgroundColor: t.surface,
    borderColor: t.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  resumeChoiceActive: {
    borderColor: t.primary,
    backgroundColor: t.accentSurface,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: t.primary,
    borderWidth: 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: t.primary,
  },
  resumeInfo: { flex: 1 },
  resumeName: { color: t.textPrimary, fontWeight: "900" as const },
  resumeMeta: { color: t.textMuted, fontSize: type.caption, marginTop: 4 },
  active: { color: t.success, fontSize: 10, fontWeight: "900" as const },
  fieldError: { color: t.error, fontSize: 13, marginBottom: spacing.xl },
  form: { marginBottom: spacing.xxl },
  descriptionInput: { minHeight: 220, textAlignVertical: "top" as const },
  countRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  count: { color: t.textMuted, fontSize: type.caption },
  countWarning: { color: t.warning },
  minimum: { color: t.textMuted, fontSize: type.caption },
  localNote: {
    color: t.textMuted,
    fontSize: type.caption,
    lineHeight: 18,
    textAlign: "center" as const,
    marginTop: spacing.md,
  },
  empty: {
    alignItems: "center" as const,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.cardBorder,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  emptyTitle: {
    color: t.textPrimary,
    fontSize: 23,
    fontWeight: "900" as const,
    marginTop: spacing.lg,
  },
  emptyCopy: {
    color: t.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    marginVertical: spacing.md,
  },
  result: { marginBottom: spacing.xxl },
  overall: {
    alignItems: "center" as const,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  company: { color: t.textSecondary, fontWeight: "700" as const },
  overallScore: { color: t.primary, fontSize: 56, fontWeight: "900" as const },
  overallLabel: {
    color: t.textMuted,
    fontSize: type.caption,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  resumeUsed: {
    color: t.textMuted,
    fontSize: type.caption,
    textAlign: "center" as const,
  },
  disclaimer: { backgroundColor: t.accentSurface, marginBottom: spacing.md },
  disclaimerText: {
    color: t.textSecondary,
    fontSize: type.caption,
    lineHeight: 18,
  },
  scoreGrid: { gap: spacing.md },
  scoreCard: { gap: spacing.md },
  scoreLabel: { color: t.textSecondary, fontWeight: "800" as const },
  componentScore: {
    color: t.primary,
    fontSize: 29,
    fontWeight: "900" as const,
  },
  unavailable: { color: t.textMuted, fontSize: 20 },
  status: {
    color: t.textMuted,
    fontSize: 10,
    textTransform: "uppercase" as const,
  },
  semanticNotice: { borderColor: t.warning, marginTop: spacing.md },
  semanticTitle: { color: t.warning, fontWeight: "900" as const },
  body: { color: t.textSecondary, lineHeight: 21, marginTop: spacing.sm },
  skillSection: { gap: spacing.md, marginTop: spacing.xl },
  sectionTitle: {
    color: t.textPrimary,
    fontSize: type.section,
    fontWeight: "900" as const,
  },
  skillCard: { padding: spacing.lg },
  skillTop: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    gap: spacing.md,
  },
  skillName: {
    color: t.textPrimary,
    fontSize: 16,
    fontWeight: "900" as const,
    flex: 1,
  },
  statusChip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  matchedChip: { backgroundColor: t.successSurface },
  missingChip: { backgroundColor: t.errorSurface },
  partialChip: { backgroundColor: t.accentSurface },
  statusChipText: { fontSize: 10, fontWeight: "900" as const },
  matchedText: { color: t.success },
  missingText: { color: t.error },
  partialText: { color: t.primary },
  chips: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: t.backgroundAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: t.cardBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  chipText: {
    color: t.textSecondary,
    fontSize: 10,
    fontWeight: "800" as const,
  },
  evidence: {
    color: t.textMuted,
    fontSize: type.caption,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  recommendation: {
    color: t.textSecondary,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  version: {
    color: t.textMuted,
    fontSize: 10,
    textAlign: "center" as const,
    marginTop: spacing.xl,
  },
  history: { gap: spacing.sm, marginBottom: spacing.xl },
  historyItem: {
    minHeight: 78,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  historyCopy: { flex: 1 },
  historyTitle: { color: t.textPrimary, fontWeight: "900" as const },
  historyMeta: { color: t.textMuted, fontSize: type.caption, marginTop: 4 },
  historyResume: { color: t.textSecondary, fontSize: 11, marginTop: 4 },
  historyScore: { color: t.primary, fontSize: 25, fontWeight: "900" as const },
  historyEmpty: { marginBottom: spacing.xl },
  pressed: { opacity: 0.72, transform: [{ scale: 0.995 }] },
});

