
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExamPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Fitur Ujian</h2>
                <p className="text-gray-600">
                    Fitur ujian sedang dalam pengembangan. Komponen ini memerlukan refactoring
                    untuk menggunakan API backend yang baru.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800 font-medium">
                        🚧 Work in Progress
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                        Gunakan dashboard untuk manajemen kelas sementara waktu.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/student')}
                    className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    );
};

export default ExamPage;