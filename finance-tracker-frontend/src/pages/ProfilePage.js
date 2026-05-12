import React, { useState } from 'react';
import './ProfilePage.css';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/api';
import { FiCamera, FiSave, FiLogOut } from 'react-icons/fi';

const ProfilePage = () => {
    const { user, logout } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        currency: user?.currency || 'USD'
    });

    const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || 'https://via.placeholder.com/150');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show local preview
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);

        // Upload to server
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setLoading(true);
            const res = await userService.uploadProfilePicture(uploadData);
            setSuccess('Profile picture updated!');
            // Update local storage/store
            const updatedUser = { ...user, profilePicture: res.data.profilePicture };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to upload photo');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await userService.updateProfile(formData);
            setSuccess('Profile updated successfully!');
            // Update local storage
            localStorage.setItem('user', JSON.stringify(res.data));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getFullImageUrl = (path) => {
        if (!path) return 'https://ui-avatars.com/api/?name=' + user?.username + '&background=random';
        if (path.startsWith('http')) return path;
        return 'http://localhost:8080' + path;
    };

    return (
        <div className="profile-page animate-in">
            <header className="page-header">
                <h1>Profile Settings</h1>
                <p>Manage your account identity and preferences</p>
            </header>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="profile-layout">
                <div className="profile-sidebar card">
                    <div className="avatar-container">
                        <img 
                            src={previewUrl.startsWith('data') ? previewUrl : getFullImageUrl(user?.profilePicture)} 
                            alt="Profile" 
                            className="profile-avatar"
                        />
                        <label className="photo-upload-label">
                            <FiCamera />
                            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <h2 className="profile-name">{user?.firstName} {user?.lastName}</h2>
                    <p className="profile-role">Account Type: {user?.role}</p>
                    
                    <button className="btn btn-danger btn-logout" onClick={logout}>
                        <FiLogOut /> Logout
                    </button>
                </div>

                <div className="profile-main card">
                    <form onSubmit={handleUpdateProfile}>
                        <h3>Identity Settings</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input 
                                    className="form-input" 
                                    name="firstName" 
                                    value={formData.firstName} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input 
                                    className="form-input" 
                                    name="lastName" 
                                    value={formData.lastName} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address (Read Only)</label>
                            <input className="form-input" value={user?.email || ''} readOnly disabled />
                            <small className="help-text">Email cannot be changed for security reasons.</small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Primary Currency</label>
                            <select 
                                className="form-select" 
                                name="currency" 
                                value={formData.currency} 
                                onChange={handleInputChange}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="INR">INR (₹)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>

                        <div className="form-actions mt-24">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
