// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Component Imports
import Login from './login.jsx'; // Added missing import!
import Dashboard from './dashboard.jsx';   
import Attendance from './attendance.jsx'; 
import LeaveHistory from './leavehistory.jsx'; 
import CreditLedger from './creditledger.jsx'; 
import TrainingRecords from './trainingrecords.jsx'; 
import Profile from './profile.jsx'; 
import Support from './support.jsx'; 

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={<Login setLoggedInUser={setLoggedInUser} />} 
        />

        {/* If they try to access the root "/", 
          redirect them to the dashboard if logged in, otherwise to login. 
        */}
        <Route 
          path="/" 
          element={loggedInUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />

        {/* Private / App Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave-history" element={<LeaveHistory />} />
        <Route path="/credit-ledger" element={<CreditLedger />} />
        <Route path="/training-records" element={<TrainingRecords />} />
        <Route path="/profile" element={<Profile user={loggedInUser} />} />
        <Route path="/support" element={<Support />} />
        
        {/* Fallback 404 Route */}
        <Route 
          path="*" 
          element={<div style={{ padding: '20px', color: 'red' }}>Error: Page not found.</div>} 
        />
      </Routes>
    </Router>
  );
}