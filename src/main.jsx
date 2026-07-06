import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import features
import Login from "./features/auth/Login.jsx";
import Dashboard from './features/dashboard/dashboard.jsx';
import HodDashboard from './features/dashboard/hod-dashboard.jsx';
import Attendance from './features/attendance/attendance.jsx';
import LeaveHistory from './features/leave/leavehistory.jsx';
import CreditLedger from './features/ledger/creditledger.jsx';
import TrainingRecords from './features/training/trainingrecords.jsx';
import Profile from './features/profile/profile.jsx';
import Support from './features/support/support.jsx';

import LeaveApprovals from './features/leave/leave-approvals.jsx';
import WorkforceForecast from './features/workforce/workforce-forecast.jsx';
import AnomalyAlert from './features/anomaly/anomaly-alert.jsx';
import DepartmentReports from './features/reports/department-reports.jsx';
import HodProfile from './features/profile/hod-profile.jsx';

import './index.css';

function Root() {
  // Core Session Initializer
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

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.clear(); // Wipe storage clean on explicit logout
  };

  // Helper helper to determine where a user should land based on their role
  const getLandingPage = (user) => {
    if (!user) return "/";
    return user.role === 'hod' ? "/hod-dashboard" : "/dashboard";
  };

  return (
    <Routes>
      {/* AUTHENTICATION ROUTE */}
      <Route
        path="/"
        element={!currentUser ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to={getLandingPage(currentUser)} />}
      />

      {/* PROTECTED FEATURE ROUTES (EMPLOYEE) */}
      <Route
        path="/dashboard"
        element={currentUser ? <Dashboard onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/attendance"
        element={currentUser ? <Attendance onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/leavehistory"
        element={currentUser ? <LeaveHistory onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/creditledger"
        element={currentUser ? <CreditLedger onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/trainingrecords"
        element={currentUser ? <TrainingRecords onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/profile"
        element={currentUser ? <Profile onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/support"
        element={currentUser ? <Support onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />

      {/* PROTECTED FEATURE ROUTES (HOD EXCLUSIVE) */}
      <Route
        path="/hod-dashboard"
        element={currentUser && currentUser.role === 'hod' ? <HodDashboard onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/leave-approvals"
        element={currentUser && currentUser.role === 'hod' ? <LeaveApprovals onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/workforce-forecast"
        element={currentUser && currentUser.role === 'hod' ? <WorkforceForecast onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/anomaly-alerts"
        element={currentUser && currentUser.role === 'hod' ? <AnomalyAlert onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/department-reports"
        element={currentUser && currentUser.role === 'hod' ? <DepartmentReports onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />

      {/* 🛑 FALLBACK CATCH-ALL (MUST BE PLACED LAST HERE) */}
      <Route path="*" element={<Navigate to={getLandingPage(currentUser)} />} />

      <Route
        path="/hod-profile"
        element={currentUser && currentUser.role === 'hod' ? <HodProfile onLogout={handleLogout} user={currentUser} /> : <Navigate to="/" />}
      />

    </Routes>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);