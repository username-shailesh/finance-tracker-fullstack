import React, { useState } from 'react';
import './ProfilePage.css';
import { useAuthStore } from '../stores/authStore';
import { userService, API_BASE_URL } from '../services/api';
import { FiCamera, FiSave, FiLogOut } from 'react-icons/fi';

const ProfilePage = () => {
    const { user, logout, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    
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

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check maximum size: 5MB (5 * 1024 * 1024)
        if (file.size > 5242880) {
            setError('File is too large. Maximum allowed size is 5MB.');
            setTimeout(() => setError(''), 4000);
            return;
        }

        // Check minimum size: 20KB (20 * 1024)
        if (file.size < 20480) {
            setError('File is too small. Minimum allowed size is 20KB.');
            setTimeout(() => setError(''), 4000);
            return;
        }

        // Clear previous notifications
        setError('');
        setSuccess('');

        // Store selected file for saving manually later
        setSelectedFile(file);

        // Show local preview
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);

        setSuccess('Photo selected! Click "Save Changes" below to save it permanently.');
        setTimeout(() => setSuccess(''), 4000);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            let updatedUser = { ...user };

            // 1. If there's a selected photo, upload it now
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);
                const resPic = await userService.uploadProfilePicture(uploadData);
                updatedUser.profilePicture = resPic.data.profilePicture;
            }

            // 2. Update remaining details
            const resProfile = await userService.updateProfile(formData);
            
            // Merge response data
            updatedUser = {
                ...updatedUser,
                firstName: resProfile.data.firstName,
                lastName: resProfile.data.lastName,
                currency: resProfile.data.currency
            };

            // 3. Save to auth store dynamically (updates UI in real-time)
            updateUser(updatedUser);

            setSuccess('Profile updated successfully!');
            setSelectedFile(null);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
        setDeletePassword('');
        setDeleteError('');
        setDeleteSuccess('');
    };

    const confirmDeleteAccount = async (e) => {
        e.preventDefault();
        if (!deletePassword.trim()) {
            setDeleteError('Password is required.');
            return;
        }
        
        try {
            setLoading(true);
            setDeleteError('');
            await userService.deleteAccount(deletePassword);
            setDeleteSuccess('Your account has been permanently deleted. Redirecting...');
            setTimeout(() => {
                setShowDeleteModal(false);
                logout();
            }, 3000);
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Incorrect password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getFullImageUrl = (path) => {
        if (!path) return 'https://ui-avatars.com/api/?name=' + user?.username + '&background=random';
        if (path.startsWith('http')) return path;
        
        // Normalize path by removing the duplicate/outdated '/api' prefix if present
        let cleanPath = path;
        if (cleanPath.startsWith('/api/')) {
            cleanPath = cleanPath.substring(4);
        }
        return API_BASE_URL + cleanPath;
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

                    <div className="danger-zone" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                        <h3 style={{ color: 'var(--danger)' }}>Danger Zone</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Once you delete your account, there is no going back. All your expenses, budgets, and insights will be permanently erased.
                        </p>
                        <button 
                            type="button" 
                            className="btn btn-danger" 
                            onClick={handleDeleteAccount} 
                            disabled={loading}
                        >
                            Permanently Delete Account
                        </button>
                    </div>
                </div>
            </div>
            
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-in">
                        <h3>Confirm Account Deletion</h3>
                        <p className="modal-description">
                            To permanently delete your account, please enter your current password. This action cannot be undone and all your expenses, budgets, and history will be lost.
                        </p>
                        
                        {deleteError && <div className="modal-error">{deleteError}</div>}
                        {deleteSuccess && <div className="modal-success">{deleteSuccess}</div>}
                        
                        <form onSubmit={confirmDeleteAccount}>
                            <input 
                                type="password" 
                                className="modal-input" 
                                placeholder="Enter your password" 
                                value={deletePassword} 
                                onChange={(e) => setDeletePassword(e.target.value)}
                                disabled={loading || deleteSuccess}
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={loading || deleteSuccess}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-danger" 
                                    disabled={loading || deleteSuccess}
                                >
                                    {loading ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
