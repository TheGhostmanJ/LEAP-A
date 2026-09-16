import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import features
import Login from "./features/auth/login.jsx";
import ChangePasswordRequest from "./features/auth/ChangePasswordRequest.jsx";
import AccessDenied from './features/auth/access-denied.jsx';

// Shared / Employee Features
import Dashboard from './features/dashboard/dashboard.jsx';
import Attendance from './features/attendance/attendance.jsx';
import Profile from './features/profile/profile.jsx';
import Support from './features/support/support.jsx';
import LeaveHistory from './features/leave/leavehistory.jsx';
import LeaveApplication from './features/leave/leaveapplication.jsx';
import CreditLedger from './features/ledger/creditledger.jsx';
import TrainingRecords from './features/training/trainingrecords.jsx';
import EmployeeEvents from './features/training/employee-events.jsx'; // Added Employee Events

// Management Features (HOD)
import HodDashboard from './features/dashboard/hod-dashboard.jsx';
import LeaveApprovals from './features/leave/leave-approvals.jsx';
import WorkforceForecast from './features/workforce/workforce-forecast.jsx';
import AnomalyAlert from './features/anomaly/anomaly-alert.jsx';
import DepartmentReports from './features/reports/department-reports.jsx';

// HR Features
import HrDashboard from './features/dashboard/hr-dashboard.jsx';
import EventManagement from './features/hr/event-management.jsx';
import Departments from './features/hr/departments.jsx';
import Payroll from './features/hr/payroll.jsx';
import ProfileRequests from './features/hr/profile-requests.jsx';

// IT Operations Features (Super Admin)
import SystemConfig from './features/admin/system-config.jsx';
import RoleManagement from './features/it/role-management.jsx';
import DatabaseMetrics from './features/it/database-metrics.jsx';
import ApiGateway from './features/it/api-gateway.jsx';
import SystemSettings from './features/it/system-settings.jsx';
import PasswordResetDashboard from './features/it/password-reset.jsx';

import './index.css';

const GOOGLE_CLIENT_ID = '718581008344-0pr3hqb4867olblp5e3n27fvom9klrrh.apps.googleusercontent.com';

// 1. SMART REDIRECT HELPER
const getRoleBasedHome = (role) => {
  if (role === 'Super Admin') return "/system-config";
  if (role === 'HR Admin') return "/hr-dashboard";
  if (role === 'Department Head') return "/hod-dashboard";
  return "/dashboard";
};

// 2. PROTECTED ROUTE GATEKEEPER
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.is_active === false) {
    return <Navigate to="/access-denied" replace />;
  }

  // Safety fallback if user role is missing or invalid
  const userRole = user.role || 'Employee Self-Service';

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={getRoleBasedHome(userRole)} replace />;
  }

  return children;
};

export default function Root() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('active_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Error reading user session from localStorage:", e);
      return null;
    }
  });

  // Keep session synchronized with local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('active_user');
    }
  }, [currentUser]);

  const handleUserUpdate = (updatedUserData) => {
    const newUser = { ...currentUser, ...updatedUserData };
    setCurrentUser(newUser);
    localStorage.setItem('active_user', JSON.stringify(newUser));
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.clear();
    navigate('/');
  };

  // Roles access scopes
  const ALL_ACTIVE_ROLES = [
    'Restricted Self-Service',
    'Employee Self-Service',
    'Department Head',
    'HR Admin',
    'Super Admin',
  ];

  const FULL_SELF_SERVICE_ROLES = [
    'Employee Self-Service',
    'Department Head',
    'HR Admin',
    'Super Admin',
  ];

  const MANAGEMENT_ROLES = ['Department Head', 'HR Admin', 'Super Admin'];

  return (
    <Routes>
      {/* AUTHENTICATION ROUTE */}
      <Route 
        path="/" 
        element={!currentUser ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to={getRoleBasedHome(currentUser?.role)} replace />} 
      />

      {/* FORGOT PASSWORD / CHANGE PASSWORD REQUEST ROUTE */}
      <Route 
        path="/change-password-request" 
        element={!currentUser ? <ChangePasswordRequest /> : <Navigate to={getRoleBasedHome(currentUser?.role)} replace />} 
      />
      
      {/* SHARED ACTIVE ROUTES (Accessible by everyone, including Restricted profiles) */}
      <Route path="/dashboard" element={
        <ProtectedRoute user={currentUser} allowedRoles={ALL_ACTIVE_ROLES}>
          <Dashboard onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute user={currentUser} allowedRoles={ALL_ACTIVE_ROLES}>
          <Attendance onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute user={currentUser} allowedRoles={ALL_ACTIVE_ROLES}>
          <Profile onLogout={handleLogout} user={currentUser} onUserUpdate={handleUserUpdate} />
        </ProtectedRoute>
      } />
      <Route path="/support" element={
        <ProtectedRoute user={currentUser} allowedRoles={ALL_ACTIVE_ROLES}>
          <Support onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />

      {/* FULL SELF-SERVICE ROUTES */}
      <Route path="/leavehistory" element={
        <ProtectedRoute user={currentUser} allowedRoles={FULL_SELF_SERVICE_ROLES}>
          <LeaveHistory onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/creditledger" element={
        <ProtectedRoute user={currentUser} allowedRoles={FULL_SELF_SERVICE_ROLES}>
          <CreditLedger onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/trainingrecords" element={
        <ProtectedRoute user={currentUser} allowedRoles={FULL_SELF_SERVICE_ROLES}>
          <TrainingRecords onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/employee-events" element={
        <ProtectedRoute user={currentUser} allowedRoles={FULL_SELF_SERVICE_ROLES}>
          <EmployeeEvents onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/leaveapplication" element={
        <ProtectedRoute user={currentUser} allowedRoles={FULL_SELF_SERVICE_ROLES}>
          <LeaveApplication user={currentUser} onLogout={handleLogout} onNavigate={(path) => navigate(path.startsWith('/') ? path : `/${path}`)} />
        </ProtectedRoute>
      } />

      {/* MANAGEMENT ROUTES (HODs & HR) */}
      <Route path="/hod-dashboard" element={
        <ProtectedRoute user={currentUser} allowedRoles={MANAGEMENT_ROLES}>
          <HodDashboard onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/leave-approvals" element={
        <ProtectedRoute user={currentUser} allowedRoles={MANAGEMENT_ROLES}>
          <LeaveApprovals onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/workforce-forecast" element={
        <ProtectedRoute user={currentUser} allowedRoles={MANAGEMENT_ROLES}>
          <WorkforceForecast onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/anomaly-alerts" element={
        <ProtectedRoute user={currentUser} allowedRoles={MANAGEMENT_ROLES}>
          <AnomalyAlert onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/department-reports" element={
        <ProtectedRoute user={currentUser} allowedRoles={MANAGEMENT_ROLES}>
          <DepartmentReports onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />

      {/* HR SPECIFIC ROUTES */}
      <Route path="/hr-dashboard" element={
        <ProtectedRoute user={currentUser} allowedRoles={['HR Admin', 'Super Admin']}>
          <HrDashboard onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/event-management" element={
        <ProtectedRoute user={currentUser} allowedRoles={['HR Admin', 'Super Admin']}>
          <EventManagement onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/departments" element={
        <ProtectedRoute user={currentUser} allowedRoles={['HR Admin', 'Super Admin']}>
          <Departments onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute user={currentUser} allowedRoles={['HR Admin', 'Super Admin']}>
          <Payroll onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/profile-requests" element={
        <ProtectedRoute user={currentUser} allowedRoles={['HR Admin', 'Super Admin']}>
          <ProfileRequests onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />

      {/* IT OPERATIONS ROUTES (Super Admin Only) */}
      <Route path="/system-config" element={
        <ProtectedRoute user={currentUser} allowedRoles={['Super Admin']}>
          <SystemConfig onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/role-management" element={
        <ProtectedRoute user={currentUser} allowedRoles={['Super Admin']}>
          <RoleManagement onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/database-metrics" element={
        <ProtectedRoute user={currentUser} allowedRoles={['Super Admin']}>
          <DatabaseMetrics onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/api-gateway" element={
        <ProtectedRoute user={currentUser} allowedRoles={['Super Admin']}>
          <ApiGateway onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/password-reset-requests" element={
        <ProtectedRoute user={currentUser} allowedRoles={['Super Admin']}>
          <PasswordResetDashboard onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/system-settings" element={
        <ProtectedRoute user={currentUser} allowedRoles={['Super Admin']}>
          <SystemSettings onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />

      {/* ACCESS DENIED ROUTE */}
      <Route 
        path="/access-denied" 
        element={<AccessDenied onLogout={handleLogout} />} 
      />

      {/* FALLBACK CATCH-ALL */}
      <Route path="*" element={<Navigate to={currentUser ? getRoleBasedHome(currentUser.role) : "/"} replace />} />
    </Routes>
  );
}

// Meta Tag Helper
if (!document.querySelector('meta[name="color-scheme"]')) {
  const metaTheme = document.createElement('meta');
  metaTheme.name = "color-scheme";
  metaTheme.content = "light only";
  document.head.appendChild(metaTheme);
}

// Render Setup
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Root />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}