
import React, { useState, useMemo, ChangeEvent } from 'react';
import type { User } from '../types';
import { PencilIcon, TrashIcon, LockClosedIcon, LockOpenIcon } from './icons';

// Helper to get current user from localStorage
const getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
};

declare const XLSX: any;

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

const StudentManagement: React.FC = () => {
    const { users, addUser, deleteUser, updateUser, toggleSuspend, importStudents } = useAuth();
    const [studentName, setStudentName] = useState('');
    const [studentNisn, setStudentNisn] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Modal State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editName, setEditName] = useState('');
    const [editNisn, setEditNisn] = useState('');

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const students = useMemo(() => users.filter(u => u.role === 'Siswa'), [users]);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim() || !studentNisn.trim()) {
            addToast('Lengkapi Nama dan NISN!', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await addUser(studentName, studentNisn);
            if (result.success) {
                addToast(result.message, 'success');
                setStudentName('');
                setStudentNisn('');
            } else {
                addToast(result.message, 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExcelImport = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const formattedData = jsonData.map((row: any) => ({
                    username: String(row.Nama || row.nama || row.Name || row.name || "").trim(),
                    nisn: String(row.NISN || row.nisn || row.Nisn || "").trim()
                })).filter((item: any) => item.username && item.nisn);

                if (formattedData.length === 0) {
                    throw new Error("Format Excel salah. Gunakan header 'Nama' dan 'NISN'.");
                }

                const result = await importStudents(formattedData);
                addToast(`${result.count} Siswa diimpor!`, 'success');
                e.target.value = '';
            } catch (err: any) {
                addToast(err.message || 'Gagal impor file.', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleEditClick = (student: User) => {
        setEditingUser(student);
        setEditName(student.username);
        setEditNisn(student.nisn || '');
    };

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        if (!editNisn.trim()) {
            addToast('NISN tidak boleh kosong!', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updateUser(editingUser.id, editName, editNisn);
            if (result.success) {
                addToast(result.message, 'success');
                setEditingUser(null);
            } else {
                addToast(result.message, 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        if (window.confirm(`Hapus permanen data siswa "${name}"?`)) {
            deleteUser(id);
            addToast(`Siswa "${name}" dihapus`, 'info');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Inner Floating Toast */}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-10 duration-300 ${toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
                            toast.type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' :
                                'bg-slate-800/90 border-slate-700 text-white'
                            }`}
                    >
                        <span className="text-xs font-black uppercase tracking-wider">{toast.message}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Manual Form */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Tambah Manual</h3>
                            <p className="text-xs font-bold text-slate-400">Pendaftaran satu-per-satu</p>
                        </div>
                    </div>
                    <form onSubmit={handleAddStudent} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                            <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="block w-full rounded-2xl border-slate-100 bg-slate-50 p-4 focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold text-slate-700"
                                placeholder="E.g. Izhar Devel"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NISN (Login ID)</label>
                            <input
                                type="text"
                                value={studentNisn}
                                onChange={(e) => setStudentNisn(e.target.value.replace(/\D/g, ''))}
                                className="block w-full rounded-2xl border-slate-100 bg-slate-50 p-4 focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold font-mono text-slate-700"
                                placeholder="12345678"
                                disabled={isSubmitting}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Daftarkan Siswa'}
                        </button>
                    </form>
                </div>

                {/* Excel Import Card */}
                <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center space-y-6 bg-gradient-to-br from-white to-emerald-50/20">
                    <div className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center shadow-inner border-4 border-white">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Impor Massal Excel</h3>
                        <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed max-w-[240px]">Pastikan file Anda memiliki header kolom <span className="text-emerald-600">"Nama"</span> dan <span className="text-emerald-600">"NISN"</span>.</p>
                    </div>
                    <label className="cursor-pointer bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-emerald-600 shadow-xl shadow-emerald-100 transition-all active:scale-95">
                        Pilih Dokumen .xlsx
                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
                    </label>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-lg font-black text-slate-800">Daftar Siswa Terdaftar</h3>
                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black">{students.length} TERDAFTAR</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-white border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">NISN (Password)</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {students.length > 0 ? (
                                students.map((student: User) => (
                                    <tr key={student.id} className={`hover:bg-indigo-50/20 transition-all ${student.isSuspended ? 'bg-rose-50/30' : ''}`}>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-slate-800">{student.username}</div>
                                            {student.isSuspended && <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-black tracking-tighter uppercase mt-1 inline-block">Akun Non-aktif</span>}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono font-bold text-indigo-500 tracking-wider">
                                            {student.nisn}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${student.isSuspended ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {student.isSuspended ? 'Suspended' : 'Aktif'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleEditClick(student)} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit">
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => toggleSuspend(student.id)} className={`p-2 transition-all rounded-xl ${student.isSuspended ? 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'}`} title={student.isSuspended ? "Aktifkan" : "Suspensi"}>
                                                    {student.isSuspended ? <LockOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                                                </button>
                                                <button onClick={() => handleDeleteClick(student.id, student.username)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Hapus">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-sm font-black text-slate-300 italic">
                                        Database Siswa Masih Kosong
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal (Minimalist) */}
            {editingUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-500">
                        <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
                            <h3 className="text-lg font-black tracking-tight">Perbarui Data</h3>
                            <button onClick={() => setEditingUser(null)} className="text-white/50 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateStudent} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-bold text-slate-700 bg-slate-50"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NISN</label>
                                <input
                                    type="text"
                                    value={editNisn}
                                    onChange={e => setEditNisn(e.target.value.replace(/\D/g, ''))}
                                    className="w-full border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono font-bold text-slate-700 bg-slate-50"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-4 border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 font-black text-xs uppercase transition-all">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-xs uppercase shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;
