import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import './access-denied.css';

export default function AccessDenied({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="access-denied-wrapper">
      <div className="access-denied-card card-shadow-wrap">
        
        <div className="alert-icon-container">
          <ShieldAlert size={64} className="shield-icon" />
        </div>
        
        <h1 className="access-title">Access Restricted</h1>
        
        <p className="access-description">
          Your account does not have the necessary permissions to view this page, or your system access has been disabled. 
        </p>
        
        <div className="access-advisory-box">
          <strong>Note:</strong> If you believe this is an error, please contact the City Personnel Office or your IT Administrator to adjust your <em>system_access_level</em>.
        </div>

        <div className="access-action-row">
          <button className="action-btn-investigate btn-flex" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </button>
          
          <button className="action-btn-red btn-flex" onClick={onLogout}>
            <LogOut size={16} /> Log Out
          </button>
        </div>

      </div>
    </div>
  );
}