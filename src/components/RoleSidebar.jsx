// src/components/RoleSidebar.jsx
import React from 'react';
import Sidebar from './sidebar.jsx';
import HrSidebar from './hr-sidebar.jsx';
import HodSidebar from './hod-sidebar.jsx';
import ItSidebar from './it-sidebar.jsx';

export default function RoleSidebar(props) {
  const { user } = props;

  if (!user) return <Sidebar {...props} />;

  switch (user.role) {
    case 'HR Admin':
      return <HrSidebar {...props} />;
    case 'Department Head':
      return <HodSidebar {...props} />;
    case 'Super Admin':
      return <ItSidebar {...props} />;
    case 'Restricted Self-Service':
    case 'Employee Self-Service':
    default:
      // Both self-service tiers share the standard sidebar —
      // sidebar.jsx filters its own nav items based on user.role
      return <Sidebar {...props} />;
  }
}