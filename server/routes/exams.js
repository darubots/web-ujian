import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    getClassById
} from '../services/storageService.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/exams
 * Get exams based on user role
 */
router.get('/', async (req, res) => {
    try {
        const { role, _id, id, classes } = req.user;
        const userId = _id || id;

        let exams;

        if (role === 'guru') {
            // Get exams from classes taught by this teacher
            exams = await getExams();
            // Filter by teacher
            exams = exams.filter(exam => {
                const classId = exam.classId?._id || exam.classId;
                return exam.classId?.teacherId?.toString() === userId.toString();
            });
        } else if (role === 'siswa') {
            // Get exams from classes joined by student
            const now = new Date();
            exams = await getExams({
                isPublished: true,
                classId: { $in: classes || [] }
            });

            // Add status based on time
            exams = exams.map(exam => ({
                ...exam.toObject ? exam.toObject() : exam,
                status: now < new Date(exam.startTime) ? 'upcoming' :
                    now > new Date(exam.endTime) ? 'completed' : 'active'
            }));
        } else if (role === 'owner') {
            exams = await getExams();
        } else {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(exams);
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({ error: 'Failed to get exams' });
    }
});

/**
 * POST /api/exams
 * Create new exam (Guru only)
 */
router.post('/', requireRole('guru', 'owner'), async (req, res) => {
    try {
        const { classId, title, description, startTime, endTime, duration, questions, settings } = req.body;

        // Validation
        if (!classId || !title || !startTime || !endTime || !questions || questions.length === 0) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify class ownership
        const classDoc = await getClassById(classId);
        if (!classDoc) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const userId = String(req.user._id || req.user.id);
        if (req.user.role !== 'owner' && String(classDoc.teacherId._id || classDoc.teacherId) !== userId) {
            return res.status(403).json({ error: 'You can only create exams for your own classes' });
        }

        // Calculate duration if not provided
        const calculatedDuration = duration || Math.ceil((new Date(endTime) - new Date(startTime)) / 60000);

        const newExam = await createExam({
            classId,
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration: calculatedDuration,
            questions,
            settings: settings || {},
            isPublished: false
        });

        res.status(201).json(newExam);
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({ error: error.message || 'Failed to create exam' });
    }
});

/**
 * GET /api/exams/:id
 * Get exam detail
 */
router.get('/:id', async (req, res) => {
    try {
        const exam = await getExamById(req.params.id);

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Check access
        const userId = String(req.user._id || req.user.id);
        const classId = exam.classId?._id || exam.classId;

        // Get full class data
        const classDoc = await getClassById(classId);

        const canAccess =
            req.user.role === 'owner' ||
            String(classDoc?.teacherId?._id || classDoc?.teacherId) === userId ||
            classDoc?.students?.some(s => String(s._id || s) === userId);

        if (!canAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Hide answers from students
        let responseExam = exam.toObject ? exam.toObject() : { ...exam };
        if (req.user.role === 'siswa') {
            responseExam.questions = responseExam.questions.map(q => {
                const sanitized = { ...q };
                delete sanitized.keyAnswer;
                delete sanitized.correctAnswer;
                return sanitized;
            });
        }

        res.json(responseExam);
    } catch (error) {
        console.error('Get exam error:', error);
        res.status(500).json({ error: 'Failed to get exam' });
    }
});

/**
 * PUT /api/exams/:id
 * Update exam (Guru/Owner only)
 */
router.put('/:id', requireRole('guru', 'owner'), async (req, res) => {
    try {
        const exam = await getExamById(req.params.id);

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Check ownership
        const classId = exam.classId?._id || exam.classId;
        const classDoc = await getClassById(classId);
        const userId = String(req.user._id || req.user.id);

        if (req.user.role !== 'owner' && String(classDoc?.teacherId?._id || classDoc?.teacherId) !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const allowedUpdates = ['title', 'description', 'startTime', 'endTime', 'duration', 'questions', 'settings', 'isPublished'];
        const updates = {};

        for (const field of allowedUpdates) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const updated = await updateExam(req.params.id, updates);
        res.json(updated);
    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({ error: error.message || 'Failed to update exam' });
    }
});

/**
 * DELETE /api/exams/:id
 * Delete exam (Guru/Owner only)
 */
router.delete('/:id', requireRole('guru', 'owner'), async (req, res) => {
    try {
        const exam = await getExamById(req.params.id);

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Check ownership
        const classId = exam.classId?._id || exam.classId;
        const classDoc = await getClassById(classId);
        const userId = String(req.user._id || req.user.id);

        if (req.user.role !== 'owner' && String(classDoc?.teacherId?._id || classDoc?.teacherId) !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await deleteExam(req.params.id);
        res.json({ success: true, message: 'Exam deleted' });
    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete exam' });
    }
});

/**
 * POST /api/exams/:id/publish
 * Publish exam to class (Guru only)
 */
router.post('/:id/publish', requireRole('guru', 'owner'), async (req, res) => {
    try {
        const exam = await getExamById(req.params.id);

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Check ownership
        const classId = exam.classId?._id || exam.classId;
        const classDoc = await getClassById(classId);
        const userId = String(req.user._id || req.user.id);

        if (req.user.role !== 'owner' && String(classDoc?.teacherId?._id || classDoc?.teacherId) !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updated = await updateExam(req.params.id, { isPublished: true });
        res.json({ success: true, message: 'Exam published', exam: updated });
    } catch (error) {
        console.error('Publish exam error:', error);
        res.status(500).json({ error: 'Failed to publish exam' });
    }
});

export default router;
