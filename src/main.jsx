import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import features
import Login from "./features/auth/Login.jsx"; 
import Dashboard from './features/dashboard/dashboard.jsx'; 
import Attendance from './features/attendance/attendance.jsx'; 
import LeaveHistory from './features/leave/leavehistory.jsx'; 
import CreditLedger from './features/ledger/creditledger.jsx';
import TrainingRecords from './features/training/trainingrecords.jsx';
import Profile from './features/profile/profile.jsx';
import Support from './features/support/support.jsx';

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

  return (
    <Routes>
      {/* AUTHENTICATION ROUTE */}
      <Route 
        path="/" 
        element={!currentUser ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />} 
      />
      
      {/* PROTECTED FEATURE ROUTES */}
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

      {/* FALLBACK CATCH-ALL */}
      <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/"} />} />
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