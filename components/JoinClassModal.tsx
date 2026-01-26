import React, { useState } from 'react';
import { classAPI } from '../services/apiService';

interface JoinClassModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({ onClose, onSuccess }) => {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!inviteCode.trim()) {
            setError('Kode undangan harus diisi');
            return;
        }

        setLoading(true);
        try {
            const result = await classAPI.join(inviteCode.trim().toUpperCase());
            alert(`✅ ${result.message || 'Berhasil bergabung ke kelas!'}`);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal bergabung. Periksa kode undangan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">🎓 Bergabung ke Kelas</h2>
                        <p className="text-gray-600 text-sm mt-1">Masukkan kode undangan dari guru</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kode Undangan
                        </label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            placeholder="Contoh: ABC12XYZ"
                            maxLength={8}
                            className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                            disabled={loading}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Kode undangan terdiri dari 8 karakter
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg font-bold transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-bold transition"
                        >
                            {loading ? 'Bergabung...' : '✨ Bergabung'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinClassModal;
