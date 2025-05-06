import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { UserRole } from './generated/graphql';

const AdminSignupPage = lazy(() => import('./pages/auth/AdminSignupPage'));
const CandidateSignupPage = lazy(
  () => import('./pages/auth/CandidateSignupPage'),
);
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const InterviewTemplate = lazy(() => import('./pages/interview-template'));
const InterviewTemplates = lazy(() => import('./pages/interview-templates'));
const Interviews = lazy(() => import('./pages/interviews'));
const Users = lazy(() => import('./pages/users'));

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
        path='/candidate-signup'
        element={
          <PublicRoute>
            <CandidateSignupPage />
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
