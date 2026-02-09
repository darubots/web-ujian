import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import { useToast } from './Toast';
import { useTheme } from './ThemeContext';
import { SunIcon, MoonIcon } from './icons';
import type { UserRole } from '../types';

const Login: React.FC = () => {
    const [role, setRole] = useState<UserRole>('siswa');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nisn, setNisn] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { theme, toggleTheme, isDark } = useTheme();

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

            showToast(`Selamat datang, ${result.user.username}!`, 'success');

            // Check for pending join code (from invite link before login)
            const pendingJoinCode = sessionStorage.getItem('pending_join_code');
            if (pendingJoinCode && result.user.role === 'siswa') {
                sessionStorage.removeItem('pending_join_code');
                navigate(`/join/${pendingJoinCode}`);
                return;
            }

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
            showToast('Login gagal. Periksa kredensial Anda.', 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${isDark
            ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950'
            : 'bg-gradient-to-br from-indigo-600 to-purple-700'
            }`}>
            {/* Dark Mode Toggle */}
            <button
                onClick={toggleTheme}
                className={`fixed top-4 right-4 p-3 rounded-full transition-all shadow-lg ${isDark
                    ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                    : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            <div className={`w-full max-w-md rounded-[2rem] shadow-2xl p-8 space-y-6 transition-all ${isDark ? 'bg-slate-800/90 backdrop-blur-xl' : 'bg-white'
                }`}>
                <div className="text-center">
                    <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        🎓 Web Ujian AI
                    </h1>
                    <p className={`mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        Platform Ujian Berbasis AI
                    </p>
                </div>

                {/* Role Selector */}
                <div className={`flex rounded-full p-1 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <button
                        onClick={() => setRole('siswa')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${role === 'siswa'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:bg-white/50'
                            }`}
                        disabled={isLoggingIn}
                    >
                        👨‍🎓 Siswa
                    </button>
                    <button
                        onClick={() => setRole('guru')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${role === 'guru'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:bg-white/50'
                            }`}
                        disabled={isLoggingIn}
                    >
                        👨‍🏫 Guru
                    </button>
                    <button
                        onClick={() => setRole('owner')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${role === 'owner'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:bg-white/50'
                            }`}
                        disabled={isLoggingIn}
                    >
                        👑 Owner
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Username */}
                    <div>
                        <label htmlFor="username" className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            {role === 'siswa' ? 'Nama Lengkap' : 'Username'}
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`mt-1 block w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 ${isDark
                                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                } border`}
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
                            <label htmlFor="nisn" className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>NISN</label>
                            <input
                                id="nisn"
                                type="text"
                                value={nisn}
                                onChange={(e) => setNisn(e.target.value)}
                                className={`mt-1 block w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 ${isDark
                                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    } border`}
                                placeholder="Masukkan NISN Anda"
                                disabled={isLoggingIn}
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="password" className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`mt-1 block w-full px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 ${isDark
                                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    } border`}
                                placeholder="········"
                                disabled={isLoggingIn}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-75"
                        >
                            {isLoggingIn ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Memverifikasi...
                                </>
                            ) : 'Masuk'}
                        </button>
                    </div>
                </form>

                <p className={`text-center text-xs font-medium flex items-center justify-center gap-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Dibuat dengan cinta
                </p>
            </div>
        </div>
    );
};

export default Login;
