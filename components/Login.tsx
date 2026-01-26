
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import type { UserRole } from '../types';

const Login: React.FC = () => {
    const [role, setRole] = useState<UserRole>('siswa');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nisn, setNisn] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!username) {
            setError('Username is required');
            return;
        }

        if (role === 'siswa' && !nisn) {
            setError('NISN is required for students');
            return;
        }

        if ((role === 'guru' || role === 'owner') && !password) {
            setError('Password is required');
            return;
        }

        setIsLoggingIn(true);
        try {
            const result = await authAPI.login({
                username,
                password: role === 'siswa' ? undefined : password,
                nisn: role === 'siswa' ? nisn : undefined,
                role
            });

            // Store user data
            localStorage.setItem('current_user', JSON.stringify(result.user));

            // Redirect based on role
            if (result.user.role === 'owner') {
                navigate('/owner');
            } else if (result.user.role === 'guru') {
                navigate('/guru');
            } else {
                navigate('/student');
            }

        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">🎓 Web Ujian AI</h1>
                    <p className="text-gray-500 mt-2">Platform Ujian Berbasis AI</p>
                </div>

                {/* Role Selector */}
                <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                        onClick={() => setRole('siswa')}
                        className={`flex-1 py-2.5 text-sm font-medium leading-5 rounded-full transition-all duration-300 ${role === 'siswa' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-white/50'
                            }`}
                        disabled={isLoggingIn}
                    >
                        👨‍🎓 Siswa
                    </button>
                    <button
                        onClick={() => setRole('guru')}
                        className={`flex-1 py-2.5 text-sm font-medium leading-5 rounded-full transition-all duration-300 ${role === 'guru' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-white/50'
                            }`}
                        disabled={isLoggingIn}
                    >
                        👨‍🏫 Guru
                    </button>
                    <button
                        onClick={() => setRole('owner')}
                        className={`flex-1 py-2.5 text-sm font-medium leading-5 rounded-full transition-all duration-300 ${role === 'owner' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-white/50'
                            }`}
                        disabled={isLoggingIn}
                    >
                        👑 Owner
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="text-sm font-medium text-gray-700">
                            {role === 'siswa' ? 'Nama Lengkap' : 'Username'}
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                            placeholder={
                                role === 'siswa' ? 'Contoh: Budi Santoso' :
                                    role === 'guru' ? 'Username guru' :
                                        'Username owner'
                            }
                            disabled={isLoggingIn}
                        />
                    </div>

                    {/* Password or NISN */}
                    {role === 'siswa' ? (
                        <div>
                            <label htmlFor="nisn" className="text-sm font-medium text-gray-700">NISN</label>
                            <input
                                id="nisn"
                                type="text"
                                value={nisn}
                                onChange={(e) => setNisn(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                                placeholder="Masukkan NISN Anda"
                                disabled={isLoggingIn}
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                                placeholder="········"
                                disabled={isLoggingIn}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:scale-100 disabled:opacity-75"
                        >
                            {isLoggingIn ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Memverifikasi...
                                </>
                            ) : 'Masuk'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Dibuat dengan cinta
                </p>
            </div>
        </div>
    );
};

export default Login;

