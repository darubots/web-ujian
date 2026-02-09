import React, { useState, useEffect } from 'react';
import { classAPI, examAPI } from '../services/apiService';
import type { Class, Question, QuestionType, Exam } from '../types';
import {
    BookOpenIcon,
    ClockIcon,
    PhotoIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    CodeBracketIcon,
    CalculatorIcon,
    DocumentTextIcon,
    ListBulletIcon,
    PencilSquareIcon,
    ArrowLeftIcon
} from './icons';

interface CreateExamProps {
    onCancel?: () => void;
    onSuccess?: () => void;
}

const CreateExam: React.FC<CreateExamProps> = ({ onCancel, onSuccess }) => {
    // Mode: 'list' | 'create'
    const [mode, setMode] = useState<'list' | 'create'>('list');

    // Steps: 'meta' -> 'questions' -> 'review'
    const [step, setStep] = useState<'meta' | 'questions' | 'review'>('meta');
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);

    // Exam Metadata State
    const [title, setTitle] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [subject, setSubject] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [duration, setDuration] = useState(60); // minutes

    // Questions State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Current Question Editing State
    const [currentQType, setCurrentQType] = useState<QuestionType>('essay');
    const [qText, setQText] = useState('');
    const [qPoints, setQPoints] = useState(10);
    const [qImage, setQImage] = useState<string>(''); // Base64
    const [qKeyAnswer, setQKeyAnswer] = useState(''); // Essay key

    // Multi Choice State
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [correctOption, setCorrectOption] = useState(0);

    // Coding State
    const [codingLanguage, setCodingLanguage] = useState('javascript');

    // Toast State
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [classesData, examsData] = await Promise.all([
                classAPI.getAll(),
                examAPI.getAll()
            ]);
            setClasses(classesData);
            setExams(examsData);
        } catch (error) {
            console.error('Failed to load data', error);
            showToast('Gagal memuat data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clsId = e.target.value;
        setSelectedClassId(clsId);
        const selected = classes.find(c => (c._id || c.id) === clsId);
        if (selected) {
            setSubject(selected.subject);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setQImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetQuestionForm = () => {
        setQText('');
        setQPoints(10);
        setQImage('');
        setQKeyAnswer('');
        setOptions(['', '', '', '']);
        setCorrectOption(0);
        setEditingIndex(null);
        setCurrentQType('essay');
    };

    const loadQuestionForEdit = (index: number) => {
        const q = questions[index];
        setEditingIndex(index);
        setCurrentQType(q.type);
        setQText(q.question);
        setQPoints(q.points);
        setQImage(q.image || '');

        if (q.type === 'multiple_choice') {
            setOptions(q.options || ['', '', '', '']);
            setCorrectOption(q.correctAnswer || 0);
        } else if (q.type === 'essay' || q.type === 'math') {
            setQKeyAnswer(q.keyAnswer || '');
        } else if (q.type === 'coding') {
            setCodingLanguage(q.codingLanguage || 'javascript');
            setQKeyAnswer(q.keyAnswer || '');
        }
    };

    const saveQuestion = () => {
        if (!qText.trim()) {
            showToast('Pertanyaan wajib diisi!', 'error');
            return;
        }

        const newQuestion: Question = {
            type: currentQType,
            question: qText,
            points: qPoints,
            image: qImage || undefined,
        };

        if (currentQType === 'multiple_choice') {
            if (options.some(opt => !opt.trim())) {
                showToast('Semua opsi jawaban harus diisi!', 'error');
                return;
            }
            newQuestion.options = options;
            newQuestion.correctAnswer = correctOption;
        } else if (currentQType === 'essay') {
            newQuestion.keyAnswer = qKeyAnswer;
        } else if (currentQType === 'coding') {
            newQuestion.codingLanguage = codingLanguage;
            newQuestion.keyAnswer = qKeyAnswer; // Optional: expected output/code
        } else if (currentQType === 'math') {
            newQuestion.keyAnswer = qKeyAnswer;
        }

        if (editingIndex !== null) {
            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = newQuestion;
            setQuestions(updatedQuestions);
            showToast('Soal diperbarui', 'success');
        } else {
            setQuestions([...questions, newQuestion]);
            showToast('Soal ditambahkan', 'success');
        }

        resetQuestionForm();
    };

    const removeQuestion = (index: number) => {
        if (window.confirm('Hapus soal ini?')) {
            setQuestions(questions.filter((_, i) => i !== index));
            if (editingIndex === index) {
                resetQuestionForm();
            }
        }
    };

    const handleNextToQuestions = () => {
        if (!title || !selectedClassId || !subject || !startTime || !endTime) {
            showToast('Mohon lengkapi semua data ujian!', 'error');
            return;
        }
        setStep('questions');
    };

    const handleSubmitExam = async () => {
        if (questions.length === 0) {
            showToast('Minimal harus ada 1 soal!', 'error');
            return;
        }

        setLoading(true);
        try {
            await examAPI.create({
                title,
                classId: selectedClassId,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                duration,
                questions
            });

            showToast('Ujian berhasil dibuat!', 'success');
            loadData(); // Reload list
            setMode('list'); // Back to list
            resetForm(); // Reset all form data
        } catch (error) {
            console.error(error);
            showToast('Gagal membuat ujian', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setSelectedClassId('');
        setSubject('');
        setStartTime('');
        setEndTime('');
        setDuration(60);
        setQuestions([]);
        setStep('meta');
        resetQuestionForm();
    };

    if (mode === 'list') {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <span className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                                <BookOpenIcon className="w-8 h-8" />
                            </span>
                            Manajemen Ujian
                        </h2>
                        <p className="text-slate-500 font-medium mt-2">
                            Buat dan kelola jadwal ujian untuk kelas Anda.
                        </p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setMode('create'); }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Buat Ujian Baru
                    </button>
                </div>

                {/* Exam List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-slate-400">Loading...</div>
                    ) : exams.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <BookOpenIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Belum Ada Ujian</h3>
                            <p className="text-slate-400 font-medium">Buat ujian pertama Anda sekarang.</p>
                        </div>
                    ) : (
                        exams.map(exam => (
                            <div key={exam._id || exam.id} className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        {/* Ideally replace with class name lookup */}
                                        {classes.find(c => (c._id || c.id) === (typeof exam.classId === 'string' ? exam.classId : exam.classId._id))?.name || 'Unknown Class'}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">{exam.duration} Menit</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 line-clamp-2">{exam.title}</h3>
                                <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-1">{exam.questions?.length || 0} Soal</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                        <ClockIcon className="w-4 h-4" />
                                        {new Date(exam.startTime).toLocaleDateString('id-ID')}
                                    </div>
                                    <button className="text-indigo-600 font-bold text-xs uppercase tracking-wider hover:underline">
                                        Detail
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20 animate-in slide-in-from-bottom-10 duration-500">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[120] px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-10 ${toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
                    }`}>
                    <span className="font-bold text-sm">{toast.msg}</span>
                </div>
            )}

            {/* Header Steps */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMode('list')}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                            <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs">Ex</span>
                            Buat Ujian Baru
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <StepIndicator active={step === 'meta'} done={step !== 'meta'} label="Info" num={1} />
                        <div className="w-8 h-0.5 bg-slate-100"></div>
                        <StepIndicator active={step === 'questions'} done={step === 'review'} label="Soal" num={2} />
                        <div className="w-8 h-0.5 bg-slate-100"></div>
                        <StepIndicator active={step === 'review'} done={false} label="Review" num={3} />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {step === 'meta' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Judul Ujian</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all"
                                    placeholder="Contoh: Ujian Tengah Semester Ganjil"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Kelas</label>
                                <select
                                    value={selectedClassId}
                                    onChange={handleClassChange}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all"
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {classes.map(c => (
                                        <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mata Pelajaran</label>
                                <input
                                    value={subject}
                                    readOnly
                                    className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-0 font-bold text-slate-500 cursor-not-allowed"
                                    placeholder="Otomatis dari kelas"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Waktu Mulai</label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Waktu Selesai</label>
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Durasi (Menit)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={e => setDuration(Number(e.target.value))}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                onClick={handleNextToQuestions}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95"
                            >
                                Lanjut ke Soal <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 'questions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
                        {/* Editor Column */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black text-slate-800 text-lg">
                                        {editingIndex !== null ? `Edit Soal #${editingIndex + 1}` : 'Buat Soal Baru'}
                                    </h3>
                                    {editingIndex !== null && (
                                        <button
                                            onClick={resetQuestionForm}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                        >
                                            Batal Edit
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                                    <TypeButton
                                        active={currentQType === 'essay'}
                                        onClick={() => setCurrentQType('essay')}
                                        icon={<DocumentTextIcon className="w-4 h-4" />}
                                        label="Essay"
                                    />
                                    <TypeButton
                                        active={currentQType === 'multiple_choice'}
                                        onClick={() => setCurrentQType('multiple_choice')}
                                        icon={<ListBulletIcon className="w-4 h-4" />}
                                        label="Pilihan Ganda"
                                    />
                                    <TypeButton
                                        active={currentQType === 'math'}
                                        onClick={() => setCurrentQType('math')}
                                        icon={<CalculatorIcon className="w-4 h-4" />}
                                        label="Matematika"
                                    />
                                    <TypeButton
                                        active={currentQType === 'coding'}
                                        onClick={() => setCurrentQType('coding')}
                                        icon={<CodeBracketIcon className="w-4 h-4" />}
                                        label="Coding"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-grow">
                                            <textarea
                                                value={qText}
                                                onChange={e => setQText(e.target.value)}
                                                placeholder={currentQType === 'math' ? 'Tulis soal matematika (gunakan LaTeX untuk rumus, e.g. $E=mc^2$)...' : "Tulis pertanyaan..."}
                                                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 h-32 font-medium text-slate-700 resize-none transition-all"
                                            />
                                        </div>
                                        <div className="flex-shrink-0">
                                            <label className="w-32 h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all text-slate-400 hover:text-indigo-500">
                                                {qImage ? (
                                                    <img src={qImage} className="w-full h-full object-cover rounded-2xl" alt="Question" />
                                                ) : (
                                                    <>
                                                        <PhotoIcon className="w-8 h-8 mb-2" />
                                                        <span className="text-[10px] font-black uppercase">Upload Gambar</span>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Type Specific Inputs */}
                                    {currentQType === 'multiple_choice' && (
                                        <div className="space-y-3 bg-slate-50 p-6 rounded-2xl">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Opsi Jawaban</label>
                                            {options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setCorrectOption(idx)}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${correctOption === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-slate-300 hover:border-indigo-400'}`}
                                                    >
                                                        {correctOption === idx && <CheckCircleIcon className="w-5 h-5" />}
                                                    </button>
                                                    <input
                                                        value={opt}
                                                        onChange={e => {
                                                            const newOpts = [...options];
                                                            newOpts[idx] = e.target.value;
                                                            setOptions(newOpts);
                                                        }}
                                                        placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                                                        className="flex-grow p-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm font-medium transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(currentQType === 'essay' || currentQType === 'math') && (
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Kunci Jawaban / Referensi</label>
                                            <textarea
                                                value={qKeyAnswer}
                                                onChange={e => setQKeyAnswer(e.target.value)}
                                                placeholder="Jawaban benar atau kata kunci penilaian..."
                                                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 h-24 font-medium text-slate-700 resize-none transition-all"
                                            />
                                        </div>
                                    )}

                                    {currentQType === 'coding' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bahasa Pemrograman</label>
                                                <select
                                                    value={codingLanguage}
                                                    onChange={e => setCodingLanguage(e.target.value)}
                                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition-all"
                                                >
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="java">Java</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expected Output (Optional)</label>
                                                <input
                                                    value={qKeyAnswer}
                                                    onChange={e => setQKeyAnswer(e.target.value)}
                                                    placeholder="Output yang diharapkan..."
                                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Poin:</span>
                                            <input
                                                type="number"
                                                value={qPoints}
                                                onChange={e => setQPoints(Number(e.target.value))}
                                                className="w-20 p-2 bg-slate-50 rounded-xl border-none text-center font-bold"
                                            />
                                        </div>
                                        <button
                                            onClick={saveQuestion}
                                            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 ${editingIndex !== null
                                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                                }`}
                                        >
                                            {editingIndex !== null ? (
                                                <><CheckCircleIcon className="w-4 h-4" /> Simpan Perubahan</>
                                            ) : (
                                                <><PlusIcon className="w-4 h-4" /> Tambah Soal</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar List */}
                        <div className="lg:col-span-4 max-h-[800px] flex flex-col">
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
                                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                    <h3 className="font-black text-slate-800">Daftar Soal</h3>
                                    <p className="text-xs text-slate-400 font-bold mt-1">{questions.length} soal ditambahkan</p>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {questions.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400">
                                            <p className="text-xs font-bold">Belum ada soal.</p>
                                        </div>
                                    ) : (
                                        questions.map((q, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => loadQuestionForEdit(idx)}
                                                className={`p-4 border rounded-2xl transition-all group relative cursor-pointer ${editingIndex === idx
                                                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                                                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
                                                    }`}
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                                                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                                <div className="flex gap-3">
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${editingIndex === idx ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{q.type}</span>
                                                            <span className="text-[9px] font-bold text-slate-400">{q.points} pts</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700 line-clamp-2">{q.question}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStep('meta')}
                                            className="px-4 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setStep('review')}
                                            className="flex-grow px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                        >
                                            Review & Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'review' && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                    <BookOpenIcon className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{title}</h3>
                                <p className="text-slate-500 font-medium">{subject} • {duration} Menit</p>
                            </div>

                            <div className="space-y-4 bg-slate-50 p-6 rounded-3xl mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Waktu Mulai</span>
                                    <span className="font-black text-slate-700">{startTime ? new Date(startTime).toLocaleString() : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Waktu Selesai</span>
                                    <span className="font-black text-slate-700">{endTime ? new Date(endTime).toLocaleString() : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Total Soal</span>
                                    <span className="font-black text-indigo-600">{questions.length} Butir</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep('questions')}
                                    className="py-4 rounded-xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest"
                                    disabled={loading}
                                >
                                    Edit Kembali
                                </button>
                                <button
                                    onClick={handleSubmitExam}
                                    disabled={loading}
                                    className="py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Menyimpan...' : 'Terbitkan Ujian'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StepIndicator: React.FC<{ active: boolean, done: boolean, label: string, num: number }> = ({ active, done, label, num }) => (
    <div className={`flex items-center gap-3 ${active ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {done ? <CheckCircleIcon className="w-5 h-5" /> : num}
        </div>
        <span className={`text-xs font-bold uppercase tracking-widest hidden md:block ${active ? 'text-indigo-900' : 'text-slate-400'}`}>{label}</span>
    </div>
);

const TypeButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
    >
        {icon}
        {label}
    </button>
);

export default CreateExam;
