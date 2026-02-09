import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { realtimeAPI } from './services/apiService';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './components/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for code splitting
const Login = lazy(() => import('./components/Login'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const OwnerDashboard = lazy(() => import('./components/OwnerDashboard'));
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const ExamPage = lazy(() => import('./components/ExamPage'));
const JoinClassPage = lazy(() => import('./components/JoinClassModal').then(m => ({ default: m.JoinClassPage })));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 font-bold">Memuat halaman...</p>
    </div>
  </div>
);

// Simple protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const userStr = localStorage.getItem('current_user');
  const token = localStorage.getItem('auth_token');

  if (!userStr || !token) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Home redirect based on role
const HomeRedirect: React.FC = () => {
  const userStr = localStorage.getItem('current_user');

  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (user.role === 'owner') return <Navigate to="/owner" replace />;
  if (user.role === 'guru') return <Navigate to="/guru" replace />;
  return <Navigate to="/student" replace />;
};

export default function App() {
  // Send heartbeat every 30 seconds for online status
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const sendHeartbeat = async () => {
      try {
        await realtimeAPI.heartbeat();
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    // Send immediately on mount
    sendHeartbeat();

    // Then every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <HashRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<Login />} />

                {/* Owner Routes */}
                <Route
                  path="/owner"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Guru Routes */}
                <Route
                  path="/guru"
                  element={
                    <ProtectedRoute allowedRoles={['guru']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={['siswa']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/exam"
                  element={
                    <ProtectedRoute allowedRoles={['siswa']}>
                      <ExamPage />
                    </ProtectedRoute>
                  }
                />

                {/* Join Class via URL */}
                <Route
                  path="/join/:code"
                  element={
                    <ProtectedRoute allowedRoles={['siswa']}>
                      <JoinClassPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
