import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LandingPage from './components/LandingPage';
import InterviewPage from './components/InterviewPage';
import TestInterviewRoom from './components/TestInterviewRoom';
import ReportDetailPage from './components/ReportDetailPage';
import NotFoundPage from './components/NotFoundPage';
import LoginPage from './components/auth/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import JobsPage from './components/dashboard/jobs/JobsPage';
import NewJobPage from './components/dashboard/jobs/NewJobPage';
import JobDetailsPage from './components/dashboard/jobs/JobDetailsPage';
import JobApplicationPage from './components/dashboard/jobs/JobApplicationPage';
import CandidatesPage from './components/dashboard/candidates/CandidatesPage';
import CandidateProfilePage from './components/dashboard/candidates/CandidateProfilePage';
import ReportsPage from './components/dashboard/reports/ReportsPage';
import DashboardReportDetailPage from './components/dashboard/reports/DashboardReportDetailPage';
import SettingsPage from './components/dashboard/settings/SettingsPage';

// Protected Route component
function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

// Public Route component (redirect to dashboard if authenticated)
function PublicRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/interview/:token" element={<InterviewPage />} />
      <Route path="/report/:candidateId" element={<ReportDetailPage />} />
      <Route path="/apply/:jobId" element={<JobApplicationPage />} />

      {/* 🧪 TEST MODE ROUTE - Direct LiveKit connection with JWT token */}
      <Route path="/test-interview" element={<TestInterviewRoom />} />

      {/* Auth routes - only login, no register */}
      <Route path="/auth/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/new" element={<NewJobPage />} />
        <Route path="jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="candidates/:candidateId" element={<CandidateProfilePage />} />
        <Route path="candidates/:candidateId/report" element={<DashboardReportDetailPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/:reportId" element={<DashboardReportDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
