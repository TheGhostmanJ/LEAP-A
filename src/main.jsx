import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; 
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Import features
import Login from "./features/auth/Login.jsx"; 
import Dashboard from './features/dashboard/dashboard.jsx'; 
import Attendance from './features/attendance/attendance.jsx'; 
import LeaveHistory from './features/leave/leavehistory.jsx'; 
import CreditLedger from './features/ledger/creditledger.jsx';
import TrainingRecords from './features/training/trainingrecords.jsx';
import Profile from './features/profile/profile.jsx';
import Support from './features/support/support.jsx';
import LeaveApplication from './features/leave/leaveapplication.jsx';
import HodDashboard from './features/dashboard/hod-dashboard.jsx';
import LeaveApprovals from './features/leave/leave-approvals.jsx';
import WorkforceForecast from './features/workforce/workforce-forecast.jsx';
import AnomalyAlert from './features/anomaly/anomaly-alert.jsx';
import DepartmentReports from './features/reports/department-reports.jsx';
import HodProfile from './features/profile/hod-profile.jsx';
import SystemConfig from './features/admin/system-config.jsx';
// Import the new Access Denied page we are about to create
import AccessDenied from './features/auth/access-denied.jsx';

import './index.css';

const GOOGLE_CLIENT_ID = '718581008344-0pr3hqb4867olblp5e3n27fvom9klrrh.apps.googleusercontent.com'

// 1. SMART REDIRECT HELPER: Determines where a user should land upon login
const getRoleBasedHome = (role) => {
  if (role === 'Super Admin') return "/system-config";
  if (['Department Head', 'HR Admin'].includes(role)) return "/hod-dashboard";
  return "/dashboard"; // Default for Employee Self-Service
};

// 2. THE GATEKEEPER COMPONENT: Protects routes based on user role
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  // Not logged in at all
  if (!user) {
    return <Navigate to="/" replace />; 
  }
  
  // Account is disabled
  if (user.role === 'Disabled') {
    return <Navigate to="/access-denied" replace />; 
  }

  // Logged in, but lacks permission for this specific page
  if (!allowedRoles.includes(user.role)) {
    // Kick them back to their appropriate home page
    return <Navigate to={getRoleBasedHome(user.role)} replace />;
  }

  // Access granted
  return children;
};

export default function Root() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('active_user');
    return savedUser ? JSON.parse(savedUser) : null;
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
  };

  const ALL_ACTIVE_ROLES = ['Employee Self-Service', 'Department Head', 'HR Admin', 'Super Admin'];
  const MANAGEMENT_ROLES = ['Department Head', 'HR Admin', 'Super Admin'];
  const IT_ROLES = ['Super Admin'];

  return (
    <Routes>
      {/* AUTHENTICATION ROUTE */}
      <Route 
        path="/" 
        element={!currentUser ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to={getRoleBasedHome(currentUser.role)} />} 
      />
      
      {/* ========================================================
          STANDARD EMPLOYEE ROUTES (Accessible by everyone)
          ======================================================== */}
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
      <Route path="/leavehistory" element={
        <ProtectedRoute user={currentUser} allowedRoles={ALL_ACTIVE_ROLES}>
          <LeaveHistory onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/creditledger" element={
        <ProtectedRoute user={currentUser} allowedRoles={ALL_ACTIVE_ROLES}>
          <CreditLedger onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />
      <Route path="/trainingrecords" element={
        <ProtectedRoute user={currentUser} allowedRoles={ALL_ACTIVE_ROLES}>
          <TrainingRecords onLogout={handleLogout} user={currentUser} />
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
      <Route path="/leaveapplication" element={
        <ProtectedRoute user={currentUser} allowedRoles={ALL_ACTIVE_ROLES}>
          <LeaveApplication user={currentUser} onNavigate={(path) => navigate(`/${path}`)} />
        </ProtectedRoute>
      } />

      {/* ========================================================
          MANAGEMENT ROUTES (HOD & HR Admin)
          ======================================================== */}
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
      <Route path="/hod-profile" element={
        <ProtectedRoute user={currentUser} allowedRoles={MANAGEMENT_ROLES}>
          <HodProfile onLogout={handleLogout} user={currentUser} onUserUpdate={handleUserUpdate} />
        </ProtectedRoute>
      } />

      {/* ========================================================
          IT DEPARTMENT ROUTES (Super Admin)
          ======================================================== */}
      <Route path="/system-config" element={
        <ProtectedRoute user={currentUser} allowedRoles={IT_ROLES}>
          <SystemConfig onLogout={handleLogout} user={currentUser} />
        </ProtectedRoute>
      } />

      {/* ACCESS DENIED ROUTE */}
      <Route 
        path="/access-denied" 
        element={<AccessDenied onLogout={handleLogout} />} 
      />

      {/* FALLBACK CATCH-ALL */}
      <Route path="*" element={<Navigate to={currentUser ? getRoleBasedHome(currentUser.role) : "/"} />} />
    </Routes>
  );
}

const rootElement = document.getElementById('root');
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