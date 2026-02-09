import React, { useState, useEffect } from 'react';
import { classAPI } from '../services/apiService';
import type { Class } from '../types';
import {
    PlusIcon,
    UserGroupIcon,
    BookOpenIcon,
    ClipboardIcon,
    CheckCircleIcon,
    AcademicCapIcon,
    TrashIcon,
    PencilIcon
} from './icons';

interface ClassManagementProps {
    onClassCreated?: () => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onClassCreated }) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            const data = await classAPI.getAll();
            setClasses(data);
        } catch (error) {
            console.error('Failed to load classes:', error);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !subject) {
            setMessage({ type: 'error', text: 'Nama dan mata pelajaran wajib diisi' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await classAPI.create({ name, subject, grade, description });
            setMessage({ type: 'success', text: 'Kelas berhasil dibuat!' });

            // Reset form
            setName('');
            setSubject('');
            setGrade('');
            setDescription('');
            setShowCreateForm(false);

            // Reload classes
            await loadClasses();

            if (onClassCreated) onClassCreated();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal membuat kelas' });
        } finally {
            setLoading(false);
        }
    };

    const copyInviteCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setMessage({ type: 'success', text: 'Kode undangan disalin!' });
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                            <AcademicCapIcon className="w-8 h-8" />
                        </span>
                        Manajemen Kelas
                    </h2>
                    <p className="text-slate-500 font-medium mt-2 max-w-xl">
                        Kelola kelas Anda, pantau siswa, dan atur jadwal pembelajaran dengan mudah.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="group px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                >
                    <span className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
                        <PlusIcon className="w-4 h-4" />
                    </span>
                    Buat Kelas Baru
                </button>
            </div>

            {/* Notification Toast */}
            {message && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-10 flex items-center gap-3 ${message.type === 'success'
                    ? 'bg-emerald-600/90 border-emerald-500 text-white'
                    : 'bg-rose-600/90 border-rose-500 text-white'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-bold">!</div>
                    )}
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Empty State */}
                {classes.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <BookOpenIcon className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Belum Ada Kelas</h3>
                        <p className="text-slate-400 font-medium mb-6">Mulai perjalanan mengajar Anda dengan membuat kelas pertama.</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
                        >
                            Buat Kelas Sekarang
                        </button>
                    </div>
                )}

                {classes.map((classItem) => (
                    <div
                        key={classItem._id || classItem.id}
                        className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                                {classItem.grade || 'Umum'}
                            </span>
                            <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{classItem.name}</h3>
                            <p className="text-slate-500 font-medium text-sm">{classItem.subject}</p>
                        </div>

                        {classItem.description && (
                            <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                                {classItem.description}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Siswa</p>
                                <div className="flex items-center gap-2 text-slate-700 font-bold">
                                    <UserGroupIcon className="w-4 h-4 text-indigo-500" />
                                    {Array.isArray(classItem.students) ? classItem.students.length : 0}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ujian</p>
                                <div className="flex items-center gap-2 text-slate-700 font-bold">
                                    <BookOpenIcon className="w-4 h-4 text-emerald-500" />
                                    {Array.isArray(classItem.exams) ? classItem.exams.length : 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-4 group-hover:bg-indigo-600 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-200 uppercase tracking-widest mb-0.5">Kode Undangan</p>
                                    <p className="text-lg font-black text-white tracking-wider font-mono">{classItem.inviteCode}</p>
                                </div>
                                <button
                                    onClick={() => copyInviteCode(classItem.inviteCode)}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors active:scale-95"
                                    title="Salin Kode"
                                >
                                    <ClipboardIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Shareable URL */}
                            <div className="pt-3 border-t border-white/10">
                                <p className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-200 uppercase tracking-widest mb-2">Link Undangan</p>
                                <div className="flex items-center gap-2">
                                    <div
                                        onClick={() => {
                                            const url = `${window.location.origin}/#/join/${classItem.inviteCode}`;
                                            navigator.clipboard.writeText(url);
                                            setMessage({ type: 'success', text: 'Link undangan disalin!' });
                                            setTimeout(() => setMessage(null), 3000);
                                        }}
                                        className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white/90 text-xs font-mono rounded-lg truncate cursor-pointer transition-colors"
                                        title="Klik untuk menyalin"
                                    >
                                        {`${window.location.origin}/#/join/${classItem.inviteCode}`}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/#/join/${classItem.inviteCode}`;
                                            navigator.clipboard.writeText(url);
                                            setMessage({ type: 'success', text: 'Link undangan disalin!' });
                                            setTimeout(() => setMessage(null), 3000);
                                        }}
                                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors active:scale-95"
                                        title="Salin Link"
                                    >
                                        <ClipboardIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Class Modal Overlay */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowCreateForm(false)}
                    />
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <PlusIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">Buat Kelas Baru</h3>
                            <p className="text-slate-500 text-sm mt-1">Isi detail kelas untuk memulai.</p>
                        </div>

                        <form onSubmit={handleCreateClass} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Nama Kelas</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: XII IPA 1"
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 placeholder:text-slate-300 transition-all hover:bg-slate-100"
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Mata Pelajaran</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Matematika"
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 placeholder:text-slate-300 transition-all hover:bg-slate-100"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Tingkat</label>
                                    <select
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all hover:bg-slate-100 cursor-pointer"
                                        disabled={loading}
                                    >
                                        <option value="">Pilih...</option>
                                        <option value="Kelas 10">Kelas 10</option>
                                        <option value="Kelas 11">Kelas 11</option>
                                        <option value="Kelas 12">Kelas 12</option>
                                        <option value="Umum">Umum</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Deskripsi (Opsional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Jelaskan tentang kelas ini..."
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 placeholder:text-slate-300 resize-none transition-all hover:bg-slate-100"
                                    disabled={loading}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                    disabled={loading}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan Kelas'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassManagement;
