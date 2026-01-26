import React, { useState, useEffect } from 'react';
import { classAPI } from '../services/apiService';
import type { Class } from '../types';

interface ClassManagementProps {
    onClassCreated?: () => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ onClassCreated }) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [message, setMessage] = useState('');

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
            setMessage('❌ Nama dan mata pelajaran wajib diisi');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            await classAPI.create({ name, subject, grade, description });
            setMessage('✅ Kelas berhasil dibuat!');

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
            setMessage('❌ Error: ' + (error.response?.data?.error || 'Failed to create class'));
        } finally {
            setLoading(false);
        }
    };

    const copyInviteCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setMessage('✅ Kode undangan disalin ke clipboard!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">📚 Manajemen Kelas</h2>
                    <p className="text-gray-600 text-sm">Kelola kelas dan invite siswa</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition"
                >
                    {showCreateForm ? '❌ Batal' : '➕ Buat Kelas Baru'}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-800' :
                        'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    {message}
                </div>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Buat Kelas Baru</h3>
                    <form onSubmit={handleCreateClass} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Kelas <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Kelas 10A"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mata Pelajaran <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Contoh: Matematika"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tingkat Kelas
                            </label>
                            <select
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            >
                                <option value="">Pilih Tingkat</option>
                                <option value="Kelas 10">Kelas 10</option>
                                <option value="Kelas 11">Kelas 11</option>
                                <option value="Kelas 12">Kelas 12</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Deskripsi kelas (opsional)"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition"
                            >
                                {loading ? 'Membuat...' : '✨ Buat Kelas'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Classes List */}
            <div className="grid gap-4">
                {classes.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <p className="text-gray-500">Belum ada kelas. Buat kelas pertama Anda!</p>
                    </div>
                ) : (
                    classes.map((classItem) => (
                        <div key={classItem._id || classItem.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800">{classItem.name}</h3>
                                    <p className="text-indigo-600 font-medium">{classItem.subject}</p>
                                    {classItem.grade && (
                                        <p className="text-gray-600 text-sm">Tingkat: {classItem.grade}</p>
                                    )}
                                    {classItem.description && (
                                        <p className="text-gray-500 text-sm mt-2">{classItem.description}</p>
                                    )}

                                    <div className="mt-4 flex items-center gap-4 text-sm">
                                        <span className="text-gray-600">
                                            👥 {Array.isArray(classItem.students) ? classItem.students.length : 0} Siswa
                                        </span>
                                        <span className="text-gray-600">
                                            📝 {Array.isArray(classItem.exams) ? classItem.exams.length : 0} Ujian
                                        </span>
                                    </div>
                                </div>

                                {/* Invite Code */}
                                <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                                    <p className="text-xs text-gray-600 font-medium mb-1">Kode Undangan</p>
                                    <p className="text-2xl font-black text-indigo-600 tracking-wider">
                                        {classItem.inviteCode}
                                    </p>
                                    <button
                                        onClick={() => copyInviteCode(classItem.inviteCode)}
                                        className="mt-2 w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded font-bold transition"
                                    >
                                        📋 Salin Kode
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClassManagement;
