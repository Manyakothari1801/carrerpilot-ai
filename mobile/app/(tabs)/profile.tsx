import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "@/src/components/Screen";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { SettingsAction } from "@/src/components/SettingsAction";
import { PrimaryButton, SecondaryButton } from "@/src/components/PrimaryButton";
import { AppCard, ProgressBar } from "@/src/components/AppCard";
import { useAuth } from "@/src/auth/AuthContext";
import { useProfile } from "@/src/profile/ProfileContext";
import { initials, label, profileCompletion } from "@/src/profile/profileUtils";
import {
  radius,
  spacing,
  type,
  type ThemePreference,
  type ThemeTokens,
  useAppTheme,
  useThemeStyles,
} from "@/src/theme";
const choices: [ThemePreference, string][] = [
  ["system", "System"],
  ["light", "Light"],
  ["dark", "Dark"],
];
type Section =
  | "personal"
  | "academic"
  | "career"
  | "skills"
  | "links"
  | "appearance"
  | "account";
export default function ProfileScreen() {
  const s = useThemeStyles(styles),
    params = useLocalSearchParams<{ section?: string }>(),
    { preference, setPreference } = useAppTheme(),
    { logout } = useAuth(),
    { profile, skills, loading, error, refresh } = useProfile(),
    [open, setOpen] = useState<Section | "none">("none");
  useEffect(() => {
    if (params.section === "appearance") setOpen("appearance");
  }, [params.section]);
  if (loading && !profile)
    return (
      <Screen style={s.center}>
        <ActivityIndicator color={s.accent.color} />
        <Text style={s.muted}>Loading your profile…</Text>
      </Screen>
    );
  if ((error && !profile) || !profile)
    return (
      <Screen style={s.center}>
        <Text style={s.error}>
          {error || "No student profile is available."}
        </Text>
        <PrimaryButton title="Try again" onPress={() => void refresh()} />
      </Screen>
    );
  const completion = profileCompletion(profile, skills),
    toggle = (value: Section) =>
      setOpen((current) => (current === value ? "none" : value));
  return (
    <Screen>
      <ScreenHeader
        eyebrow="YOUR ACCOUNT"
        title="Profile"
        trailing={<SettingsAction onPress={() => setOpen("appearance")} />}
      />
      <View style={s.identity}>
        <View style={s.avatar}>
          <Text style={s.initials}>{initials(profile.fullName)}</Text>
        </View>
        <Text style={s.name}>{profile.fullName}</Text>
        <Text style={s.email}>{profile.email}</Text>
      </View>
      <AppCard style={s.completion}>
        <View style={s.between}>
          <Text style={s.completionTitle}>Profile completion</Text>
          <Text style={s.percent}>{completion}%</Text>
        </View>
        <ProgressBar value={completion} />
        <Text style={s.completionCopy}>
          {completion === 100
            ? "Your career profile is ready for personalized tools."
            : `${profile.missingFields.length} profile ${profile.missingFields.length === 1 ? "item" : "items"} remaining.`}
        </Text>
      </AppCard>
      <PrimaryButton
        title="Edit Profile"
        onPress={() => router.push("/profile-edit")}
      />
      <View style={s.sections}>
        <Expandable
          title="Personal"
          summary={profile.phone || "Contact and introduction"}
          open={open === "personal"}
          onPress={() => toggle("personal")}
          styles={s}
        >
          <Rows
            values={[
              ["Phone", profile.phone],
              ["About", profile.bio],
            ]}
            styles={s}
          />
        </Expandable>
        <Expandable
          title="Academic"
          summary={
            [profile.degree, profile.graduationYear]
              .filter(Boolean)
              .join(" · ") || "Education details"
          }
          open={open === "academic"}
          onPress={() => toggle("academic")}
          styles={s}
        >
          <Rows
            values={[
              ["College / university", profile.college],
              ["Degree", profile.degree],
              ["Graduation year", profile.graduationYear?.toString()],
            ]}
            styles={s}
          />
        </Expandable>
        <Expandable
          title="Career"
          summary={profile.targetRole || "Career direction"}
          open={open === "career"}
          onPress={() => toggle("career")}
          styles={s}
        >
          <Rows
            values={[
              ["Target role", profile.targetRole],
              [
                "Experience",
                profile.experienceLevel ? label(profile.experienceLevel) : null,
              ],
            ]}
            styles={s}
          />
        </Expandable>
        <Expandable
          title="Skills"
          summary={`${skills.length} saved`}
          open={open === "skills"}
          onPress={() => toggle("skills")}
          styles={s}
        >
          {skills.length ? (
            <View style={s.chips}>
              {skills.map((skill) => (
                <View style={s.chip} key={skill.id}>
                  <Text style={s.chipName}>{skill.displayName}</Text>
                  <Text style={s.chipLevel}>
                    {label(skill.proficiencyLevel)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={s.empty}>No skills added yet.</Text>
          )}
        </Expandable>
        <Expandable
          title="Links"
          summary="GitHub and LinkedIn"
          open={open === "links"}
          onPress={() => toggle("links")}
          styles={s}
        >
          <LinkButton name="GitHub" url={profile.githubUrl} styles={s} />
          <LinkButton name="LinkedIn" url={profile.linkedinUrl} styles={s} />
        </Expandable>
        <Expandable
          title="Appearance"
          summary={choices.find(([v]) => v === preference)?.[1] || "System"}
          open={open === "appearance"}
          onPress={() => toggle("appearance")}
          styles={s}
        >
          <View style={s.themeChoices}>
            {choices.map(([value, name]) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: preference === value }}
                key={value}
                onPress={() => void setPreference(value)}
                style={[
                  s.themeChoice,
                  preference === value && s.themeChoiceActive,
                ]}
              >
                <View style={[s.radio, preference === value && s.radioActive]}>
                  {preference === value ? <View style={s.radioDot} /> : null}
                </View>
                <Text
                  style={[
                    s.themeText,
                    preference === value && s.themeTextActive,
                  ]}
                >
                  {name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Expandable>
        <Expandable
          title="Account"
          summary="Session and security"
          open={open === "account"}
          onPress={() => toggle("account")}
          styles={s}
        >
          <SecondaryButton
            title="Log out"
            danger
            onPress={() => void logout()}
          />
        </Expandable>
      </View>
    </Screen>
  );
}
function Expandable({
  title,
  summary,
  open,
  onPress,
  children,
  styles: s,
}: {
  title: string;
  summary: string;
  open: boolean;
  onPress(): void;
  children: React.ReactNode;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <AppCard style={s.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={s.sectionHead}
      >
        <View style={s.sectionCopy}>
          <Text style={s.sectionTitle}>{title}</Text>
          <Text numberOfLines={1} style={s.sectionSummary}>
            {summary}
          </Text>
        </View>
        <Text style={s.chevron}>{open ? "−" : "+"}</Text>
      </Pressable>
      {open ? <View style={s.sectionBody}>{children}</View> : null}
    </AppCard>
  );
}
function Rows({
  values,
  styles: s,
}: {
  values: [string, string | null | undefined][];
  styles: ReturnType<typeof styles>;
}) {
  return (
    <>
      {values.map(([name, value]) => (
        <View key={name} style={s.row}>
          <Text style={s.rowName}>{name}</Text>
          <Text style={[s.rowValue, !value && s.empty]}>
            {value || "Not provided"}
          </Text>
        </View>
      ))}
    </>
  );
}
function LinkButton({
  name,
  url,
  styles: s,
}: {
  name: string;
  url?: string | null;
  styles: ReturnType<typeof styles>;
}) {
  return (
    <Pressable
      disabled={!url}
      onPress={() => url && void Linking.openURL(url)}
      style={s.link}
    >
      <Text style={[s.linkText, !url && s.empty]}>
        {url ? `Open ${name}` : `${name} not provided`}
      </Text>
      <Text style={s.linkArrow}>↗</Text>
    </Pressable>
  );
}
const styles = (t: ThemeTokens) => ({
  center: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: spacing.lg,
  },
  accent: { color: t.primary },
  muted: { color: t.textMuted },
  error: { color: t.error, textAlign: "center" as const },
  identity: {
    alignItems: "center" as const,
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: t.accentSurface,
    borderWidth: 1,
    borderColor: t.primaryPressed,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: t.accentSurface,
    borderWidth: 3,
    borderColor: t.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  initials: { color: t.primary, fontSize: 25, fontWeight: "900" as const },
  name: {
    color: t.textPrimary,
    fontSize: 24,
    fontWeight: "900" as const,
    marginTop: spacing.md,
  },
  email: { color: t.textMuted, marginTop: 4 },
  completion: { marginBottom: spacing.md, padding: spacing.lg },
  between: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: spacing.md,
  },
  completionTitle: { color: t.textSecondary, fontWeight: "800" as const },
  percent: { color: t.primary, fontWeight: "900" as const },
  completionCopy: {
    color: t.textMuted,
    fontSize: type.caption,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  sections: {
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  section: { padding: 0, borderRadius: radius.xl },
  sectionHead: {
    minHeight: 68,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: spacing.md,
  },
  sectionCopy: { flex: 1 },
  sectionTitle: {
    color: t.textPrimary,
    fontWeight: "900" as const,
    fontSize: 16,
  },
  sectionSummary: { color: t.textMuted, fontSize: type.caption, marginTop: 4 },
  chevron: { color: t.primary, fontSize: 24, fontWeight: "700" as const },
  sectionBody: {
    borderTopWidth: 1,
    borderTopColor: t.cardBorder,
    padding: spacing.md,
  },
  row: { paddingVertical: spacing.sm },
  rowName: {
    color: t.textMuted,
    fontSize: 10,
    fontWeight: "900" as const,
    textTransform: "uppercase" as const,
  },
  rowValue: { color: t.textPrimary, lineHeight: 21, marginTop: 4 },
  empty: { color: t.textMuted, fontStyle: "italic" as const },
  chips: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: t.accentSurface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: t.strongBorder,
  },
  chipName: { color: t.textPrimary, fontWeight: "800" as const },
  chipLevel: { color: t.primary, fontSize: 10, marginTop: 3 },
  themeChoices: { gap: spacing.sm },
  themeChoice: {
    minHeight: 48,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: t.cardBorder,
  },
  themeChoiceActive: {
    backgroundColor: t.accentSurface,
    borderColor: t.primary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: t.textMuted,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  radioActive: { borderColor: t.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: t.primary,
  },
  themeText: { color: t.textSecondary, fontWeight: "700" as const },
  themeTextActive: { color: t.primary, fontWeight: "900" as const },
  link: {
    minHeight: 48,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    borderBottomWidth: 1,
    borderBottomColor: t.cardBorder,
  },
  linkText: { color: t.primary, fontWeight: "800" as const },
  linkArrow: { color: t.textMuted, fontSize: 18 },
});
