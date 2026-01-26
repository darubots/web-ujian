import React, { useState, useEffect } from 'react';
import { settingsAPI, userAPI } from '../services/apiService';
import type { Settings, User } from '../types';

const OwnerDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'settings' | 'users'>('settings');
    const [settings, setSettings] = useState<Settings | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Settings form
    const [geminiKey, setGeminiKey] = useState('');
    const [mongoUrl, setMongoUrl] = useState('');

    // Load settings on mount
    useEffect(() => {
        loadSettings();
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab]);

    const loadSettings = async () => {
        try {
            const data = await settingsAPI.get();
            setSettings(data);
            setGeminiKey(data.geminiApiKey || '');
            setMongoUrl(data.mongodbUrl || '');
        } catch (error) {
            console.error('Load settings error:', error);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await userAPI.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Load users error:', error);
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        setMessage('');
        try {
            await settingsAPI.update({
                geminiApiKey: geminiKey,
                mongodbUrl: mongoUrl
            });
            setMessage('✅ Settings saved successfully!');
            await loadSettings();
        } catch (error: any) {
            setMessage('❌ Error: ' + (error.response?.data?.error || 'Failed to save'));
        } finally {
            setLoading(false);
        }
    };

    const handleTestDB = async () => {
        setLoading(true);
        setMessage('Testing MongoDB connection...');
        try {
            const result = await settingsAPI.testDatabase(mongoUrl);
            setMessage(result.success
                ? `✅ Connected! Mode: ${result.mode}`
                : `❌ ${result.message}`
            );
        } catch (error: any) {
            setMessage('❌ Connection failed: ' + (error.response?.data?.error || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSuspend = async (userId: string) => {
        try {
            await userAPI.toggleSuspend(userId);
            await loadUsers();
            setMessage('✅ User status updated');
        } catch (error: any) {
            setMessage('❌ Error: ' + (error.response?.data?.error || 'Failed to update'));
        }
    };

    const handleDeleteUser = async (userId: string, username: string) => {
        if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;

        try {
            await userAPI.delete(userId);
            await loadUsers();
            setMessage('✅ User deleted');
        } catch (error: any) {
            setMessage('❌ Error: ' + (error.response?.data?.error || 'Failed to delete'));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        window.location.href = '/#/login';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-white">👑 Owner Dashboard</h1>
                        <p className="text-purple-200 text-sm">System Administration</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Message Banner */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-500/20 border border-green-500 text-green-100' :
                            message.startsWith('❌') ? 'bg-red-500/20 border border-red-500 text-red-100' :
                                'bg-blue-500/20 border border-blue-500 text-blue-100'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 rounded-lg font-bold transition ${activeTab === 'settings'
                                ? 'bg-white text-purple-900'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        ⚙️ Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-lg font-bold transition ${activeTab === 'users'
                                ? 'bg-white text-purple-900'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        👥 Users
                    </button>
                </div>

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <h2 className="text-2xl font-black text-white mb-6">Application Settings</h2>

                        <div className="space-y-6">
                            {/* Gemini API Key */}
                            <div>
                                <label className="block text-purple-200 font-bold mb-2">
                                    🤖 Gemini API Key
                                </label>
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="Enter your Gemini API Key"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-purple-300 text-sm mt-1">
                                    Get your API key from <a href="https://ai.google.dev/" target="_blank" className="underline">Google AI Studio</a>
                                </p>
                            </div>

                            {/* MongoDB URL */}
                            <div>
                                <label className="block text-purple-200 font-bold mb-2">
                                    🗄️ MongoDB Connection URL
                                </label>
                                <input
                                    type="text"
                                    value={mongoUrl}
                                    onChange={(e) => setMongoUrl(e.target.value)}
                                    placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-purple-300 text-sm mt-1">
                                    Leave empty to use local storage mode
                                </p>
                            </div>

                            {/* Storage Mode Info */}
                            {settings && (
                                <div className="p-4 bg-blue-500/20 border border-blue-400 rounded-lg">
                                    <p className="text-blue-100 font-bold">
                                        Current Storage Mode: <span className="text-white">{settings.currentStorageMode?.toUpperCase()}</span>
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold transition"
                                >
                                    {loading ? 'Saving...' : '💾 Save Settings'}
                                </button>

                                <button
                                    onClick={handleTestDB}
                                    disabled={loading || !mongoUrl}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-bold transition"
                                >
                                    🔌 Test DB
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <h2 className="text-2xl font-black text-white mb-6">User Management</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/20">
                                        <th className="text-left text-purple-200 font-bold py-3 px-4">Username</th>
                                        <th className="text-left text-purple-200 font-bold py-3 px-4">Role</th>
                                        <th className="text-left text-purple-200 font-bold py-3 px-4">Email/NISN</th>
                                        <th className="text-left text-purple-200 font-bold py-3 px-4">Status</th>
                                        <th className="text-left text-purple-200 font-bold py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id || user.id} className="border-b border-white/10 hover:bg-white/5">
                                            <td className="py-3 px-4 text-white font-medium">{user.username}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'owner' ? 'bg-purple-600 text-white' :
                                                        user.role === 'guru' ? 'bg-blue-600 text-white' :
                                                            'bg-green-600 text-white'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-purple-200">{user.email || user.nisn || '-'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isSuspended ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                                                    }`}>
                                                    {user.isSuspended ? 'Suspended' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleToggleSuspend(user._id || user.id || '')}
                                                        disabled={user.role === 'owner'}
                                                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded text-xs font-bold transition"
                                                    >
                                                        {user.isSuspended ? 'Activate' : 'Suspend'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id || user.id || '', user.username)}
                                                        disabled={user.role === 'owner'}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-xs font-bold transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {users.length === 0 && (
                                <p className="text-center text-purple-300 py-8">No users found</p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OwnerDashboard;
