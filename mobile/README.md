# Career Guidance AI mobile

Phase M1 is the native student-companion foundation. Assessment attempts are intentionally web-only.

Phase M2 adds the real student profile, profile editing, skills editing, deterministic profile completion, and a personalized dashboard. It uses the existing authenticated `/profile` and `/profile/skills` APIs.

Phase M3 adds native PDF/DOCX resume upload and management, active-resume selection, deterministic ATS analysis, persisted analysis history, and optional Gemini Resume Coach feedback. Gemini credentials stay in the Spring Boot backend; the mobile app receives only persisted analysis results.

Phase M4 replaces the Careers placeholder with deterministic resume-to-job-description matching. Students can choose a parsed resume, submit real job information, review the backend score breakdown and classified skill gaps, and reopen immutable match history. No Gemini or client-side scoring is used for Job Match.

Phase M7 makes Assessments a native management companion: students can browse the catalog, schedule/reschedule/cancel owned assessments, view lifecycle status, and review server-graded attempt history. Assessment questions, answers, timers, proctoring, grading, and submission remain exclusively in the web application. The mobile handoff opens the existing web scheduling page and never starts an attempt itself.

M8 adds a first-launch, theme-aware onboarding sequence and Android release metadata. The harmless completion flag is stored in AsyncStorage; authentication tokens remain only in SecureStore. Scheduling retains its validated date/time fields because adding a native picker dependency during release stabilization would increase native-build risk without changing backend-authoritative validation.

## Install and run

1. Copy `.env.example` to `.env` and choose the correct API address below.
2. Run `npm install`.
3. Start the existing Spring Boot backend on port 8081.
4. Run `npm start`, or run `npm run android` with an Android emulator open. Metro uses port 8082 because the backend uses 8081.

## API address

- Android Emulator: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8081/api/v1`
- Physical Android phone: use the Windows computer's LAN IPv4 address, such as `http://192.168.x.x:8081/api/v1`.
- Web handoff on Android Emulator: `EXPO_PUBLIC_WEB_APP_URL=http://10.0.2.2:5173`
- Web handoff on a physical phone: use the same LAN IPv4 address, such as `http://192.168.x.x:5173`.

Run `ipconfig` in PowerShell and find the `IPv4 Address` for the active Wi-Fi or Ethernet adapter. The computer and phone must use the same network. `localhost` on a physical phone means the phone itself, not the Windows computer.

Start the backend from `backend/`:

```powershell
$env:PORT='8081'
.\mvnw.cmd spring-boot:run
```

Keep database credentials in the backend's local environment only; never copy them into the mobile `.env`.

For a physical phone, confirm Windows Firewall allows inbound TCP port 8081 on the private network. Do not expose PostgreSQL port 5433 to the phone or LAN.

## Troubleshooting connection refused

- Confirm the backend is listening on port 8081.
- Use `10.0.2.2`, not `localhost`, from the Android emulator.
- Use the active Windows LAN IPv4 address from a physical phone.
- Confirm both physical devices are on the same non-isolated network.
- Restart Expo after changing `.env`.

## Checks

```powershell
npm run typecheck
npx expo export --platform web
```

## Android builds

`eas.json` defines internal APK profiles (`development`, `preview`) and a production AAB profile. The Android application ID is `com.careerguidanceai.mobile`. Increment both the Expo version and Android `versionCode` for a release.

```powershell
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

EAS commands require an Expo account and upload source to Expo's build service, so they are intentionally manual.

## M2 manual verification

1. Register or sign in with a student account.
2. Confirm Home greets the signed-in student and loads profile completion.
3. Open Profile and verify account, academic, career, and skills information.
4. Select **Edit Profile**, update fields and skills, then save.
5. Restart Expo and sign in again if needed; confirm saved information is returned by the backend.
6. Verify Resume, Careers, and Assessments quick actions open their existing placeholder tabs.
7. Log out and confirm the app returns to Login.

Profile completion mirrors the backend formula: one point each for full name, phone, college, degree, graduation year, target role, experience level, GitHub URL, LinkedIn URL, and at least one skill. The percentage is `completed fields / 10 × 100`. Bio is supported but is not part of the backend completion formula.

## M3 manual verification

1. Sign in, open **Resume**, and verify the empty state when the account has no resume.
2. Choose a real PDF or DOCX of at most 5 MB and verify it is uploaded, parsed, and shown as active.
3. Upload another resume and verify it becomes active while the earlier upload remains in the resume library.
4. Run **ATS + AI Resume Coach** and verify the returned ATS, overall, section, keyword, action-verb, quantification, and readability scores.
5. Confirm rule-based findings are labelled separately from Gemini suggestions.
6. With `AI_ENABLED=false`, confirm deterministic scores still complete and the UI truthfully reports that AI feedback is disabled.
7. With valid backend Gemini configuration, confirm AI findings appear. If Gemini remains unavailable after backend retry/fallback, confirm the analysis is `PARTIAL` while ATS results remain visible.
8. Close and reopen the app and confirm the active resume and latest persisted analysis reload from the backend.
9. Activate and delete resumes from the library and confirm ownership-protected state updates correctly.

## Appearance

Open **Profile → Appearance** and choose System, Light, or Dark. System is the default on a fresh install and follows live device appearance changes. The non-sensitive preference is stored locally with AsyncStorage; authentication tokens remain exclusively in Expo SecureStore.

## M7 assessment companion verification

1. Open **Assessments** and confirm Available lists the stored catalog without loading assessment questions.
2. Schedule a future date/time and confirm it appears under Upcoming after the backend accepts it.
3. Reschedule and cancel an upcoming item; confirm backend lifecycle flags control which actions appear.
4. When an item is available, select **Take Assessment on Web** and confirm the browser opens `/student/scheduled-exams` using `EXPO_PUBLIC_WEB_APP_URL`.
5. Complete the attempt in the web app, return to mobile, and confirm the server-graded score appears in History after reloading the screen.
6. Confirm no mobile screen renders questions, answer options, correct answers, explanations, a timer, proctoring, or a submission action.

## M4 manual verification

1. Sign in, open **Careers**, and confirm the active parsed resume is selected by default.
2. If there is no parsed resume, confirm **Upload Resume** opens the Resume tab and matching remains unavailable.
3. Enter a job title, optional company, and at least 100 characters of real job-description text.
4. Select **Analyze Match** and verify every displayed value comes from the saved backend response.
5. Confirm overall, skill, TF-IDF keyword, experience, education, and semantic states render correctly; unavailable values must not show a percentage bar.
6. Confirm matched, partial, missing, and additional resume skills preserve `REQUIRED`, `PREFERRED`, `OPTIONAL`, and priority classifications.
7. Open an older history item and confirm its immutable result is restored.
8. Relaunch the app and confirm persisted history remains available.
