// User roles
export type UserRole = 'owner' | 'guru' | 'siswa';

// Question types
export type QuestionType = 'essay' | 'multiple_choice' | 'math' | 'coding';

// Exam/submission status
export type ExamStatus = 'upcoming' | 'active' | 'completed';
export type SubmissionStatus = 'in_progress' | 'submitted' | 'graded';

// User interface
export interface User {
  id?: string;
  _id?: string;
  username: string;
  email?: string;
  role: UserRole;
  nisn?: string; // For students
  classes?: string[]; // Class IDs
  lastActive?: Date;
  isOnline?: boolean;
  isSuspended?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Class interface
export interface Class {
  id?: string;
  _id?: string;
  name: string;
  subject: string;
  grade?: string;
  description?: string;
  teacherId: string | User;
  inviteCode: string;
  students: (string | User)[];
  exams: (string | Exam)[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Question interface
export interface Question {
  type: QuestionType;
  question: string;
  image?: string; // URL or base64
  // For essay
  keyAnswer?: string;
  // For multiple choice
  options?: string[];
  correctAnswer?: number; // index
  // For coding
  codingLanguage?: string;
  points: number;
}

// Exam interface
export interface Exam {
  id?: string;
  _id?: string;
  classId: string | Class;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  duration: number; // minutes
  questions: Question[];
  isPublished: boolean;
  settings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResults: boolean;
    allowReview: boolean;
  };
  status?: ExamStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// Answer interface
export interface Answer {
  questionIndex: number;
  questionType: QuestionType;
  answer: string | number; // string for essay, number for MC
  isCorrect?: boolean;
  score?: number;
  aiFeedback?: string;
}

// Submission interface
export interface Submission {
  id?: string;
  _id?: string;
  examId: string | Exam;
  studentId: string | User;
  classId: string | Class;
  answers: Answer[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: SubmissionStatus;
  startedAt: Date | string;
  submittedAt?: Date | string;
  gradedAt?: Date | string;
  timeSpent: number; // seconds
  createdAt?: Date;
  updatedAt?: Date;
}

// Settings interface
export interface Settings {
  id?: string;
  _id?: string;
  geminiApiKey?: string;
  mongodbUrl?: string;
  storageMode: 'local' | 'mongodb';
  appName: string;
  currentStorageMode?: string;
  updatedBy?: string;
  updatedAt?: Date;
}

// Real-time status
export interface StudentStatus {
  id: string;
  username: string;
  nisn?: string;
  isOnline: boolean;
  lastActive?: Date;
}

export interface ExamProgress {
  submissionId: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  startedAt: Date | string;
  answeredCount: number;
}

// API Response types
export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    role: UserRole;
    nisn?: string;
  };
}

export interface ApiError {
  error: string;
  stack?: string;
}

// Legacy types (backward compatibility)
export interface StudentAnswer {
  question: Question;
  answer: string;
}

export interface StudentResult {
  studentName: string;
  studentNisn: string;
  score: number;
  submissionTime: string;
  answers: StudentAnswer[];
}

export interface ExamSettings {
  startTime: string;
  endTime: string;
  subject: string;
}
