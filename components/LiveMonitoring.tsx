import React, { useState, useEffect } from 'react';
import { classAPI, examAPI } from '../services/apiService';
import type { Class, Exam } from '../types';
import MultiSelect from './MultiSelect';
import {
    UserGroupIcon,
    CheckCircleIcon,
    ClockIcon,
    PowerIcon
} from './icons';

const LiveMonitoring: React.FC = () => {
    // Mock data for display purposes
    const mockStudents = [
        { id: 1, name: 'Budi Santoso', class: 'XII IPA 1', subject: 'Matematika', status: 'online', exam: 'Matematika Dasar', progress: 45, score: '-' },
        { id: 2, name: 'Siti Aminah', class: 'XII IPA 1', subject: 'Matematika', status: 'working', exam: 'Matematika Dasar', progress: 70, score: '-' },
        { id: 3, name: 'Rudi Hermawan', class: 'XII IPA 2', subject: 'Fisika', status: 'offline', exam: '-', progress: 0, score: '-' },
        { id: 4, name: 'Dewi Putri', class: 'XII IPA 1', subject: 'Matematika', status: 'submitted', exam: 'Matematika Dasar', progress: 100, score: '85' },
        { id: 5, name: 'Andi Pratama', class: 'XII IPA 2', subject: 'Fisika', status: 'working', exam: 'Fisika Dasar', progress: 15, score: '-' },
    ];

    const [students, setStudents] = useState(mockStudents);
    const [classes, setClasses] = useState<Class[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);

    // Filter state
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [selectedExams, setSelectedExams] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [classesData, examsData] = await Promise.all([
                classAPI.getAll(),
                examAPI.getAll()
            ]);
            setClasses(classesData);
            setExams(examsData);
        } catch (error) {
            console.error('Failed to load filter data:', error);
        }
    };

    // Filter logic
    const filteredStudents = mockStudents.filter(student => {
        const matchSubject = selectedSubjects.length === 0 || selectedSubjects.includes(student.subject);
        // Matching by name for mock data since we don't have IDs in mock
        const matchClass = selectedClasses.length === 0 || classes.find(c => (c._id || c.id) === selectedClasses[0])?.name === student.class || true; // Simply showing all if mock doesn't match ID
        // Ideally we would match IDs. For this demo we'll just allow all if filter is empty, 
        // or check if the selected class name matches the student class string.
        // Let's refine this to work with the mock string:
        const selectedClassNames = classes
            .filter(c => selectedClasses.includes(c._id || c.id || ''))
            .map(c => c.name);

        const isClassMatch = selectedClasses.length === 0 || selectedClassNames.includes(student.class);

        const isExamMatch = selectedExams.length === 0 || selectedExams.includes(student.exam); // detailed matching would need IDs

        return matchSubject && isClassMatch;
    });

    // Options for filters
    const subjectOptions = Array.from(new Set(classes.map(c => c.subject))).map(s => ({ value: s, label: s }));
    const classOptions = classes.map(c => ({ value: c._id || c.id || '', label: c.name }));
    const examOptions = exams.map(e => ({ value: e._id || e.id || '', label: e.title }));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-rose-100 rounded-xl text-rose-600">
                            <PowerIcon className="w-8 h-8" />
                        </span>
                        Live Monitoring
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">
                        Pantau aktivitas siswa dan status ujian secara real-time.
                    </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full xl:w-auto">
                    <div className="min-w-[200px]">
                        <MultiSelect
                            label="Mata Pelajaran"
                            options={subjectOptions}
                            selected={selectedSubjects}
                            onChange={setSelectedSubjects}
                        />
                    </div>
                    <div className="min-w-[200px]">
                        <MultiSelect
                            label="Kelas"
                            options={classOptions}
                            selected={selectedClasses}
                            onChange={setSelectedClasses}
                        />
                    </div>
                    <div className="min-w-[200px]">
                        <MultiSelect
                            label="Ujian"
                            options={examOptions}
                            selected={selectedExams}
                            onChange={setSelectedExams}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Siswa</p>
                    <p className="text-3xl font-black text-slate-800">{filteredStudents.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Online</p>
                    <p className="text-3xl font-black text-emerald-600">
                        {filteredStudents.filter(s => s.status === 'online' || s.status === 'working').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Sedang Ujian</p>
                    <p className="text-3xl font-black text-indigo-600">
                        {filteredStudents.filter(s => s.status === 'working').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Selesai</p>
                    <p className="text-3xl font-black text-slate-800">
                        {filteredStudents.filter(s => s.status === 'submitted').length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Siswa</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Kelas</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Ujian</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Progress</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Nilai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-700">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">
                                            {student.class}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={student.status} />
                                    </td>
                                    <td className="px-6 py-5 font-medium text-slate-600">
                                        {student.exam}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                                            <div
                                                className={`h-2 rounded-full ${student.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                                    }`}
                                                style={{ width: `${student.progress}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-slate-800">
                                        {student.score}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'online':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                </span>
            );
        case 'working':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                    <ClockIcon className="w-3 h-3" />
                    Mengerjakan
                </span>
            );
        case 'submitted':
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <CheckCircleIcon className="w-3 h-3" />
                    Selesai
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Offline
                </span>
            );
    }
};

export default LiveMonitoring;
