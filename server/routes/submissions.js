import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getSubmissions,
    getSubmissionById,
    createSubmission,
    updateSubmission,
    getExamById
} from '../services/storageService.js';
import { gradeAnswer } from '../services/gradingService.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/submissions
 * Get submissions for current user
 */
router.get('/', async (req, res) => {
    try {
        const { role, _id, id } = req.user;
        const userId = _id || id;

        let submissions;

        if (role === 'siswa') {
            // Get student's own submissions
            submissions = await getSubmissions({ studentId: userId });
        } else if (role === 'guru') {
            // Get submissions for teacher's classes
            // This requires more complex query - simplified for now
            submissions = await getSubmissions();
        } else if (role === 'owner') {
            submissions = await getSubmissions();
        } else {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(submissions);
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ error: 'Failed to get submissions' });
    }
});

/**
 * POST /api/submissions/start
 * Start taking an exam
 */
router.post('/start', requireRole('siswa'), async (req, res) => {
    try {
        const { examId } = req.body;

        if (!examId) {
            return res.status(400).json({ error: 'Exam ID is required' });
        }

        const exam = await getExamById(examId);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Check if exam is active
        const now = new Date();
        if (now < new Date(exam.startTime) || now > new Date(exam.endTime)) {
            return res.status(400).json({ error: 'Exam is not currently active' });
        }

        // Check if already submitted
        const existing = await getSubmissions({
            examId,
            studentId: req.user._id || req.user.id,
            status: { $in: ['submitted', 'graded'] }
        });

        if (existing && existing.length > 0) {
            return res.status(400).json({ error: 'You have already submitted this exam' });
        }

        // Create submission
        const submission = await createSubmission({
            examId,
            studentId: req.user._id || req.user.id,
            classId: exam.classId,
            answers: [],
            status: 'in_progress',
            startedAt: new Date()
        });

        res.status(201).json(submission);
    } catch (error) {
        console.error('Start submission error:', error);
        res.status(500).json({ error: error.message || 'Failed to start submission' });
    }
});

/**
 * POST /api/submissions/submit
 * Submit exam answers for grading
 */
router.post('/submit', requireRole('siswa'), async (req, res) => {
    try {
        const { submissionId, answers } = req.body;

        if (!submissionId || !answers) {
            return res.status(400).json({ error: 'Submission ID and answers are required' });
        }

        const submission = await getSubmissionById(submissionId);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // Verify ownership
        if (String(submission.studentId._id || submission.studentId) !== String(req.user._id || req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const exam = await getExamById(submission.examId._id || submission.examId);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Grade answers
        const gradedAnswers = await gradeAnswer(exam.questions, answers);

        // Calculate total score
        const totalScore = gradedAnswers.reduce((sum, ans) => sum + (ans.score || 0), 0);
        const maxScore = exam.questions.reduce((sum, q) => sum + (q.points || 10), 0);
        const percentage = (totalScore / maxScore) * 100;

        // Update submission
        const timeSpent = Math.floor((new Date() - new Date(submission.startedAt)) / 1000);

        await updateSubmission(submissionId, {
            answers: gradedAnswers,
            totalScore,
            maxScore,
            percentage,
            status: 'graded',
            submittedAt: new Date(),
            gradedAt: new Date(),
            timeSpent
        });

        res.json({
            success: true,
            score: totalScore,
            maxScore,
            percentage: percentage.toFixed(2),
            answers: gradedAnswers
        });

    } catch (error) {
        console.error('Submit exam error:', error);
        res.status(500).json({ error: error.message || 'Failed to submit exam' });
    }
});

/**
 * GET /api/submissions/:id
 * Get submission detail
 */
router.get('/:id', async (req, res) => {
    try {
        const submission = await getSubmissionById(req.params.id);

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // Check access
        const userId = String(req.user._id || req.user.id);
        const studentId = String(submission.studentId._id || submission.studentId);

        const canAccess =
            req.user.role === 'owner' ||
            req.user.role === 'guru' || // Simplified - should check if teacher owns the class
            studentId === userId;

        if (!canAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Failed to get submission' });
    }
});

/**
 * GET /api/submissions/exam/:examId
 * Get all submissions for an exam (Guru/Owner only)
 */
router.get('/exam/:examId', requireRole('guru', 'owner'), async (req, res) => {
    try {
        const submissions = await getSubmissions({ examId: req.params.examId });
        res.json(submissions);
    } catch (error) {
        console.error('Get exam submissions error:', error);
        res.status(500).json({ error: 'Failed to get submissions' });
    }
});

export default router;
