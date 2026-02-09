import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { classAPI } from '../services/apiService';
import { useToast } from './Toast';

interface JoinClassModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({ onClose, onSuccess }) => {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const code = inviteCode.trim().toUpperCase();

        if (!code) {
            setError('Masukkan kode undangan');
            return;
        }

        if (code.length < 6) {
            setError('Kode undangan minimal 6 karakter');
            return;
        }

        setLoading(true);
        try {
            const result = await classAPI.join(code);
            showToast(`✅ ${result.message || 'Berhasil bergabung ke kelas!'}`, 'success');
            onSuccess();
            onClose();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Gagal bergabung. Periksa kode undangan.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">🎓 Bergabung ke Kelas</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Masukkan kode undangan dari guru</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Kode Undangan
                        </label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            placeholder="Contoh: ABC12XYZ"
                            maxLength={10}
                            className="w-full px-4 py-4 text-center text-2xl font-black tracking-[0.3em] border-2 border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-medium placeholder:text-base"
                            disabled={loading}
                            autoFocus
                            autoComplete="off"
                        />
                        <p className="text-xs text-slate-400 mt-2 text-center font-medium">
                            Kode 8 karakter dari guru
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                            <p className="text-sm text-rose-600 font-medium text-center">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || inviteCode.trim().length < 6}
                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:shadow-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Bergabung...
                                </span>
                            ) : '✨ Bergabung'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Route handler component for direct join links - AUTO JOIN without modal
export const JoinClassPage: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [status, setStatus] = useState<'checking' | 'joining' | 'error' | 'success'>('checking');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const joinClass = async () => {
            // Check if user is logged in
            const userStr = localStorage.getItem('current_user');
            const token = localStorage.getItem('auth_token');

            if (!userStr || !token) {
                // Store invite code for after login
                if (code) {
                    sessionStorage.setItem('pending_join_code', code);
                }
                showToast('Silakan login terlebih dahulu', 'info');
                navigate('/login');
                return;
            }

            if (!code || code.length < 6) {
                setStatus('error');
                setErrorMsg('Kode undangan tidak valid');
                return;
            }

            // Auto join
            setStatus('joining');
            try {
                const result = await classAPI.join(code.toUpperCase());
                setStatus('success');
                showToast(`✅ ${result.message || 'Berhasil bergabung ke kelas!'}`, 'success');
                // Navigate to student dashboard after short delay
                setTimeout(() => {
                    navigate('/student');
                }, 1000);
            } catch (err: any) {
                setStatus('error');
                const msg = err.response?.data?.error || 'Gagal bergabung ke kelas';
                setErrorMsg(msg);
                showToast(msg, 'error');
            }
        };

        joinClass();
    }, [code, navigate, showToast]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 text-center">
                {status === 'checking' && (
                    <>
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">Memeriksa...</h2>
                        <p className="text-slate-500">Memverifikasi kode undangan</p>
                    </>
                )}

                {status === 'joining' && (
                    <>
                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">Bergabung ke Kelas...</h2>
                        <p className="text-slate-500">Kode: <span className="font-mono font-bold">{code?.toUpperCase()}</span></p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-emerald-600 mb-2">Berhasil Bergabung!</h2>
                        <p className="text-slate-500">Mengalihkan ke dashboard...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-rose-600 mb-2">Gagal Bergabung</h2>
                        <p className="text-slate-500 mb-6">{errorMsg}</p>
                        <button
                            onClick={() => navigate('/student')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                        >
                            Kembali ke Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default JoinClassModal;
