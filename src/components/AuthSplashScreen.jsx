// src/components/AuthSplashScreen.jsx
import React, { useState, useEffect } from 'react';
import './AuthSplashScreen.css';

export default function AuthSplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [roleTitle, setRoleTitle] = useState('Workspace');

  useEffect(() => {
    // 1. Automatically grab the logged-in user's role from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Supports formats like user.role, user.role_name, or user.user_type
        const rawRole = parsed?.role || parsed?.role_name || parsed?.user_type || '';
        
        if (rawRole) {
          // Formats 'hod' to 'HOD', 'hr' to 'HR', 'it' to 'IT', 'employee' to 'Employee'
          const formattedRole = rawRole.length <= 3 
            ? rawRole.toUpperCase() 
            : rawRole.charAt(0).toUpperCase() + rawRole.slice(1);
            
          setRoleTitle(`${formattedRole} Portal`);
        }
      }
    } catch (err) {
      console.log('Using default workspace title');
    }

    // 2. Start fading out slightly before removing
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    // 3. Complete transition
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`auth-splash-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="auth-splash-content">
        <img src="/leaplogo.png" alt="LEAP-A Logo" className="splash-logo" />
        <div className="splash-spinner"></div>
        <p className="splash-text">Welcome back! Authenticating {roleTitle}...</p>
      </div>
    </div>
  );
}