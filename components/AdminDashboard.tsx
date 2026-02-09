import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, ChartBarIcon, PowerIcon, UserGroupIcon, ClockIcon } from './icons';
import StudentManagement from './StudentManagement';
import ClassManagement from './ClassManagement';
import CreateExam from './CreateExam';
import LiveMonitoring from './LiveMonitoring';
import GradeManagement from './GradeManagement';

type ActiveTab = 'classes' | 'exams' | 'monitoring' | 'students' | 'grades';

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
            case 'exams':
                return <CreateExam />;
            case 'monitoring':
                return <LiveMonitoring />;
            case 'students':
                return <StudentManagement />;
            case 'grades':
                return <GradeManagement />;
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

            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3 transform hover:rotate-6 transition-transform">
                            <BookOpenIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-none tracking-tight">Guru Dashboard</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management Workspace</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Logged in as</p>
                            <p className="text-sm font-black text-indigo-600">{user?.username || 'Guru'}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-slate-50 hover:bg-rose-50 p-3 rounded-xl text-slate-400 hover:text-rose-500 transition-all active:scale-95 group"
                            title="Log Out"
                        >
                            <PowerIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Control Center</h2>
                        <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-wider">
                            Selamat Datang, {user?.username || 'Guru'}.
                        </p>
                    </div>
                    <div className="flex p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-100/50">
                        <TabButton name="Kelas" icon={<UserGroupIcon className="w-4 h-4" />} active={activeTab === 'classes'} onClick={() => setActiveTab('classes')} />
                        <TabButton name="Ujian" icon={<BookOpenIcon className="w-4 h-4" />} active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} />
                        <TabButton name="Nilai" icon={<ChartBarIcon className="w-4 h-4" />} active={activeTab === 'grades'} onClick={() => setActiveTab('grades')} />
                        <TabButton name="Monitoring" icon={<ClockIcon className="w-4 h-4" />} active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} />
                        <TabButton name="Siswa" icon={<UserGroupIcon className="w-4 h-4" />} active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                    </div>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
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



export default AdminDashboard;
