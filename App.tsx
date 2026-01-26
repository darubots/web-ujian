import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import StudentDashboard from './components/StudentDashboard';
import ExamPage from './components/ExamPage';
import { realtimeAPI } from './services/apiService';

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
    <HashRouter>
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

        {/* Guru Routes (use old AdminDashboard for now) */}
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
