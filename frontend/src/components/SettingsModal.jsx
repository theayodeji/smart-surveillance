import React, { useState, useEffect } from 'react';
import { Settings, Edit, X, Check } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, userEmail }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [alertEmail, setAlertEmail] = useState(userEmail || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch user settings when modal opens
    if (isOpen) {
      fetchUserSettings();
    }
  }, [isOpen]);

  const fetchUserSettings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        throw new Error('User not found in local storage');
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/settings/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch settings');
      }
      
      const data = await response.json();
      setEmailAlerts(data.emailAlerts);
      setAlertEmail(data.alertEmail || userEmail);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ text: error.message || 'Failed to load settings', type: 'error' });
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ text: '', type: '' });
    
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
      setMessage({ text: 'User not found in local storage', type: 'error' });
      return;
    }
    
    // Validate passwords if changing
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        return;
      }
      if (newPassword.length < 6) {
        setErrors({ newPassword: 'Password must be at least 6 characters' });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/settings/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
          emailAlerts,
          alertEmail: isEditingEmail ? alertEmail : undefined
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }
      
      setMessage({ text: 'Settings updated successfully', type: 'success' });
      
      // Reset form if password was changed
      if (newPassword) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
      
      // Close email edit mode
      setIsEditingEmail(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Account Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          </div>
          
          {message.text && (
            <div className={`mb-4 p-3 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSaveSettings}>
            <div className="space-y-6">
              {/* Email Alerts Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                  <p className="text-xs text-gray-500">Receive email alerts for security events</p>
                </div>
                <button
                  type="button"
                  className={`${
                    emailAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => setEmailAlerts(!emailAlerts)}
                >
                  <span
                    className={`${
                      emailAlerts ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
              
              {/* Alert Email */}
              <div>
                <label htmlFor="alertEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Email Address
                </label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="email"
                    id="alertEmail"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    disabled={!isEditingEmail}
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-md ${
                      isEditingEmail 
                        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                        : 'bg-gray-100 border-gray-300'
                    } text-sm border`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingEmail) {
                        setAlertEmail(userEmail || '');
                      }
                      setIsEditingEmail(!isEditingEmail);
                    }}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isEditingEmail ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Change Password Section */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Change Password</h4>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter current password"
                      required={!!newPassword || !!confirmPassword}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Leave blank to keep current password"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>
                  
                  {newPassword && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Confirm new password"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
