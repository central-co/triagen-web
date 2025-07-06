import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import InterviewPage from './components/InterviewPage';
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
import SettingsPage from './components/dashboard/settings/SettingsPage';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-triagen-primary-blue"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route component (redirect to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-triagen-primary-blue"></div>
      </div>
    );
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
      <Route path="/apply/:jobId" element={<JobApplicationPage />} />
      
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
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;