import React, { useState, useEffect } from 'react';
import { classAPI, userAPI } from '../services/apiService';
import type { User, Class } from '../types';
import {
    UserGroupIcon,
    CheckCircleIcon,
    AcademicCapIcon,
    PowerIcon,
    UserPlusIcon,
    ArrowDownTrayIcon
} from './icons';

const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [classesData, usersData] = await Promise.all([
                classAPI.getAll(),
                userAPI.getAll()
            ]);
            setClasses(classesData);
            // Filter only students
            const studentUsers = usersData.filter(u => u.role === 'siswa');
            setStudents(studentUsers);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = selectedClass === 'all'
        ? students
        : students.filter(student =>
            // This logic assumes we can match students to classes. 
            // If the user object has class IDs, we use that.
            // Based on types.ts, User has `classes?: string[]`.
            student.classes && student.classes.includes(selectedClass)
        );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                            <UserGroupIcon className="w-8 h-8" />
                        </span>
                        Manajemen Siswa
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">
                        Daftar lengkap siswa yang terdaftar dalam sistem.
                    </p>
                </div>

                {/* Actions & Filter */}
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-end">
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95">
                            <UserPlusIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Tambah Siswa</span>
                        </button>
                        <button className="flex items-center gap-2 bg-white text-emerald-600 border border-emerald-100 px-5 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-sm active:scale-95">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Import Excel</span>
                        </button>
                    </div>

                    <div className="w-full md:w-64">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Filter Kelas</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">Semua Kelas</option>
                            {classes.map(c => (
                                <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Student Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStudents.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <UserGroupIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Tidak Ada Siswa</h3>
                        <p className="text-slate-400 font-medium">Belum ada siswa yang mendaftar atau sesuai filter.</p>
                    </div>
                ) : (
                    filteredStudents.map(student => (
                        <div key={student._id || student.id} className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl">
                                    {student.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 leading-tight">{student.username}</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{student.nisn || 'No NISN'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
                                    <span className="text-slate-500 font-medium">Status</span>
                                    <span className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider ${student.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        <span className={`w-2 h-2 rounded-full ${student.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                        {student.isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
                                    <span className="text-slate-500 font-medium">Login Terakhir</span>
                                    <span className="font-bold text-slate-700">
                                        {student.lastActive ? new Date(student.lastActive).toLocaleDateString('id-ID') : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentManagement;
