import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { StudentLayout } from './layouts/StudentLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'
import { ResumesPage } from './pages/ResumesPage'
import { ResumeDetailPage } from './pages/ResumeDetailPage'
import { ResumeAnalysisPage } from './pages/ResumeAnalysisPage'

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route element={<ProtectedRoute role="STUDENT" />}><Route path="/student" element={<StudentLayout />}><Route path="dashboard" element={<DashboardPage />} /><Route path="profile" element={<ProfilePage />} /><Route path="resumes" element={<ResumesPage />} /><Route path="resumes/:id" element={<ResumeDetailPage />} /><Route path="resumes/:resumeId/analysis/:analysisId" element={<ResumeAnalysisPage />} /></Route></Route>
    <Route path="/resumes" element={<Navigate to="/student/resumes" replace />} />
    <Route element={<ProtectedRoute role="ADMIN" />}><Route path="/admin" element={<AdminPage />} /></Route>
    <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
  </Routes>
}
