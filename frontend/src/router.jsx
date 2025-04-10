import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';

// Public pages
import StatusPage from './pages/public/StatusPage';
import IncidentDetail from './pages/public/IncidentDetail';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Services from './pages/admin/Services';
import Incidents from './pages/admin/Incidents';
import Teams from './pages/admin/Teams';
import Settings from './pages/admin/Settings';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><StatusPage /></PublicLayout>} />
      <Route path="/incidents/:id" element={<PublicLayout><IncidentDetail /></PublicLayout>} />
      
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/services" element={
        <ProtectedRoute>
          <AdminLayout>
            <Services />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/incidents" element={
        <ProtectedRoute>
          <AdminLayout>
            <Incidents />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/teams" element={
        <ProtectedRoute>
          <AdminLayout>
            <Teams />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <AdminLayout>
            <Settings />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;