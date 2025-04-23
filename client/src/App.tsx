import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AuthProvider } from './contexts/AuthContext';
import { UrqlClientProvider } from './contexts/UrqlClientContext';
import AdminSignupPage from './pages/auth/AdminSignupPage';
import CandidateSignupPage from './pages/auth/CandidateSignupPage';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard';

function AppRoutes() {
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
      <Route
        path='/dashboard/*'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

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
}

function App() {
  return (
    <UrqlClientProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </UrqlClientProvider>
  );
}

export default App;
