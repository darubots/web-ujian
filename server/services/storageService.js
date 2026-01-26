import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { isMongoConnected } from '../db/connection.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Exam from '../models/Exam.js';
import Submission from '../models/Submission.js';
import Settings from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to local JSON files
const DB_PATH = path.join(__dirname, '../../database');

/**
 * Hybrid Storage Service
 * Automatically uses MongoDB if connected, otherwise uses local JSON files
 */

// ==========USERS ==========

export const getUsers = async () => {
    if (isMongoConnected()) {
        return await User.find().select('-password');
    } else {
        const adminData = JSON.parse(await fs.readFile(path.join(DB_PATH, 'admin.json'), 'utf-8'));
        const siswaData = JSON.parse(await fs.readFile(path.join(DB_PATH, 'siswa.json'), 'utf-8'));
        return [...adminData, ...siswaData];
    }
};

export const getUserById = async (id) => {
    if (isMongoConnected()) {
        return await User.findById(id).select('-password');
    } else {
        const users = await getUsers();
        return users.find(u => u.id === id || u._id === id);
    }
};

export const getUserByUsername = async (username) => {
    if (isMongoConnected()) {
        return await User.findOne({ username });
    } else {
        const users = await getUsers();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }
};

export const getUserByNisn = async (nisn) => {
    if (isMongoConnected()) {
        return await User.findOne({ nisn: String(nisn) });
    } else {
        const users = await getUsers();
        return users.find(u => String(u.nisn) === String(nisn));
    }
};

export const createUser = async (userData) => {
    if (isMongoConnected()) {
        const user = new User(userData);
        await user.save();
        return user;
    } else {
        // Local storage - hash password before saving
        const hashedPassword = userData.password
            ? await bcrypt.hash(userData.password, 10)
            : null;

        const newUser = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...userData,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const filePath = userData.role === 'siswa'
            ? path.join(DB_PATH, 'siswa.json')
            : path.join(DB_PATH, 'admin.json');

        const existing = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        existing.push(newUser);
        await fs.writeFile(filePath, JSON.stringify(existing, null, 2));

        return newUser;
    }
};

export const updateUser = async (id, updates) => {
    if (isMongoConnected()) {
        return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    } else {
        // Local storage update
        const users = await getUsers();
        const index = users.findIndex(u => u.id === id || u._id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates, updatedAt: new Date() };
            // Save back to file (simplified - in production need to split by role)
            return users[index];
        }
        return null;
    }
};

export const deleteUser = async (id) => {
    if (isMongoConnected()) {
        return await User.findByIdAndDelete(id);
    } else {
        // Local storage delete
        const users = await getUsers();
        const filtered = users.filter(u => u.id !== id && u._id !== id);
        // Save back to files (simplified)
        return true;
    }
};

// ========== CLASSES ==========

export const getClasses = async (filter = {}) => {
    if (isMongoConnected()) {
        return await Class.find(filter).populate('teacherId', 'username email').populate('students', 'username nisn');
    } else {
        // Local: return empty array for now (classes are new feature)
        return [];
    }
};

export const getClassById = async (id) => {
    if (isMongoConnected()) {
        return await Class.findById(id)
            .populate('teacherId', 'username email')
            .populate('students', 'username nisn')
            .populate('exams');
    } else {
        return null;
    }
};

export const getClassByInviteCode = async (code) => {
    if (isMongoConnected()) {
        return await Class.findOne({ inviteCode: code });
    } else {
        return null;
    }
};

export const createClass = async (classData) => {
    if (isMongoConnected()) {
        const newClass = new Class(classData);
        await newClass.save();
        return newClass;
    } else {
        throw new Error('Classes require MongoDB connection');
    }
};

export const updateClass = async (id, updates) => {
    if (isMongoConnected()) {
        return await Class.findByIdAndUpdate(id, updates, { new: true });
    } else {
        throw new Error('Classes require MongoDB connection');
    }
};

export const deleteClass = async (id) => {
    if (isMongoConnected()) {
        return await Class.findByIdAndDelete(id);
    } else {
        throw new Error('Classes require MongoDB connection');
    }
};

export const addStudentToClass = async (classId, studentId) => {
    if (isMongoConnected()) {
        const classDoc = await Class.findById(classId);
        if (!classDoc.students.includes(studentId)) {
            classDoc.students.push(studentId);
            await classDoc.save();
        }

        const user = await User.findById(studentId);
        if (!user.classes.includes(classId)) {
            user.classes.push(classId);
            await user.save();
        }

        return classDoc;
    } else {
        throw new Error('Classes require MongoDB connection');
    }
};

// ========== EXAMS ==========

export const getExams = async (filter = {}) => {
    if (isMongoConnected()) {
        return await Exam.find(filter).populate('classId', 'name subject');
    } else {
        // Return legacy format if available
        try {
            const mapelData = JSON.parse(await fs.readFile(path.join(DB_PATH, 'mapel-ujiannya.json'), 'utf-8'));
            return mapelData;
        } catch {
            return [];
        }
    }
};

export const getExamById = async (id) => {
    if (isMongoConnected()) {
        return await Exam.findById(id).populate('classId');
    } else {
        return null;
    }
};

export const createExam = async (examData) => {
    if (isMongoConnected()) {
        const exam = new Exam(examData);
        await exam.save();

        // Add exam to class
        await Class.findByIdAndUpdate(examData.classId, {
            $push: { exams: exam._id }
        });

        return exam;
    } else {
        throw new Error('Exams require MongoDB connection');
    }
};

export const updateExam = async (id, updates) => {
    if (isMongoConnected()) {
        return await Exam.findByIdAndUpdate(id, updates, { new: true });
    } else {
        throw new Error('Exams require MongoDB connection');
    }
};

export const deleteExam = async (id) => {
    if (isMongoConnected()) {
        const exam = await Exam.findById(id);
        if (exam) {
            // Remove from class
            await Class.findByIdAndUpdate(exam.classId, {
                $pull: { exams: id }
            });
        }
        return await Exam.findByIdAndDelete(id);
    } else {
        throw new Error('Exams require MongoDB connection');
    }
};

// ========== SUBMISSIONS ==========

export const getSubmissions = async (filter = {}) => {
    if (isMongoConnected()) {
        return await Submission.find(filter)
            .populate('studentId', 'username nisn')
            .populate('examId', 'title')
            .populate('classId', 'name subject');
    } else {
        return [];
    }
};

export const getSubmissionById = async (id) => {
    if (isMongoConnected()) {
        return await Submission.findById(id)
            .populate('studentId', 'username nisn')
            .populate('examId')
            .populate('classId');
    } else {
        return null;
    }
};

export const createSubmission = async (submissionData) => {
    if (isMongoConnected()) {
        const submission = new Submission(submissionData);
        await submission.save();
        return submission;
    } else {
        throw new Error('Submissions require MongoDB connection');
    }
};

export const updateSubmission = async (id, updates) => {
    if (isMongoConnected()) {
        return await Submission.findByIdAndUpdate(id, updates, { new: true });
    } else {
        throw new Error('Submissions require MongoDB connection');
    }
};

// ========== SETTINGS ==========

export const getSettings = async () => {
    if (isMongoConnected()) {
        return await Settings.get();
    } else {
        return {
            geminiApiKey: process.env.GEMINI_API_KEY || '',
            mongodbUrl: process.env.MONGODB_URL || '',
            storageMode: 'local',
            appName: 'Web Ujian AI'
        };
    }
};

export const updateSettings = async (updates, userId) => {
    if (isMongoConnected()) {
        const settings = await Settings.get();
        Object.assign(settings, updates, { updatedBy: userId });
        await settings.save();
        return settings;
    } else {
        throw new Error('Settings management requires MongoDB connection');
    }
};

export default {
    getUsers,
    getUserById,
    getUserByUsername,
    getUserByNisn,
    createUser,
    updateUser,
    deleteUser,
    getClasses,
    getClassById,
    getClassByInviteCode,
    createClass,
    updateClass,
    deleteClass,
    addStudentToClass,
    getExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    getSubmissions,
    getSubmissionById,
    createSubmission,
    updateSubmission,
    getSettings,
    updateSettings
};
