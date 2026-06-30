// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, children }) {
  // 1. Check if the user is logged in (you can expand this later to check specific roles)
  if (!user) {
    // 2. If no user, redirect them to the login page.
    // The "replace" prop is crucial here: it replaces the current history entry
    // so they can't click the "Back" button to bypass the login screen.
    return <Navigate to="/login" replace />;
  }

  // 3. If they are logged in, render the requested page (the children).
  return children;
}