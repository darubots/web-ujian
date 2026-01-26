import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getUsers, updateUser, getSubmissions } from '../services/storageService.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/realtime/heartbeat
 * Update user's online status
 */
router.post('/heartbeat', async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        await updateUser(userId, {
            lastActive: new Date(),
            isOnline: true
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Heartbeat error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

/**
 * GET /api/realtime/status
 * Get online status of students (for monitoring)
 */
router.get('/status', async (req, res) => {
    try {
        const { classId } = req.query;

        // Get all users (filter by class if needed)
        const users = await getUsers();

        // Consider user online if last active within 30 seconds
        const now = new Date();
        const onlineThreshold = 30 * 1000; // 30 seconds

        const statuses = users
            .filter(u => u.role === 'siswa')
            .map(u => ({
                id: u._id || u.id,
                username: u.username,
                nisn: u.nisn,
                isOnline: u.isOnline && (now - new Date(u.lastActive)) < onlineThreshold,
                lastActive: u.lastActive
            }));

        res.json(statuses);
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

/**
 * GET /api/realtime/progress
 * Get exam progress (who's taking which exam)
 */
router.get('/progress', async (req, res) => {
    try {
        const { examId } = req.query;

        const filter = examId ? { examId, status: 'in_progress' } : { status: 'in_progress' };
        const activeSubmissions = await getSubmissions(filter);

        const progress = activeSubmissions.map(sub => ({
            submissionId: sub._id || sub.id,
            studentId: sub.studentId._id || sub.studentId,
            studentName: sub.studentId.username || 'Unknown',
            examId: sub.examId._id || sub.examId,
            examTitle: sub.examId.title || 'Unknown',
            startedAt: sub.startedAt,
            answeredCount: sub.answers?.length || 0
        }));

        res.json(progress);
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
});

export default router;
