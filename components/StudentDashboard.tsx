import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classAPI, examAPI, submissionAPI } from '../services/apiService';
import type { Class, Exam, Submission, Answer, Question } from '../types';
import JoinClassModal from './JoinClassModal';
import {
    BookOpenIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    AcademicCapIcon,
    ChartBarIcon,
    UserGroupIcon,
    ChevronRightIcon
} from './icons';

const StudentDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'exams' | 'classes' | 'history'>('exams');
    const [classes, setClasses] = useState<Class[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [history, setHistory] = useState<Submission[]>([]);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');

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
                setHistory(data.filter(s => s.status === 'graded' || s.status === 'submitted'));
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

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-emerald-600 bg-emerald-50';
        if (percentage >= 60) return 'text-amber-600 bg-amber-50';
        return 'text-rose-600 bg-rose-50';
    };

    // Stats for History
    const avgScore = history.length > 0
        ? (history.reduce((sum, s) => sum + s.percentage, 0) / history.length).toFixed(1)
        : 0;
    const totalExams = history.length;
    const passedExams = history.filter(s => s.percentage >= 70).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                            {currentUser.username?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800">Dashboard Siswa</h1>
                            <p className="text-indigo-600 text-sm font-bold">{currentUser.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-200 active:scale-95"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    <TabButton
                        active={activeTab === 'exams'}
                        onClick={() => setActiveTab('exams')}
                        icon={<BookOpenIcon className="w-5 h-5" />}
                        label="Ujian Aktif"
                    />
                    <TabButton
                        active={activeTab === 'classes'}
                        onClick={() => setActiveTab('classes')}
                        icon={<UserGroupIcon className="w-5 h-5" />}
                        label="Kelas Saya"
                    />
                    <TabButton
                        active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                        icon={<ChartBarIcon className="w-5 h-5" />}
                        label="Riwayat & Nilai"
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 mt-4 font-medium">Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {/* Active Exams */}
                        {activeTab === 'exams' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {exams.length === 0 ? (
                                    <EmptyState icon={<BookOpenIcon className="w-12 h-12" />} title="Tidak ada ujian aktif" description="Ujian akan muncul di sini saat guru mempublikasikannya." />
                                ) : (
                                    exams.map((exam) => {
                                        const status = getExamStatus(exam);
                                        const classData = typeof exam.classId === 'object' ? exam.classId : null;

                                        return (
                                            <div key={exam._id || exam.id} className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 p-6 border border-slate-100 hover:shadow-xl transition-all">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                                    status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {status === 'active' ? '🟢 Aktif' : status === 'upcoming' ? '🔵 Akan Datang' : '⚫ Selesai'}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-800 mb-1">{exam.title}</h3>
                                                        <p className="text-indigo-600 font-bold text-sm">{classData?.subject || classData?.name || 'Mata Pelajaran'}</p>

                                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                                                            <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {exam.duration} menit</span>
                                                            <span className="flex items-center gap-1.5"><BookOpenIcon className="w-4 h-4" /> {exam.questions?.length || 0} soal</span>
                                                        </div>
                                                    </div>

                                                    {status === 'active' && (
                                                        <button
                                                            onClick={() => handleStartExam(exam._id || exam.id || '')}
                                                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95"
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
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-slate-800">Kelas yang Diikuti</h2>
                                    <button
                                        onClick={() => setShowJoinModal(true)}
                                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95"
                                    >
                                        ➕ Gabung Kelas
                                    </button>
                                </div>

                                {classes.length === 0 ? (
                                    <EmptyState
                                        icon={<UserGroupIcon className="w-12 h-12" />}
                                        title="Belum ada kelas"
                                        description="Bergabung dengan kelas menggunakan kode undangan dari guru."
                                        action={<button onClick={() => setShowJoinModal(true)} className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Gabung Kelas</button>}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {classes.map((classItem) => (
                                            <div key={classItem._id || classItem.id} className="bg-white rounded-[2rem] shadow-md p-6 border border-slate-100 hover:shadow-xl transition-all">
                                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                                                    <AcademicCapIcon className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-lg font-black text-slate-800">{classItem.name}</h3>
                                                <p className="text-indigo-600 font-bold text-sm">{classItem.subject}</p>
                                                {classItem.grade && <p className="text-slate-400 text-xs mt-1 font-medium">{classItem.grade}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* History */}
                        {activeTab === 'history' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard label="Rata-rata Nilai" value={`${avgScore}%`} icon={<ChartBarIcon className="w-6 h-6" />} color="indigo" />
                                    <StatCard label="Total Ujian Selesai" value={String(totalExams)} icon={<BookOpenIcon className="w-6 h-6" />} color="emerald" />
                                    <StatCard label="Ujian Lulus (≥70%)" value={String(passedExams)} icon={<CheckCircleIcon className="w-6 h-6" />} color="amber" />
                                </div>

                                {/* History List */}
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-6">Riwayat Ujian</h2>
                                    {history.length === 0 ? (
                                        <EmptyState icon={<ChartBarIcon className="w-12 h-12" />} title="Belum ada riwayat" description="Ujian yang telah selesai akan muncul di sini." />
                                    ) : (
                                        <div className="space-y-4">
                                            {history.map((submission) => {
                                                const examData = typeof submission.examId === 'object' ? submission.examId : null;

                                                return (
                                                    <div key={submission._id || submission.id} className="bg-white rounded-[2rem] shadow-md p-6 border border-slate-100 hover:shadow-xl transition-all group">
                                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                            <div className="flex-1">
                                                                <h3 className="text-lg font-black text-slate-800">{examData?.title || 'Ujian'}</h3>
                                                                <p className="text-slate-400 text-sm font-medium">
                                                                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('id-ID') : '-'}
                                                                </p>
                                                                <div className="mt-3 flex items-center gap-3">
                                                                    <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${getScoreColor(submission.percentage)}`}>
                                                                        {submission.percentage.toFixed(0)}%
                                                                    </span>
                                                                    <span className="text-slate-500 text-sm font-medium">
                                                                        {submission.totalScore}/{submission.maxScore} poin
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedSubmission(submission)}
                                                                className="px-5 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all flex items-center gap-2"
                                                            >
                                                                Lihat Detail <ChevronRightIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
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

            {/* Result Detail Modal */}
            {selectedSubmission && (
                <ResultDetailModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                />
            )}
        </div>
    );
};

// --- Subcomponents ---

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
            }`}
    >
        {icon} {label}
    </button>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
    <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-lg border border-slate-100">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            {icon}
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-400 font-medium">{description}</p>
        {action}
    </div>
);

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: 'indigo' | 'emerald' | 'amber' }> = ({ label, value, icon, color }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };
    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-md border border-slate-100">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-800">{value}</p>
        </div>
    );
};

const ResultDetailModal: React.FC<{ submission: Submission; onClose: () => void }> = ({ submission, onClose }) => {
    const examData = typeof submission.examId === 'object' ? submission.examId as Exam : null;
    const questions: Question[] = examData?.questions || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">{examData?.title || 'Detail Jawaban'}</h3>
                            <p className="text-slate-400 text-sm font-medium">
                                Skor: <span className="font-black text-indigo-600">{submission.percentage.toFixed(0)}%</span> ({submission.totalScore}/{submission.maxScore} poin)
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <XCircleIcon className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
                    {submission.answers.map((answer, idx) => {
                        const question = questions[answer.questionIndex] || questions[idx];
                        const isCorrect = answer.isCorrect;

                        return (
                            <div key={idx} className={`p-5 rounded-2xl border-2 ${isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                        {isCorrect ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Soal {idx + 1} • {question?.type || 'Unknown'}</p>
                                        <p className="font-bold text-slate-800 mb-3">{question?.question || 'Pertanyaan tidak tersedia'}</p>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2">
                                                <span className="font-black text-slate-500 w-28 flex-shrink-0">Jawaban Anda:</span>
                                                <span className={`font-medium ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {question?.type === 'multiple_choice' && question?.options
                                                        ? question.options[Number(answer.answer)] || String(answer.answer)
                                                        : String(answer.answer) || '-'}
                                                </span>
                                            </div>
                                            {question?.type === 'multiple_choice' && question?.options && (
                                                <div className="flex items-start gap-2">
                                                    <span className="font-black text-slate-500 w-28 flex-shrink-0">Jawaban Benar:</span>
                                                    <span className="font-medium text-emerald-700">
                                                        {question.options[question.correctAnswer || 0]}
                                                    </span>
                                                </div>
                                            )}
                                            {question?.keyAnswer && (
                                                <div className="flex items-start gap-2">
                                                    <span className="font-black text-slate-500 w-28 flex-shrink-0">Kunci Jawaban:</span>
                                                    <span className="font-medium text-slate-600">{question.keyAnswer}</span>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-2">
                                                <span className="font-black text-slate-500 w-28 flex-shrink-0">Skor:</span>
                                                <span className="font-bold text-indigo-600">{answer.score ?? 0} / {question?.points || 0}</span>
                                            </div>
                                        </div>

                                        {/* AI Feedback */}
                                        {answer.aiFeedback && (
                                            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                                <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">🤖 AI Feedback</p>
                                                <p className="text-sm text-indigo-800 font-medium">{answer.aiFeedback}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;