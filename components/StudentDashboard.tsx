import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classAPI, examAPI, submissionAPI } from '../services/apiService';
import type { Class, Exam, Submission } from '../types';
import JoinClassModal from './JoinClassModal';

const StudentDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'classes' | 'exams' | 'history'>('exams');
    const [classes, setClasses] = useState<Class[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [history, setHistory] = useState<Submission[]>([]);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'classes') {
                const data = await classAPI.getAll();
                setClasses(data);
            } else if (activeTab === 'exams') {
                const data = await examAPI.getAll();
                setExams(data);
            } else if (activeTab === 'history') {
                const data = await submissionAPI.getAll();
                setHistory(data.filter(s => s.status === 'graded'));
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        navigate('/login');
    };

    const handleStartExam = async (examId: string) => {
        try {
            await submissionAPI.start(examId);
            navigate('/exam', { state: { examId } });
        } catch (error: any) {
            alert('Error: ' + (error.response?.data?.error || 'Gagal memulai ujian'));
        }
    };

    const getExamStatus = (exam: Exam) => {
        const now = new Date();
        const start = new Date(exam.startTime);
        const end = new Date(exam.endTime);

        if (now < start) return 'upcoming';
        if (now > end) return 'completed';
        return 'active';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">👨‍🎓 Dashboard Siswa</h1>
                        <p className="text-indigo-600 text-sm">
                            {JSON.parse(localStorage.getItem('current_user') || '{}').username}
                        </p>
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
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('exams')}
                        className={`px-6 py-3 rounded-lg font-bold transition ${activeTab === 'exams'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        📝 Ujian Aktif
                    </button>
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`px-6 py-3 rounded-lg font-bold transition ${activeTab === 'classes'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        📚 Kelas Saya
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 rounded-lg font-bold transition ${activeTab === 'history'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        📊 Riwayat
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 mt-4">Loading...</p>
                    </div>
                ) : (
                    <>
                        {/* Active Exams */}
                        {activeTab === 'exams' && (
                            <div className="grid gap-4">
                                {exams.length === 0 ? (
                                    <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                                        <div className="text-6xl mb-4">📝</div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak ada ujian aktif</h3>
                                        <p className="text-gray-600">Ujian akan muncul di sini saat guru mempublikasikannya</p>
                                    </div>
                                ) : (
                                    exams.map((exam) => {
                                        const status = getExamStatus(exam);
                                        const classData = typeof exam.classId === 'object' ? exam.classId : null;

                                        return (
                                            <div key={exam._id || exam.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-gray-800">{exam.title}</h3>
                                                        <p className="text-indigo-600 font-medium">
                                                            {classData?.subject || 'Mata Pelajaran'}
                                                        </p>
                                                        {exam.description && (
                                                            <p className="text-gray-600 text-sm mt-2">{exam.description}</p>
                                                        )}

                                                        <div className="mt-4 flex items-center gap-4 text-sm">
                                                            <span className="text-gray-600">
                                                                ⏱️ {exam.duration} menit
                                                            </span>
                                                            <span className="text-gray-600">
                                                                📋 {exam.questions?.length || 0} soal
                                                            </span>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'active' ? 'bg-green-100 text-green-700' :
                                                                    status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {status === 'active' ? '🟢 Aktif' :
                                                                    status === 'upcoming' ? '🔵 Akan Datang' : '⚫ Selesai'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {status === 'active' && (
                                                        <button
                                                            onClick={() => handleStartExam(exam._id || exam.id || '')}
                                                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg hover:shadow-xl"
                                                        >
                                                            🚀 Mulai Ujian
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* My Classes */}
                        {activeTab === 'classes' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Kelas yang Diikuti</h2>
                                    <button
                                        onClick={() => setShowJoinModal(true)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition"
                                    >
                                        ➕ Gabung Kelas
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {classes.length === 0 ? (
                                        <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                                            <div className="text-6xl mb-4">📚</div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada kelas</h3>
                                            <p className="text-gray-600 mb-4">Bergabung dengan kelas menggunakan kode undangan dari guru</p>
                                            <button
                                                onClick={() => setShowJoinModal(true)}
                                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition"
                                            >
                                                Gabung Kelas Sekarang
                                            </button>
                                        </div>
                                    ) : (
                                        classes.map((classItem) => (
                                            <div key={classItem._id || classItem.id} className="bg-white rounded-xl shadow-md p-6">
                                                <h3 className="text-xl font-bold text-gray-800">{classItem.name}</h3>
                                                <p className="text-indigo-600 font-medium">{classItem.subject}</p>
                                                {classItem.grade && (
                                                    <p className="text-gray-600 text-sm">{classItem.grade}</p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* History */}
                        {activeTab === 'history' && (
                            <div className="grid gap-4">
                                {history.length === 0 ? (
                                    <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                                        <div className="text-6xl mb-4">📊</div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada riwayat</h3>
                                        <p className="text-gray-600">Ujian yang telah selesai akan muncul di sini</p>
                                    </div>
                                ) : (
                                    history.map((submission) => {
                                        const examData = typeof submission.examId === 'object' ? submission.examId : null;

                                        return (
                                            <div key={submission._id || submission.id} className="bg-white rounded-xl shadow-md p-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-800">
                                                            {examData?.title || 'Ujian'}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm">
                                                            {new Date(submission.submittedAt || '').toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-3xl font-black text-indigo-600">
                                                            {submission.percentage.toFixed(0)}%
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {submission.totalScore}/{submission.maxScore} poin
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Join Class Modal */}
            {showJoinModal && (
                <JoinClassModal
                    onClose={() => setShowJoinModal(false)}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
};

export default StudentDashboard;