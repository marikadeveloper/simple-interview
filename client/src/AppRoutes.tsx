import { Navigate, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { UserRole } from './generated/graphql';
import AdminSignupPage from './pages/auth/AdminSignupPage';
import CandidateSignupPage from './pages/auth/CandidateSignupPage';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard';
import { InterviewTemplates } from './pages/interview-templates';
import { Interviews } from './pages/interviews';
import { Users } from './pages/users';

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
            <ProtectedRoute>
              <InterviewTemplates />
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
