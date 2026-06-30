import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Sidebar from '../../components/sidebar.jsx';
import './profile.css';

export default function MyProfile({ onLogout, user }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    
    // Initialize with empty strings to keep input elements "controlled"
    const [formData, setFormData] = useState({
        full_name: '',
        civil_status: '',
        contact_number: '',
        email: ''
    });

    // Synchronize state when the user prop changes
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                civil_status: user.civil_status || '',
                contact_number: user.contact_number || '', 
                email: user.email || ''                    
            });
        }
    }, [user]);

    // Revert changes if user cancels editing
    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                full_name: user.full_name || '',
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

        try {
            const response = await fetch(`http://localhost:3001/api/profile/${user.employee_key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            if (response.ok) {
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                throw new Error("Server rejected the update.");
            }
        } catch (err) {
            alert("Failed to update profile: " + err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="dashboard-main-content">
                {/* Back Link to Dashboard */}
                <button 
                    onClick={() => navigate('/dashboard')} 
                    style={{ background: 'none', border: 'none', color: '#5a0000', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
                >
                    ← Back to Dashboard
                </button>

                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ color: '#5a0000', marginTop: 0, marginBottom: '20px' }}>Personal Information</h3>
                    
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 15px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '150px', fontWeight: '600' }}>Full Name:</td>
                                <td>
                                    {isEditing ? (
                                        <input style={{ padding: '6px', width: '100%', maxWidth: '300px' }} value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                                    ) : (
                                        formData.full_name || <em style={{ color: '#aaa' }}>Not Set</em>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: '600' }}>Civil Status:</td>
                                <td>
                                    {isEditing ? (
                                        <input style={{ padding: '6px', width: '100%', maxWidth: '300px' }} value={formData.civil_status} onChange={(e) => setFormData({...formData, civil_status: e.target.value})} />
                                    ) : (
                                        formData.civil_status || <em style={{ color: '#aaa' }}>Not Set</em>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: '600' }}>Contact No.:</td>
                                <td>
                                    {isEditing ? (
                                        <input style={{ padding: '6px', width: '100%', maxWidth: '300px' }} value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value})} />
                                    ) : (
                                        formData.contact_number || <em style={{ color: '#aaa' }}>Not Set</em>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: '600' }}>Email:</td>
                                <td>
                                    {isEditing ? (
                                        <input style={{ padding: '6px', width: '100%', maxWidth: '300px' }} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                    ) : (
                                        formData.email || <em style={{ color: '#aaa' }}>Not Set</em>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                            style={{ padding: '10px 20px', background: '#5a0000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            {isEditing ? "Save Changes" : "Edit Profile"}
                        </button>

                        {isEditing && (
                            <button 
                                onClick={handleCancel}
                                style={{ padding: '10px 20px', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}