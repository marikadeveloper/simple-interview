import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { UserRole } from './generated/graphql';
import Interview from './pages/interview';
import InterviewFeedback from './pages/interview-feedback';

const AdminSignupPage = lazy(() => import('./pages/auth/AdminSignupPage'));
const FirstPasswordChangePage = lazy(
  () => import('./pages/auth/FirstPasswordChangePage'),
);
const ChangePasswordPage = lazy(
  () => import('./pages/auth/ChangePasswordPage'),
);
const ForgotPasswordPage = lazy(
  () => import('./pages/auth/ForgotPasswordPage'),
);
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const InterviewTemplate = lazy(() => import('./pages/interview-template'));
const InterviewTemplates = lazy(() => import('./pages/interview-templates'));
const Interviews = lazy(() => import('./pages/interviews'));
const Users = lazy(() => import('./pages/users'));
const QuestionBanks = lazy(() => import('./pages/question-banks'));

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes - redirect to dashboard if already authenticated */}
      <Route
        path='/login'
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path='/forgot-password'
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path='/change-password/:token'
        element={
          <PublicRoute>
            <ChangePasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path='/admin-signup'
        element={
          <PublicRoute>
            <AdminSignupPage />
          </PublicRoute>
        }
      />

      {/* Protected routes - require authentication */}
      <Route
        path='/first-password-change'
        element={
          <ProtectedRoute>
            <FirstPasswordChangePage />
          </ProtectedRoute>
        }
      />
      <Route element={<Layout />}>
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/interview-templates'
          element={
            <ProtectedRoute
              allowedUserRoles={[UserRole.Admin, UserRole.Interviewer]}>
              <InterviewTemplates />
            </ProtectedRoute>
          }
        />
        <Route
          path='/interview-templates/:id'
          element={
            <ProtectedRoute
              allowedUserRoles={[UserRole.Admin, UserRole.Interviewer]}>
              <InterviewTemplate />
            </ProtectedRoute>
          }
        />
        <Route
          path='/interviews'
          element={
            <ProtectedRoute>
              <Interviews />
            </ProtectedRoute>
          }
        />
        <Route
          path='/interviews/:id'
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />
        <Route
          path='/interviews/:id/feedback'
          element={
            <ProtectedRoute>
              <InterviewFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path='/question-banks'
          element={
            <ProtectedRoute
              allowedUserRoles={[UserRole.Admin, UserRole.Interviewer]}>
              <QuestionBanks />
            </ProtectedRoute>
          }
        />
        <Route
          path='/users'
          element={
            <ProtectedRoute
              allowedUserRoles={[UserRole.Admin, UserRole.Interviewer]}>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default route redirection */}
      <Route
        path='/'
        element={
          <Navigate
            to='/login'
            replace
          />
        }
      />
      <Route
        path='*'
        element={
          <Navigate
            to='/login'
            replace
          />
        }
      />
    </Routes>
  );
};
