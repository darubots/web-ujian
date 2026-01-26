
import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import type { Question, StudentResult } from '../types';
import { useNavigate } from 'react-router-dom';
import { exportToPDF, exportToExcel, exportToWord, exportToCSV } from '../services/exportService';
import { parseQuestionsFromFile } from '../services/questionParserService';
import { UploadIcon, ClockIcon, BookOpenIcon, ChartBarIcon, ArrowDownTrayIcon, PowerIcon, UserGroupIcon, PencilIcon, TrashIcon } from './icons';
import StudentManagement from './StudentManagement';
import ClassManagement from './ClassManagement';

type ActiveTab = 'classes' | 'management' | 'results' | 'students';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ActiveTab>('classes');
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        navigate('/login');
    };

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'classes':
                return <ClassManagement />;
            case 'management':
                return (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-4">
                            <BookOpenIcon className="w-10 h-10 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Exam Management</h3>
                        <p className="text-gray-600 mb-4">Fitur ini memerlukan refactoring untuk menggunakan API backend.</p>
                        <p className="text-sm text-amber-600">🚧 Coming Soon</p>
                    </div>
                );
            case 'results':
                return (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
                            <ChartBarIcon className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Grade Results</h3>
                        <p className="text-gray-600 mb-4">Fitur ini memerlukan refactoring untuk menggunakan API backend.</p>
                        <p className="text-sm text-indigo-600">🚧 Coming Soon</p>
                    </div>
                );
            case 'students':
                return (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-4">
                            <UserGroupIcon className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Student Management</h3>
                        <p className="text-gray-600 mb-4">Fitur ini memerlukan refactoring untuk menggunakan API backend.</p>
                        <p className="text-sm text-emerald-600">🚧 Coming Soon</p>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-10 duration-300 ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
                            toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
                                'bg-slate-900 border-slate-800 text-white'
                            }`}
                    >
                        <div className="flex-shrink-0">
                            {toast.type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            {toast.type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>}
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider">{toast.message}</span>
                    </div>
                ))}
            </div>

            <header className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 rotate-3">
                            <BookOpenIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">👨‍🏫 Guru Dashboard</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management Workspace</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Guru Access</p>
                            <p className="text-sm font-black text-indigo-600">{user?.username}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-slate-50 hover:bg-rose-50 p-3 rounded-2xl text-slate-400 hover:text-rose-500 transition-all active:scale-90 group"
                            title="Log Out"
                        >
                            <PowerIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Control Center</h2>
                        <p className="text-slate-400 font-bold mt-1 text-sm uppercase tracking-wider">Kelola kelas, ujian, dan siswa.</p>
                    </div>
                    <div className="flex p-1.5 bg-slate-200/50 backdrop-blur-md rounded-2xl border border-white shadow-inner">
                        <TabButton name="Kelas" icon={<UserGroupIcon className="w-4 h-4" />} active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} />
                        <TabButton name="Ujian" icon={<BookOpenIcon className="w-4 h-4" />} active={activeTab === 'management'} onClick={() => setActiveTab('management')} />
                        <TabButton name="Nilai" icon={<ChartBarIcon className="w-4 h-4" />} active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
                        <TabButton name="Siswa" icon={<UserGroupIcon className="w-4 h-4" />} active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    </div>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

const TabButton: React.FC<{ name: string, icon: React.ReactNode, active: boolean, onClick: () => void }> = ({ name, icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`${active
            ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 scale-100'
            : 'text-slate-500 hover:text-slate-800 scale-95 opacity-70'
            } whitespace-nowrap py-2.5 px-6 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-2 transition-all duration-300 focus:outline-none`}
    >
        {icon}
        {name}
    </button>
);

const ExamManagement: React.FC<{ addToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({ addToast }) => {
    const { questions, setQuestions, settings, setSettings } = useExam();
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Manual Input State
    const [manualMapel, setManualMapel] = useState('');
    const [manualSoal, setManualSoal] = useState('');
    const [manualKunci, setManualKunci] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Scheduling State
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [nowMin, setNowMin] = useState('');

    useEffect(() => {
        // Set default start time to now and min attribute
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
        setNowMin(localISOTime);
        if (!startTime) setStartTime(localISOTime);
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const f = e.target.files[0];
            setFile(f);
            setFileName(f.name);
            addToast(`File "${f.name}" terpilih`, 'info');
        }
    };

    const handleFileUpload = useCallback(async () => {
        if (!file) {
            addToast('Pilih file bank soal!', 'error');
            return;
        }
        setIsProcessing(true);
        try {
            const data = await parseQuestionsFromFile(file);
            if (data.length === 0) throw new Error("File kosong atau tidak valid.");
            setQuestions(prev => [...prev, ...data]);
            addToast(`${data.length} Soal berhasil diimpor!`, 'success');
            setFile(null);
            setFileName('');
        } catch (err: any) {
            addToast(err.message || 'Gagal proses file.', 'error');
        } finally {
            setIsProcessing(false);
        }
    }, [file, setQuestions, addToast]);

    const handleAddOrUpdateManual = () => {
        if (!manualMapel.trim() || !manualSoal.trim()) {
            addToast('Mata pelajaran dan soal wajib diisi!', 'error');
            return;
        }
        const newQ: Question = {
            mata_pelajaran: manualMapel.trim(),
            soal: manualSoal.trim(),
            kunci_jawaban: manualKunci.trim() || undefined
        };

        if (editingIndex !== null) {
            setQuestions(prev => prev.map((q, i) => i === editingIndex ? newQ : q));
            addToast('Soal berhasil diperbarui!', 'success');
            setEditingIndex(null);
        } else {
            setQuestions(prev => [...prev, newQ]);
            addToast('Soal manual ditambahkan!', 'success');
        }

        setManualSoal('');
        setManualKunci('');
    };

    const handleEditQuestion = (index: number) => {
        const q = questions[index];
        setManualMapel(q.mata_pelajaran);
        setManualSoal(q.soal);
        setManualKunci(q.kunci_jawaban || '');
        setEditingIndex(index);
        addToast('Mode edit soal diaktifkan', 'info');
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setManualSoal('');
        setManualKunci('');
    };

    const handleScheduleSet = useCallback(() => {
        if (!startTime || !endTime) {
            addToast('Waktu belum lengkap!', 'error');
            return;
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        if (start < new Date(now.getTime() - 60000)) { // Give 1 min buffer
            addToast('Waktu mulai tidak boleh di masa lalu!', 'error');
            return;
        }
        if (start >= end) {
            addToast('Waktu selesai harus setelah waktu mulai!', 'error');
            return;
        }
        if (questions.length === 0) {
            addToast('Belum ada soal tersedia!', 'error');
            return;
        }

        const subject = questions[0].mata_pelajaran || 'Ujian Umum';
        setSettings({ startTime, endTime, subject });
        addToast(`Jadwal "${subject}" aktif!`, 'success');
    }, [startTime, endTime, setSettings, questions, addToast]);

    const handleEditActiveSchedule = () => {
        if (settings) {
            setStartTime(settings.startTime);
            setEndTime(settings.endTime);
            addToast('Silakan perbarui jadwal di panel pengaturan', 'info');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
                <div className={`p-8 rounded-[2.5rem] shadow-2xl transition-all duration-500 relative overflow-hidden group ${settings ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-400'}`}>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest backdrop-blur-md border ${settings ? 'bg-white/20 border-white/30 text-white' : 'bg-slate-300/50 border-slate-300 text-slate-500'}`}>
                                {settings ? 'Live Schedule' : 'No Active Exam'}
                            </span>
                            <h3 className={`text-4xl font-black mt-3 leading-tight tracking-tighter ${settings ? 'text-white' : 'text-slate-300'}`}>
                                {settings ? settings.subject : 'Belum Ada Jadwal'}
                            </h3>
                            {settings && (
                                <button
                                    onClick={handleEditActiveSchedule}
                                    className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/20 active:scale-95"
                                >
                                    <PencilIcon className="w-3 h-3" />
                                    Edit Jadwal Aktif
                                </button>
                            )}
                        </div>
                        {settings && (
                            <div className="flex gap-4">
                                <TimeBadge label="Mulai" time={settings.startTime} />
                                <TimeBadge label="Selesai" time={settings.endTime} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <UploadIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Bank Soal AI</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ekstrak dari PDF/Docx</p>
                            </div>
                        </div>

                        <label className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 p-6 cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-all group mb-6">
                            <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-slate-300 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <p className="text-[11px] font-black text-slate-500 text-center mt-4 uppercase tracking-tighter">{fileName || 'Pilih File Bank Soal'}</p>
                            <input type='file' className="hidden" accept=".json,.pdf,.docx,.doc" onChange={handleFileChange} />
                        </label>

                        <button
                            onClick={handleFileUpload}
                            disabled={isProcessing}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Mulai Ekstraksi AI'}
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                <PencilIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">{editingIndex !== null ? 'Edit Soal' : 'Input Manual'}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingIndex !== null ? 'Perbarui soal draft' : 'Buat soal satu per satu'}</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-grow">
                            <input
                                placeholder="Mata Pelajaran"
                                value={manualMapel}
                                onChange={e => setManualMapel(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-amber-400"
                            />
                            <textarea
                                placeholder="Tuliskan Soal Esai..."
                                value={manualSoal}
                                onChange={e => setManualSoal(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-700 h-24 resize-none focus:ring-2 focus:ring-amber-400"
                            />
                            <textarea
                                placeholder="Kunci/Keyword Penilaian (Opsional)"
                                value={manualKunci}
                                onChange={e => setManualKunci(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-500 h-20 resize-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            {editingIndex !== null && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                                >
                                    Batal
                                </button>
                            )}
                            <button
                                onClick={handleAddOrUpdateManual}
                                className="flex-grow py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 active:scale-95 transition-all shadow-xl shadow-amber-100"
                            >
                                {editingIndex !== null ? 'Simpan Perubahan' : 'Simpan ke Daftar'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Atur Durasi Ujian</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tentukan waktu akses siswa</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Waktu Mulai</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                min={nowMin}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-black text-slate-700 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Waktu Selesai</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                min={startTime || nowMin}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-black text-slate-700 focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleScheduleSet}
                        className="w-full py-4 mt-8 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 shadow-xl shadow-emerald-100 active:scale-95 transition-all"
                    >
                        {settings ? 'Update Jadwal Ujian' : 'Aktifkan Ujian Sekarang'}
                    </button>
                </div>
            </div>

            <div className="lg:col-span-4 h-full">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[750px] sticky top-28">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 rounded-t-[2.5rem]">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="font-black text-slate-800 tracking-tighter">Draft Soal</h3>
                        </div>
                        <span className="bg-indigo-600 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                            {questions.length} Items
                        </span>
                    </div>

                    <div className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-4">
                        {questions.length > 0 ? (
                            questions.map((q, i) => (
                                <div key={i} className={`p-5 bg-white rounded-2xl border transition-all duration-500 group/q ${editingIndex === i ? 'border-amber-400 bg-amber-50/20' : 'border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50'}`}>
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 flex-shrink-0 rounded-2xl flex items-center justify-center text-xs font-black transition-colors ${editingIndex === i ? 'bg-amber-400 text-white' : 'bg-slate-50 text-slate-300 group-hover/q:bg-indigo-50 group-hover/q:text-indigo-600'}`}>
                                            {i + 1}
                                        </div>
                                        <div className="space-y-3 flex-grow">
                                            <div className="flex justify-between items-start">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${editingIndex === i ? 'text-amber-600' : 'text-indigo-400'}`}>{q.mata_pelajaran}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditQuestion(i)} className="text-slate-200 hover:text-indigo-500 transition-colors">
                                                        <PencilIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setQuestions(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-200 hover:text-rose-500 transition-colors">
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[13px] font-bold text-slate-700 leading-relaxed">{q.soal}</p>
                                            {q.kunci_jawaban && (
                                                <div className="pt-2 border-t border-slate-50">
                                                    <p className="text-[10px] text-slate-400 font-medium italic">Ref: {q.kunci_jawaban}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
                                <div className="bg-slate-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-6">
                                    <BookOpenIcon className="w-12 h-12 text-slate-200" />
                                </div>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Bank Soal Kosong</h4>
                                <p className="text-[10px] text-slate-300 mt-2 font-bold leading-relaxed">Gunakan fitur unggah AI atau input manual di panel kiri.</p>
                            </div>
                        )}
                    </div>

                    {questions.length > 0 && (
                        <div className="p-6 bg-slate-50/50 border-t border-slate-50 rounded-b-[2.5rem]">
                            <button
                                onClick={() => { if (confirm('Kosongkan semua draft soal?')) { setQuestions([]); addToast('Draft soal dibersihkan', 'info'); } }}
                                className="w-full py-4 text-[10px] font-black text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition-all uppercase tracking-[0.25em]"
                            >
                                Bersihkan Draft
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TimeBadge: React.FC<{ label: string, time: string }> = ({ label, time }) => (
    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20 flex items-center gap-4 min-w-[160px] shadow-2xl">
        <div className="bg-white/20 p-2.5 rounded-xl">
            <ClockIcon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-[8px] font-black text-indigo-200 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-black text-white">{new Date(time).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
        </div>
    </div>
);

const GradeAccumulation: React.FC = () => {
    const { results } = useExam();

    if (results.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-24 text-center">
                <div className="bg-slate-50 w-28 h-28 rounded-[3rem] flex items-center justify-center mx-auto mb-8">
                    <ChartBarIcon className="w-14 h-14 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Menunggu Partisipasi Siswa</h3>
                <p className="text-slate-400 font-bold max-w-xs mx-auto mt-2 text-sm">Data nilai akan tersusun otomatis di sini segera setelah ujian dikirimkan.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Evaluation Report</h2>
                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Deep analysis of student performance</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <ExportButton onClick={() => exportToPDF(results)} label="PDF Report" color="rose" />
                    <ExportButton onClick={() => exportToExcel(results)} label="Excel Data" color="emerald" />
                    <ExportButton onClick={() => exportToCSV(results)} label="CSV Export" color="slate" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-white border-b border-slate-100">
                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identify</th>
                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Score</th>
                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed At</th>
                            <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {results.map((result, index) => <ResultRow key={index} result={result} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ExportButton: React.FC<{ onClick: () => void, label: string, color: string }> = ({ onClick, label, color }) => {
    const colorClasses: Record<string, string> = {
        rose: 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white',
        emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white',
        slate: 'bg-slate-50 text-slate-600 hover:bg-slate-600 hover:text-white'
    };
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black rounded-2xl transition-all active:scale-90 shadow-sm ${colorClasses[color]}`}>
            <ArrowDownTrayIcon className="w-4 h-4" />
            {label}
        </button>
    );
};

const ResultRow: React.FC<{ result: StudentResult }> = ({ result }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <tr className={`hover:bg-indigo-50/20 transition-all ${isOpen ? 'bg-indigo-50/40' : ''}`}>
                <td className="px-10 py-7">
                    <div className="text-sm font-black text-slate-800">{result.studentName}</div>
                    <div className="text-[11px] font-bold text-slate-400 tracking-tight">{result.studentNisn}</div>
                </td>
                <td className="px-10 py-7">
                    <div className={`text-lg font-black ${result.score >= 75 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {result.score.toFixed(1)}
                        <span className="text-[10px] text-slate-300 ml-1 font-bold">/100</span>
                    </div>
                </td>
                <td className="px-10 py-7 text-[11px] text-slate-500 font-bold">{result.submissionTime}</td>
                <td className="px-10 py-7 text-center">
                    <button onClick={() => setIsOpen(!isOpen)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${isOpen ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                        {isOpen ? 'Close detail' : 'Expand sheet'}
                    </button>
                </td>
            </tr>
            {isOpen && (
                <tr>
                    <td colSpan={4} className="p-0 border-b border-slate-100 bg-indigo-50/10">
                        <div className="px-16 py-12 space-y-10 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
                                <h4 className="text-base font-black text-slate-900 uppercase tracking-tighter">AI Analysis Sheet</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {result.answers.map((ans, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-5 relative">
                                        <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xs font-black shadow-xl">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm font-black text-slate-800 leading-relaxed">{ans.question.soal}</p>
                                        <div className="space-y-4 pt-4 border-t border-slate-50">
                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Student Answer</span>
                                                <p className="text-[13px] text-slate-700 font-bold leading-relaxed">{ans.answer}</p>
                                            </div>
                                            {ans.question.kunci_jawaban && (
                                                <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100">
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-3">Reference Guide</span>
                                                    <p className="text-[12px] text-slate-500 font-bold italic leading-relaxed">{ans.question.kunci_jawaban}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default AdminDashboard;
