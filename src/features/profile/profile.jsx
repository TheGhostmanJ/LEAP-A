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
    
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        civil_status: '',
        contact_number: '',
        email: ''
    });

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
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            
            const response = await fetch(`${apiUrl}/api/profile/${user.employee_key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
                
            if (response.ok) {
                onUserUpdate(formData);
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                throw new Error("Server rejected the update.");
            }
        } catch (err) {
            alert("Failed to update profile: " + err.message);
        }
    };

    const formatFullName = (first, last) => {
        return `${first || ''} ${last || ''}`.trim() || 'Employee Name';
    };

    const renderSidebar = () => {
        switch (user?.role) {
            case 'Super Admin':
                return <ItSidebar />;
            case 'HR Admin':
                return <HrSidebar />;
            case 'Department Head':
                return <HodSidebar />;
            default:
                return <Sidebar />;
        }
    };

    return (
        <div className="profile-page-container">
            {renderSidebar()}

            <main className="profile-main-content">
                
                {/* TOP HEADER */}
                <header className="profile-top-bar">
                    <div className="profile-top-title">
                        <h2>My Profile</h2>
                    </div>

                    {/* Shared Header Component */}
                    <Header user={user} onLogout={onLogout} />
                </header>

                {/* HERO BANNER */}
                <div className="profile-hero-card">
                    <div className="profile-identity-group">
                        <div className="avatar-wrapper">
                            <div className="avatar-circle">
                                <span className="avatar-initials">
                                    {formData.first_name?.[0] || ''}{formData.last_name?.[0] || ''}
                                </span>
                            </div>
                            <div className="avatar-edit-overlay">
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

                {/* INFORMATION GRID */}
                <div className="profile-sections-grid">
                    
                    {/* PERSONAL INFORMATION CARD */}
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
                                {isEditing ? (
                                    <input 
                                        className="field-input" 
                                        value={formData.first_name} 
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                                    />
                                ) : (
                                    <span className="field-value">{formData.first_name || '—'}</span>
                                )}
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Middle Name</span>
                                {isEditing ? (
                                    <input 
                                        className="field-input" 
                                        value={formData.middle_name} 
                                        onChange={(e) => setFormData({...formData, middle_name: e.target.value})} 
                                    />
                                ) : formData.middle_name ? (
                                    <span className="field-value">{formData.middle_name}</span>
                                ) : (
                                    <span className="unset-pill">None</span>
                                )}
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Last Name</span>
                                {isEditing ? (
                                    <input 
                                        className="field-input" 
                                        value={formData.last_name} 
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                                    />
                                ) : (
                                    <span className="field-value">{formData.last_name || '—'}</span>
                                )}
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Date of Birth</span>
                                <span className="field-value">
                                    {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : '—'}
                                </span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Gender</span>
                                <span className="field-value">{user?.gender || '—'}</span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Civil Status</span>
                                {formData.civil_status ? (
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
                                        onChange={(e) => setFormData({...formData, contact_number: e.target.value.replace(/[^0-9]/g, '')})} 
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
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
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
                            >
                                {isEditing ? "Save Changes" : "Edit Details"}
                            </button>
                            {isEditing && (
                                <button onClick={handleCancel} className="btn-secondary-cancel">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* EMPLOYMENT INFORMATION CARD */}
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
                                    {user?.hire_date ? new Date(user.hire_date).toLocaleDateString() : '—'}
                                </span>
                            </div>

                            <div className="data-field-item">
                                <span className="field-label">Years of Service</span>
                                <span className="field-value">{user?.years_of_service || '—'}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ACCOUNT SECURITY CARD */}
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