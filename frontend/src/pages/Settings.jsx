import React, { useContext, useState } from 'react';
import { User, Mail, Lock, Shield, Settings as SettingsIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put('/users/profile', { name });
      toast.success('Profile updated successfully!');
      // In a real app, you might want to refresh AuthContext user here
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill out all fields');
      return;
    }
    
    setIsUpdating(true);
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Incorrect current password');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-indigo-600" />
          Account Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and personal information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 font-medium rounded-xl transition-colors ${
              activeTab === 'profile' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile Details</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-4 py-3 font-medium rounded-xl transition-colors ${
              activeTab === 'security' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </button>
          <button 
            onClick={() => setActiveTab('ai-preferences')}
            className={`w-full flex items-center space-x-3 px-4 py-3 font-medium rounded-xl transition-colors ${
              activeTab === 'ai-preferences' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">✨</span>
            <span>AI Provider</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email address cannot be changed.</p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* AI Preferences Section */}
          {activeTab === 'ai-preferences' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">AI Provider Settings</h2>
              <p className="text-sm text-gray-500 mb-6">Choose which AI provider powers your resume extraction and optimization.</p>
              
              <div className="space-y-4">
                {['Groq', 'OpenAI', 'Gemini'].map((provider) => (
                  <div 
                    key={provider}
                    onClick={async () => {
                      if (provider === user?.aiProvider) return;
                      setIsUpdating(true);
                      try {
                        const res = await api.put('/users/preferences/ai-provider', { aiProvider: provider });
                        toast.success(`${provider} set as default AI!`);
                        // In real app, update AuthContext here. For now we force reload or rely on context sync
                        if (res.data) {
                           window.location.reload(); // simple way to sync context state across app
                        }
                      } catch(error) {
                        toast.error(`Failed to switch to ${provider}`);
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none ${
                      (user?.aiProvider || 'Groq') === provider 
                        ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <p className={`font-medium ${
                            (user?.aiProvider || 'Groq') === provider ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            {provider} {(user?.aiProvider || 'Groq') === provider && '⭐ Default'}
                          </p>
                          <p className={`inline-block ${
                            (user?.aiProvider || 'Groq') === provider ? 'text-indigo-700' : 'text-gray-500'
                          }`}>
                            {provider === 'Groq' && 'Fast, open-source models.'}
                            {provider === 'OpenAI' && 'Industry standard GPT models.'}
                            {provider === 'Gemini' && 'Google\'s multimodal models.'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white">
                        {(user?.aiProvider || 'Groq') === provider && (
                          <div className="h-3 w-3 rounded-full bg-indigo-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Update Password</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-gray-900 text-white px-6 py-2 rounded-xl font-medium shadow-sm hover:bg-black disabled:opacity-50 transition-all"
                  >
                    {isUpdating ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
