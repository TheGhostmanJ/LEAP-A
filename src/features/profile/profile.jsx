import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

// Sidebars
import Sidebar from '../../components/sidebar.jsx';
import HodSidebar from '../../components/hod-sidebar.jsx';
import HrSidebar from '../../components/hr-sidebar.jsx';
import ItSidebar from '../../components/it-sidebar.jsx';

// Shared Components
import Header from '../../components/Header.jsx';

import './profile.css';

export default function MyProfile({ onLogout, user, onUserUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        civil_status: '',
        contact_number: '',
        email: ''
    });

    // Permission check: Only HR Admin and Super Admin can edit restricted fields like Name
    const canEditName = user?.role === 'HR Admin' || user?.role === 'Super Admin';

    // Synchronize state with user prop changes
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                middle_name: user.middle_name || '',
                last_name: user.last_name || '',
                civil_status: user.civil_status || '',
                contact_number: user.contact_number || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                middle_name: user.middle_name || '',
                last_name: user.last_name || '',
                civil_status: user.civil_status || '',
                contact_number: user.contact_number || '',
                email: user.email || ''
            });
        }
    };

    const handleUpdate = async () => {
        if (!user?.employee_key) {
            alert("Error: No employee session found.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            setIsSubmitting(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/profile/${user.employee_key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedData = await response.json().catch(() => null);
                if (onUserUpdate) {
                    onUserUpdate(updatedData || { ...user, ...formData });
                }
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Server rejected the update.");
            }
        } catch (err) {
            alert("Failed to update profile: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatFullName = (first, last) => {
        return `${first || ''} ${last || ''}`.trim() || 'Employee Name';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return isNaN(date.getTime())
            ? '—'
            : date.toLocaleDateString(undefined, { timeZone: 'UTC' });
    };

    const renderSidebar = () => {
        switch (user?.role) {
            case 'Super Admin':
                return <ItSidebar user={user} />;
            case 'HR Admin':
                return <HrSidebar user={user} />;
            case 'Department Head':
                return <HodSidebar user={user} />;
            default:
                return <Sidebar user={user} />;
        }
    };

    return (
        <div className="profile-page-container">
            {renderSidebar()}

            <main className="profile-main-content">
                <header className="profile-top-bar">
                    <div className="profile-top-title">
                        <h2>My Profile</h2>
                    </div>
                    <Header user={user} onLogout={onLogout} />
                </header>

                <div className="profile-hero-card">
                    <div className="profile-identity-group">
                        <div className="avatar-wrapper">
                            <div className="avatar-circle">
                                <span className="avatar-initials">
                                    {formData.first_name?.[0]?.toUpperCase() || ''}
                                    {formData.last_name?.[0]?.toUpperCase() || ''}
                                </span>
                            </div>
                            <div className="avatar-edit-overlay" title="Change profile picture">
                                <Camera size={14} />
                            </div>
                        </div>
                        <div className="identity-details">
                            <h1>{formatFullName(formData.first_name, formData.last_name)}</h1>
                            <div className="identity-meta-row">
                                {user?.position_title && (
                                    <span className="position-tag">{user.position_title}</span>
                                )}
                                {user?.department && (
                                    <span className="department-tag">{user.department}</span>
                                )}
                                <span className="status-badge-active">Active Employee</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-sections-grid">
                    <div className="info-card">
                        <div className="info-card-header">
                            <h3>Personal Information</h3>
                        </div>
                        <div className="data-fields-list">
                            <div className="data-field-item">
                                <span className="field-label">Employee ID</span>
                                <span className="field-value">{user?.employee_id || '—'}</span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">First Name</span>
                                {isEditing && canEditName ? (
                                    <input
                                        className="field-input"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                ) : (
                                    <span className="field-value">{formData.first_name || '—'}</span>
                                )}
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Middle Name</span>
                                {isEditing && canEditName ? (
                                    <input
                                        className="field-input"
                                        value={formData.middle_name}
                                        onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                                    />
                                ) : formData.middle_name ? (
                                    <span className="field-value">{formData.middle_name}</span>
                                ) : (
                                    <span className="unset-pill">None</span>
                                )}
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Last Name</span>
                                {isEditing && canEditName ? (
                                    <input
                                        className="field-input"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                ) : (
                                    <span className="field-value">{formData.last_name || '—'}</span>
                                )}
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Date of Birth</span>
                                <span className="field-value">
                                    {formatDate(user?.date_of_birth)}
                                </span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Gender</span>
                                <span className="field-value">{user?.gender || '—'}</span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Civil Status</span>
                                {isEditing ? (
                                    <select
                                        className="field-input"
                                        value={formData.civil_status}
                                        onChange={(e) => setFormData({ ...formData, civil_status: e.target.value })}
                                    >
                                        <option value="">Select Civil Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Widowed">Widowed</option>
                                        <option value="Separated">Separated</option>
                                    </select>
                                ) : formData.civil_status ? (
                                    <span className="field-value">{formData.civil_status}</span>
                                ) : (
                                    <span className="unset-pill">Not Set</span>
                                )}
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Contact No.</span>
                                {isEditing ? (
                                    <input
                                        className="field-input"
                                        value={formData.contact_number}
                                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value.replace(/[^0-9+]/g, '') })}
                                    />
                                ) : formData.contact_number ? (
                                    <span className="field-value">{formData.contact_number}</span>
                                ) : (
                                    <span className="unset-pill">Not Set</span>
                                )}
                            </div>

                            <div className="data-field-item full-width">
                                <span className="field-label">Email Address</span>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        className="field-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                ) : formData.email ? (
                                    <span className="field-value">{formData.email}</span>
                                ) : (
                                    <span className="unset-pill">Not Set</span>
                                )}
                            </div>
                        </div>

                        <div className="profile-card-footer">
                            <button
                                onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                                className="btn-primary-maroon"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Edit Details"}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={handleCancel}
                                    className="btn-secondary-cancel"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-card-header">
                            <h3>Employment Information</h3>
                        </div>
                        <div className="data-fields-list">
                            <div className="data-field-item">
                                <span className="field-label">Position</span>
                                <span className="field-value">{user?.position_title || '—'}</span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Department</span>
                                <span className="field-value">{user?.department || '—'}</span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Salary Grade</span>
                                <span className="field-value">{user?.salary_grade || '—'}</span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Employment Type</span>
                                <span className="field-value">{user?.employment_type || '—'}</span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">CS Eligibility</span>
                                {user?.civil_service ? (
                                    <span className="field-value">{user.civil_service}</span>
                                ) : (
                                    <span className="unset-pill">None</span>
                                )}
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Date Hired</span>
                                <span className="field-value">
                                    {formatDate(user?.hire_date)}
                                </span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Years of Service</span>
                                <span className="field-value">{user?.years_of_service ?? '—'}</span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="info-card">
                    <div className="info-card-header">
                        <h3>Account Security</h3>
                    </div>
                    <div className="data-fields-list">
                        <div className="data-field-item">
                            <span className="field-label">Account Username</span>
                            <span className="field-value">{user?.username || '—'}</span>
                        </div>
                        <div className="data-field-item">
                            <span className="field-label">System Access Level</span>
                            <span className="field-value">{user?.role || 'Standard User'}</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}