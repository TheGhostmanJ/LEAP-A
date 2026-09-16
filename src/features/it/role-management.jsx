import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Search, 
  UserCog, 
  Save, 
  AlertTriangle, 
  Users, 
  UserCheck, 
  UserX,
  Check,
  RefreshCw
} from "lucide-react";
import ItSidebar from "../../components/it-sidebar.jsx";
import Header from "../../components/Header.jsx";
import "./role-management.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function RoleManagement({ onLogout, user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyDisabled, setOnlyDisabled] = useState(false);
  const [savedRowId, setSavedRowId] = useState(null);
  
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all user accounts from the database
  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error("Failed to load user accounts", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Update the dropdown state locally before saving
  const handleRoleChange = (username, newRole) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.username === username ? { ...acc, currentRole: newRole } : acc))
    );
  };

  // Push the role change to the PostgreSQL Database
  const handleSaveRole = async (username, newRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setSavedRowId(username);
        setTimeout(() => setSavedRowId(null), 2000); // Show checkmark for 2 seconds
      } else {
        alert("Failed to update role. Please try again.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Server error while updating role.");
    }
  };

  const toggleAuditDisabled = () => {
    setOnlyDisabled(!onlyDisabled);
  };

  // Filter accounts based on search and the audit toggle
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.dept.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (onlyDisabled) {
      return matchesSearch && (acc.status === "Suspended" || acc.currentRole === "Disabled");
    }
    return matchesSearch;
  });

  // Dynamic Metrics Calculation
  const totalUsers = accounts.length;
  // A user is considered active if their employee record is active AND they aren't assigned the "Disabled" role
  const activeUsers = accounts.filter((a) => a.status === "Active" && a.currentRole !== "Disabled").length;
  const suspendedUsers = totalUsers - activeUsers;

  return (
    <div className="rbac-container">
      {/* SIDEBAR */}
      <ItSidebar user={user} />

      {/* MAIN CONTENT AREA */}
      <main className="rbac-main-content fade-in-up">
        
        {/* STANDARDIZED HEADER BLOCK */}
        <header className="tr-header">
          <div className="tr-header-title">
            <span className="tr-header-badge">
              <span className="tr-badge-dot"></span> IT OPERATIONS PORTAL
            </span>
            <h2>
              <span className="tr-title-dark">Role Management </span>
              <span className="tr-title-maroon">(RBAC)</span>
            </h2>
          </div>

          <Header user={user} onLogout={onLogout} />
        </header>

        {/* METRICS ROW */}
        <div className="rbac-stat-row">
          <div className="rbac-stat-card">
            <div className="rbac-stat-icon-box maroon">
              <Users size={22} />
            </div>
            <div className="rbac-stat-info">
              <span className="rbac-stat-label">TOTAL ACCOUNTS</span>
              <span className="rbac-stat-value">{isLoading ? "..." : totalUsers} Users</span>
              <span className="rbac-stat-sub">Provisioned system identities</span>
            </div>
          </div>

          <div className="rbac-stat-card">
            <div className="rbac-stat-icon-box green">
              <UserCheck size={22} />
            </div>
            <div className="rbac-stat-info">
              <span className="rbac-stat-label">ACTIVE ROLES</span>
              <span className="rbac-stat-value">{isLoading ? "..." : activeUsers} Active</span>
              <span className="rbac-stat-sub">Granted system clearance</span>
            </div>
          </div>

          <div className="rbac-stat-card">
            <div className="rbac-stat-icon-box amber">
              <UserX size={22} />
            </div>
            <div className="rbac-stat-info">
              <span className="rbac-stat-label">SUSPENDED / DISABLED</span>
              <span className="rbac-stat-value">{isLoading ? "..." : suspendedUsers} Accounts</span>
              <span className="rbac-stat-sub">Restricted system privileges</span>
            </div>
          </div>
        </div>

        {/* TOOLBAR AND SEARCH */}
        <div className="rbac-utilities-row">
          <div className="rbac-search-wrapper">
            <Search size={18} className="rbac-search-icon" />
            <input
              type="text"
              className="rbac-search-input"
              placeholder="Search employee ID, name, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className={`rbac-audit-btn ${onlyDisabled ? "active" : ""}`}
            onClick={toggleAuditDisabled}
          >
            <AlertTriangle size={16} />
            <span>{onlyDisabled ? "Showing Disabled Accounts" : "Audit Disabled Accounts"}</span>
          </button>
        </div>

        {/* ACCESS CONTROL TABLE CARD */}
        <div className="rbac-card">
          <div className="rbac-card-header">
            <div className="rbac-header-title-group">
              <Shield size={18} />
              <span>System Access Level Assignments</span>
            </div>
            <span className="rbac-active-count">
              Showing {filteredAccounts.length} of {totalUsers} accounts
            </span>
          </div>

          <div className="rbac-card-body">
            {isLoading ? (
              <div className="rbac-empty-state">
                <RefreshCw size={32} className="spin" style={{ color: '#9ca3af', marginBottom: '12px' }} />
                <p>Loading security roles...</p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="rbac-empty-state">
                <UserCog size={32} />
                <p>No user accounts found matching query "{searchTerm}"</p>
              </div>
            ) : (
              <div className="rbac-table-wrapper">
                <table className="rbac-table">
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Account Name</th>
                      <th>Department</th>
                      <th>Account Status</th>
                      <th>System Access Level (Role)</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((acc) => (
                      <tr key={acc.username}>
                        <td className="rbac-emp-id">{acc.id}</td>
                        <td className="rbac-user-name">{acc.name}</td>
                        <td className="rbac-dept">{acc.dept}</td>
                        <td>
                          <span className={`rbac-status-badge ${acc.status === "Active" && acc.currentRole !== 'Disabled' ? "active" : "suspended"}`}>
                            {acc.status === "Active" && acc.currentRole !== 'Disabled' ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td>
                          <select
                            className="rbac-role-select"
                            value={acc.currentRole}
                            onChange={(e) => handleRoleChange(acc.username, e.target.value)}
                          >
                            <option value="Employee Self-Service">Employee Self-Service</option>
                            <option value="Restricted Self-Service">Restricted Self-Service</option>
                            <option value="Department Head">Department Head</option>
                            <option value="HR Admin">HR Admin</option>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Disabled">Disabled</option>
                          </select>
                        </td>
                        <td className="text-center">
                          <button
                            className={`rbac-update-btn ${savedRowId === acc.username ? "saved" : ""}`}
                            onClick={() => handleSaveRole(acc.username, acc.currentRole)}
                          >
                            {savedRowId === acc.username ? (
                              <>
                                <Check size={14} /> Saved
                              </>
                            ) : (
                              <>
                                <Save size={14} /> Update
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}