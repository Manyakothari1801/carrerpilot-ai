import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { StudentLayout } from './layouts/StudentLayout'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'
import { ResumesPage } from './pages/ResumesPage'
import { ResumeDetailPage } from './pages/ResumeDetailPage'
import { ResumeAnalysisPage } from './pages/ResumeAnalysisPage'
import { JobMatchPage } from './pages/JobMatchPage'
import { JobMatchResultPage } from './pages/JobMatchResultPage'
import { AssessmentsPage } from './pages/AssessmentsPage'
import { AssessmentAttemptPage } from './pages/AssessmentAttemptPage'
import { AssessmentResultPage } from './pages/AssessmentResultPage'
import { ScheduledExamsPage } from './pages/ScheduledExamsPage'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const CareersPage = lazy(() => import('./pages/CareersPage').then((module) => ({ default: module.CareersPage })))
const CareerPlanPage = lazy(() => import('./pages/CareerPlanPage').then((module) => ({ default: module.CareerPlanPage })))
const CareerTwinPage = lazy(() => import('./pages/CareerTwinPage').then((module) => ({ default: module.CareerTwinPage })))
const CareerInterviewPage = lazy(() => import('./pages/CareerInterviewPage').then((module) => ({ default: module.CareerInterviewPage })))
const CareerCopilotPage = lazy(() => import('./pages/CareerCopilotPage').then((module) => ({ default: module.CareerCopilotPage })))
const DsaPracticePage = lazy(() => import('./pages/DsaPracticePage').then((module) => ({ default: module.DsaPracticePage })))

export default function App() {
  return <Suspense fallback={<main className="page" aria-label="Loading page"><div className="skeleton h-40" /></main>}><Routes>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route element={<ProtectedRoute role="STUDENT" />}><Route path="/student" element={<StudentLayout />}><Route path="dashboard" element={<DashboardPage />} /><Route path="profile" element={<ProfilePage />} /><Route path="resumes" element={<ResumesPage />} /><Route path="resumes/:id" element={<ResumeDetailPage />} /><Route path="resumes/:resumeId/analysis/:analysisId" element={<ResumeAnalysisPage />} /><Route path="careers" element={<CareersPage />} /><Route path="career-plan" element={<CareerPlanPage />} /><Route path="career-twin" element={<CareerTwinPage />} /><Route path="dsa-practice" element={<DsaPracticePage />} /><Route path="ai-interview" element={<CareerInterviewPage />} /><Route path="career-copilot" element={<CareerCopilotPage />} /><Route path="job-match" element={<JobMatchPage />} /><Route path="job-match/:id" element={<JobMatchResultPage />} /><Route path="assessments" element={<AssessmentsPage />} /><Route path="scheduled-exams" element={<ScheduledExamsPage />} /><Route path="assessments/:assessmentId" element={<AssessmentAttemptPage />} /><Route path="assessment-attempts/:attemptId/result" element={<AssessmentResultPage />} /></Route></Route>
    <Route path="/resumes" element={<Navigate to="/student/resumes" replace />} />
    <Route path="/job-match" element={<Navigate to="/student/job-match" replace />} />
    <Route element={<ProtectedRoute role="ADMIN" />}><Route path="/admin" element={<AdminPage />} /></Route>
    <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
  </Routes></Suspense>
}
