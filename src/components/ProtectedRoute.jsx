// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { canAccessView } from './config/permissions';

export default function ProtectedRoute({ user, requiredView, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredView && !canAccessView(user.role, requiredView)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}