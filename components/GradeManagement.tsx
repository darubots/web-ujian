import React, { useState, useEffect } from 'react';
import { examAPI, submissionAPI, classAPI } from '../services/apiService';
import type { Exam, Submission, Class, Answer } from '../types';
import MultiSelect from './MultiSelect';
import {
    ChartBarIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon
} from './icons';

const GradeManagement: React.FC = () => {
    // Data state
    const [exams, setExams] = useState<Exam[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter state
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [selectedExams, setSelectedExams] = useState<string[]>([]);

    // Detail view state
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // When filters change, re-fetch or filter submissions
        // For simplicity in this demo, we'll fetch all relevant submissions 
        // tailored to the selected exams.
        if (selectedExams.length > 0) {
            loadSubmissions(selectedExams);
        } else {
            setSubmissions([]);
        }
    }, [selectedExams]);

    const loadData = async () => {
        try {
            const [examsData, classesData] = await Promise.all([
                examAPI.getAll(),
                classAPI.getAll()
            ]);
            setExams(examsData);
            setClasses(classesData);
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    };

    const loadSubmissions = async (examIds: string[]) => {
        setLoading(true);
        try {
            // Fetch submissions for all selected exams
            // In a real app, we might want a bulk API or robust query param
            const allSubmissions = await Promise.all(
                examIds.map(id => submissionAPI.getByExam(id).catch(() => []))
            );
            setSubmissions(allSubmissions.flat());
        } catch (error) {
            console.error('Failed to load submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived options for filters
    const subjectOptions = Array.from(new Set(classes.map(c => c.subject))).map(s => ({ value: s, label: s }));

    // Filter classes based on selected subjects
    const filteredClasses = selectedSubjects.length === 0
        ? classes
        : classes.filter(c => selectedSubjects.includes(c.subject));

    const classOptions = filteredClasses.map(c => ({ value: c._id || c.id || '', label: c.name }));

    // Filter exams based on selected classes
    const filteredExams = selectedClasses.length === 0
        ? exams
        : exams.filter(e => {
            const examClassId = typeof e.classId === 'string' ? e.classId : e.classId._id;
            return selectedClasses.includes(examClassId || '');
        });

    const examOptions = filteredExams.map(e => ({ value: e._id || e.id || '', label: e.title }));

    const calculateAverage = () => {
        if (submissions.length === 0) return 0;
        const total = submissions.reduce((acc, sub) => acc + (sub.totalScore || 0), 0);
        return (total / submissions.length).toFixed(1);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                            <ChartBarIcon className="w-8 h-8" />
                        </span>
                        Hasil & Nilai
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">
                        Analisis hasil ujian, filter multi-dimensi, dan rekap nilai.
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

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Pengumpulan</p>
                    <p className="text-4xl font-black text-slate-800">{submissions.length}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Rata-rata Nilai</p>
                    <p className="text-4xl font-black text-emerald-600">{calculateAverage()}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-start">
                    <button className="flex items-center gap-3 text-indigo-600 font-bold bg-indigo-50 px-5 py-3 rounded-xl hover:bg-indigo-100 transition-colors w-full justify-center">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Export (.XLSX)
                    </button>
                    <p className="text-[10px] text-center w-full mt-2 text-slate-400 font-bold uppercase tracking-wide">Download Rekap</p>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                {submissions.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <DocumentTextIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Belum Ada Data</h3>
                        <p className="text-slate-400 font-medium">Silakan pilih filter ujian untuk melihat data nilai.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Siswa</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Ujian</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Waktu Submit</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Nilai</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {submissions.map((sub, idx) => {
                                    // Helper to match exam title
                                    const exam = exams.find(e => (e._id || e.id) === (typeof sub.examId === 'string' ? sub.examId : sub.examId._id));
                                    return (
                                        <tr key={sub._id || sub.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-700">
                                                {typeof sub.studentId === 'object' ? (sub.studentId as any).username : sub.studentId}
                                            </td>
                                            <td className="px-6 py-5 font-bold text-slate-500 text-sm">
                                                {exam?.title || 'Unknown Exam'}
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-slate-500">
                                                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('id-ID') : '-'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                                                    <CheckCircleIcon className="w-3 h-3" />
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 font-black text-lg text-slate-800">
                                                {sub.totalScore}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    onClick={() => setSelectedSubmission(sub)}
                                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                    title="Lihat Detail Jawaban"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setSelectedSubmission(null)}
                    />
                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">Detail Jawaban</h3>
                                <div className="flex gap-4 mt-2 text-sm font-medium text-slate-500">
                                    <span>Siswa: <strong className="text-slate-700">{typeof selectedSubmission.studentId === 'object' ? (selectedSubmission.studentId as any).username : selectedSubmission.studentId}</strong></span>
                                    <span>•</span>
                                    <span>Nilai: <strong className="text-emerald-600">{selectedSubmission.totalScore}</strong></span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-rose-500"
                            >
                                <XCircleIcon className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <div className="space-y-6">
                                {selectedSubmission.answers.map((ans, idx) => (
                                    <div key={idx} className={`p-6 rounded-2xl border-2 ${ans.isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 font-black text-slate-700 shadow-sm">
                                                {idx + 1}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${ans.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {ans.isCorrect ? 'Benar' : 'Salah'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Jawaban Siswa</p>
                                                <div className="p-4 bg-white rounded-xl border border-slate-200 font-medium text-slate-800">
                                                    {ans.answer}
                                                </div>
                                            </div>
                                            {/* Ideally we would show the question and correct answer here too, 
                                                but we need to join with Exam data for that. 
                                                For now we show the score/feedback. */}
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Poin</p>
                                                <div className="p-4 bg-white rounded-xl border border-slate-200 font-bold text-slate-800">
                                                    {ans.score}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradeManagement;
