# Intelligent Career Guidance and Resume Optimization Platform Using AI — Review 2 Demo Checklist

## Before the review

- Start Docker PostgreSQL on host port 5433 and confirm it is healthy.
- Restart the backend on port 8081 so the latest scheduling classes are loaded.
- Start the frontend and sign in with a non-sensitive demonstration account.
- Prepare a synthetic resume and a sample backend-developer job description.
- Do not display `.env`, tokens, API keys, passwords, or private resumes.

## Demonstration sequence

1. Register/login and show the protected student workspace.
2. Open Profile and show editable skills/profile data.
3. Upload the synthetic PDF/DOCX resume and show parsed sections.
4. Run resume analysis; distinguish deterministic ATS results from Gemini feedback.
5. If Gemini is unavailable, explain the PARTIAL fallback instead of retrying indefinitely.
6. Create a job match and show component scores and REQUIRED/PREFERRED/OPTIONAL gaps.
7. Open Assessments and distinguish practice, role-oriented, and placement mock catalogues.
8. Start an attempt and show ten questions, persisted order, and the server-backed timer.
9. Submit answers and show score plus skill/difficulty breakdown and explanations.
10. Refresh the result/history to demonstrate persistence.
11. Choose Schedule Test, create a future student-owned schedule, and show My Scheduled Exams.
12. Demonstrate reschedule/cancel on a disposable future entry; start/continue only within an active window.

## Honest limitations to state

- Semantic similarity is unavailable until an embedding provider is enabled; weights are redistributed.
- Email reminders, webcam/tab/fullscreen proctoring, coding execution, and production deployment are planned.
- Final browser verification of scheduling requires the latest backend process to be restarted.
