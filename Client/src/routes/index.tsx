import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { SignupForm } from '../features/auth/components/SignupForm';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { DashboardLayout } from '../features/dashboard/components/DashboardLayout';
import { SuperAdminDashboard } from '../features/dashboard/pages/SuperAdminDashboard';
import { Overview } from '../features/dashboard/pages/Overview';
import { Organizations } from '../features/dashboard/pages/Organizations';
import { UsersPage } from '../features/users/pages/UsersPage';
import { UserProfilePage } from '../features/users/pages/UserProfilePage';
import { LabsPage } from '../features/labs/pages/LabsPage';
import { CreateLabEnvironment } from '../features/labs/pages/CreateLabEnvironment';
import { CloudResources } from '../features/dashboard/pages/CloudResources';
import { Settings } from '../features/dashboard/pages/Settings';
import { ReportsPage } from '../features/reports/pages/ReportsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Superadmin Routes */}
        <Route 
          index 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="organizations" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Organizations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="users" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <UsersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="users/:userId" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="labs" 
          element={
            <ProtectedRoute>
              <LabsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="labs/create" 
          element={
            <ProtectedRoute>
              <CreateLabEnvironment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="cloud" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <CloudResources />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="reports" 
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'orgadmin', 'trainer']}>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Route>

      <Route path="/" element={<LoginForm />} />
    </Routes>
  );
};