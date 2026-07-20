import React, { useState, useEffect } from 'react';
import { User, Bell } from 'lucide-react';

// 1. IMPORT ALL SIDEBAR VARIATIONS
import Sidebar from '../../components/sidebar.jsx';
import HodSidebar from '../../components/hod-sidebar.jsx';
import HrSidebar from '../../components/hr-sidebar.jsx';
import ItSidebar from '../../components/it-sidebar.jsx';

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

        // VALIDATION: Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/profile/${user.employee_key}`, {
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

    const inputStyle = {
        padding: '4px 8px',
        width: '100%',
        maxWidth: '280px',
        borderRadius: '4px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        color: '#111827',
        fontFamily: 'inherit'
    };

    const formatFullName = (first, last) => {
        return `${first || ''} ${last || ''}`.trim() || 'Employee Name';
    };

    // 2. DYNAMIC SIDEBAR HELPER FUNCTION
    const renderSidebar = () => {
        switch (user?.role) {
            case 'Super Admin':
                return <ItSidebar />;
            case 'HR Admin':
                return <HrSidebar />;
            case 'Department Head':
                return <HodSidebar />;
            default:
                return <Sidebar />; // Standard employee fallback
        }
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f4', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* 3. INJECT THE DYNAMIC SIDEBAR HERE */}
            {renderSidebar()}

            <main className="dashboard-main-content" style={{ flex: 1, padding: '32px', boxSizing: 'border-box', overflowY: 'auto' }}>
                
                {/* --- TOP HEADER --- */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #7a0000', borderRadius: '50%', padding: '2px' }}>
                            <User size={18} style={{ color: '#7a0000' }} />
                        </div>
                        <h2 style={{ margin: 0, padding: 0, fontSize: '24px', fontWeight: 700, color: '#1a202c', lineHeight: 1 }}>
                            My Profile
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', backgroundColor: '#7a0000', borderRadius: '8px', overflow: 'hidden' }}>
                            <button style={{ backgroundColor: 'transparent', border: 'none', padding: '8px 12px', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Bell size={18} />
                            </button>
                            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                                <User size={16} />
                                <span>{formatFullName(user?.first_name, user?.last_name)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={onLogout}
                            style={{ backgroundColor: '#fff', border: '1px solid #7a0000', color: '#7a0000', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                {/* --- MAIN PROFILE CARD --- */}
                <div style={{ 
                    background: '#ffffff', 
                    borderRadius: '12px', 
                    padding: '40px', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', 
                    borderBottom: '10px solid #4a080e',
                    marginBottom: '16px' 
                }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                        <div style={{ width: '110px', height: '110px', borderRadius: '50%', border: '4px solid #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', backgroundColor: '#f9fafb', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                            <User size={64} strokeWidth={2} />
                        </div>
                        <div>
                            <h1 style={{ color: '#7a0000', fontSize: '32px', margin: '0 0 8px 0', fontWeight: '800' }}>
                                {formatFullName(formData.first_name, formData.last_name)}
                            </h1>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>{user?.position_title || ''}</div>
                            <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>{user?.department || ''}</div>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 32px 0' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '32px' }}>
                        
                        {/* Left Column: Personal Information */}
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#7a0000', fontSize: '18px', fontWeight: '700', margin: 0 }}>Personal Information</h3>
                            </div>
                            
                            <table style={{ width: '100%', fontSize: '14px', color: '#374151', lineHeight: '32px' }}>
                                <tbody>
                                    <tr><td style={{ width: '140px' }}>Employee ID:</td><td style={{ fontWeight: '500' }}>{user?.employee_id || ''}</td></tr>
                                    
                                    {/* Name Fields */}
                                    <tr><td>First Name:</td><td>{isEditing ? <input style={inputStyle} value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} /> : <span style={{ fontWeight: '500' }}>{formData.first_name}</span>}</td></tr>
                                    <tr><td>Middle Name:</td><td>{isEditing ? <input style={inputStyle} value={formData.middle_name} onChange={(e) => setFormData({...formData, middle_name: e.target.value})} /> : <span style={{ fontWeight: '500' }}>{formData.middle_name || 'None'}</span>}</td></tr>
                                    <tr><td>Last Name:</td><td>{isEditing ? <input style={inputStyle} value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} /> : <span style={{ fontWeight: '500' }}>{formData.last_name}</span>}</td></tr>

                                    {/* Read Only Status */}
                                    <tr><td>Date of Birth:</td><td style={{ fontWeight: '500' }}>{user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : ''}</td></tr>
                                    <tr><td>Gender:</td><td style={{ fontWeight: '500' }}>{user?.gender || ''}</td></tr>
                                    <tr><td>Civil Status:</td><td style={{ fontWeight: '500' }}>{formData.civil_status || 'Not Set'}</td></tr>

                                    {/* Validated Fields */}
                                    <tr>
                                        <td>Contact No.:</td>
                                        <td>{isEditing ? <input style={inputStyle} value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value.replace(/[^0-9]/g, '')})} /> : <span style={{ fontWeight: '500' }}>{formData.contact_number || 'Not Set'}</span>}</td>
                                    </tr>
                                    <tr>
                                        <td>Email:</td>
                                        <td>{isEditing ? <input type="email" style={inputStyle} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /> : <span style={{ fontWeight: '500' }}>{formData.email || 'Not Set'}</span>}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => isEditing ? handleUpdate() : setIsEditing(true)} style={{ padding: '8px 16px', background: '#5a0000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                                    {isEditing ? "Save Changes" : "Edit Details"}
                                </button>
                                {isEditing && <button onClick={handleCancel} style={{ padding: '8px 16px', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Cancel</button>}
                            </div>
                        </div>

                        {/* Right Column: Employment Information */}
                        <div>
                            <h3 style={{ color: '#7a0000', fontSize: '18px', fontWeight: '700', margin: '0 0 20px 0' }}>Employment Information</h3>
                            <table style={{ width: '100%', fontSize: '14px', color: '#374151', lineHeight: '32px' }}>
                                <tbody>
                                    <tr><td style={{ width: '140px' }}>Position:</td><td style={{ fontWeight: '500' }}>{user?.position_title || ''}</td></tr>
                                    <tr><td>Department:</td><td style={{ fontWeight: '500' }}>{user?.department || ''}</td></tr>
                                    <tr><td>Salary Grade:</td><td style={{ fontWeight: '500' }}>{user?.salary_grade || ''}</td></tr>
                                    <tr><td>Employment Type:</td><td style={{ fontWeight: '500' }}>{user?.employment_type || ''}</td></tr>
                                    <tr><td>CS Eligibility:</td><td style={{ fontWeight: '500' }}>{user?.civil_service || 'None'}</td></tr>
                                    <tr><td>Date Hired:</td><td style={{ fontWeight: '500' }}>{user?.hire_date ? new Date(user.hire_date).toLocaleDateString() : ''}</td></tr>
                                    <tr><td>Years of Service:</td><td style={{ fontWeight: '500' }}>{user?.years_of_service || ''}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 32px 0' }} />

                    <div>
                        <h3 style={{ color: '#7a0000', fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0' }}>Account Security</h3>
                        <div style={{ fontSize: '14px', color: '#374151', lineHeight: '24px' }}>
                            <div><strong>Account Username:</strong> {user?.username || ''}</div>
                            <div><strong>System Access Level:</strong> {user?.role || ''}</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}