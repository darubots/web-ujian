import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getClasses,
    getClassById,
    getClassByInviteCode,
    createClass,
    updateClass,
    deleteClass,
    addStudentToClass
} from '../services/storageService.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/classes
 * Get all classes for current user
 */
router.get('/', async (req, res) => {
    try {
        const { role, _id, id } = req.user;
        const userId = _id || id;

        let classes;
        if (role === 'guru') {
            // Get classes created by this teacher
            classes = await getClasses({ teacherId: userId });
        } else if (role === 'siswa') {
            // Get classes joined by this student
            classes = await getClasses({ students: userId });
        } else if (role === 'owner') {
            // Owner can see all classes
            classes = await getClasses();
        } else {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(classes);
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ error: 'Failed to get classes' });
    }
});

/**
 * POST /api/classes
 * Create new class (Guru only)
 */
router.post('/', requireRole('guru'), async (req, res) => {
    try {
        const { name, subject, grade, description } = req.body;

        if (!name || !subject) {
            return res.status(400).json({ error: 'Name and subject are required' });
        }

        const newClass = await createClass({
            name,
            subject,
            grade,
            description,
            teacherId: req.user._id || req.user.id,
            students: [],
            exams: []
        });

        res.status(201).json(newClass);
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ error: error.message || 'Failed to create class' });
    }
});

/**
 * GET /api/classes/:id
 * Get class detail
 */
router.get('/:id', async (req, res) => {
    try {
        const classDoc = await getClassById(req.params.id);

        if (!classDoc) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Check access
        const userId = String(req.user._id || req.user.id);
        const canAccess =
            req.user.role === 'owner' ||
            String(classDoc.teacherId._id || classDoc.teacherId) === userId ||
            classDoc.students.some(s => String(s._id || s.id) === userId);

        if (!canAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(classDoc);
    } catch (error) {
        console.error('Get class error:', error);
        res.status(500).json({ error: 'Failed to get class' });
    }
});

/**
 * PUT /api/classes/:id
 * Update class (Guru/Owner only)
 */
router.put('/:id', requireRole('guru', 'owner'), async (req, res) => {
    try {
        const classDoc = await getClassById(req.params.id);

        if (!classDoc) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Check if user owns this class (or is owner)
        if (req.user.role !== 'owner' && String(classDoc.teacherId) !== String(req.user._id || req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { name, subject, grade, description, isActive } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (subject) updates.subject = subject;
        if (grade !== undefined) updates.grade = grade;
        if (description !== undefined) updates.description = description;
        if (isActive !== undefined) updates.isActive = isActive;

        const updated = await updateClass(req.params.id, updates);
        res.json(updated);
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).json({ error: error.message || 'Failed to update class' });
    }
});

/**
 * DELETE /api/classes/:id
 * Delete class (Guru/Owner only)
 */
router.delete('/:id', requireRole('guru', 'owner'), async (req, res) => {
    try {
        const classDoc = await getClassById(req.params.id);

        if (!classDoc) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Check if user owns this class (or is owner)
        if (req.user.role !== 'owner' && String(classDoc.teacherId) !== String(req.user._id || req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await deleteClass(req.params.id);
        res.json({ success: true, message: 'Class deleted' });
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete class' });
    }
});

/**
 * POST /api/classes/join
 * Join class via invite code (Student only)
 */
router.post('/join', requireRole('siswa'), async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({ error: 'Invite code is required' });
        }

        const classDoc = await getClassByInviteCode(inviteCode);

        if (!classDoc) {
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        if (!classDoc.isActive) {
            return res.status(400).json({ error: 'This class is no longer active' });
        }

        // Check if already joined
        const userId = req.user._id || req.user.id;
        const alreadyJoined = classDoc.students.some(s => String(s._id || s) === String(userId));

        if (alreadyJoined) {
            return res.status(400).json({ error: 'You have already joined this class' });
        }

        // Add student to class
        await addStudentToClass(classDoc._id || classDoc.id, userId);

        const updated = await getClassById(classDoc._id || classDoc.id);
        res.json({
            success: true,
            message: `Successfully joined ${updated.name}`,
            class: updated
        });
    } catch (error) {
        console.error('Join class error:', error);
        res.status(500).json({ error: error.message || 'Failed to join class' });
    }
});

/**
 * GET /api/classes/:id/students
 * Get students in a class
 */
router.get('/:id/students', async (req, res) => {
    try {
        const classDoc = await getClassById(req.params.id);

        if (!classDoc) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Check access
        const userId = String(req.user._id || req.user.id);
        const canAccess =
            req.user.role === 'owner' ||
            String(classDoc.teacherId._id || classDoc.teacherId) === userId;

        if (!canAccess) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(classDoc.students || []);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to get students' });
    }
});

export default router;
