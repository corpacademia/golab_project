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
import { CataloguePage } from '../features/labs/pages/CataloguePage';
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
        <Route index element={<Overview />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:userId" element={<UserProfilePage />} />
        <Route path="labs" element={<LabsPage />} />
        <Route path="labs/catalogue" element={<CataloguePage />} />
        <Route path="labs/create" element={<CreateLabEnvironment />} />
        <Route path="cloud" element={<CloudResources />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<LoginForm />} />
    </Routes>
  );
};