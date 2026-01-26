import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../services/storageService.js';

const router = express.Router();

// All routes require authentication and owner role
router.use(authMiddleware);
router.use(requireRole('owner'));

/**
 * GET /api/users
 * Get all users
 */
router.get('/', async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

/**
 * POST /api/users
 * Create new user
 */
router.post('/', async (req, res) => {
    try {
        const { username, email, password, role, nisn } = req.body;

        if (!username || !role) {
            return res.status(400).json({ error: 'Username and role are required' });
        }

        const newUser = await createUser({
            username,
            email,
            password,
            role,
            nisn,
            isSuspended: false
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: error.message || 'Failed to create user' });
    }
});

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/:id', async (req, res) => {
    try {
        const allowedUpdates = ['username', 'email', 'nisn', 'isSuspended'];
        const updates = {};

        for (const field of allowedUpdates) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const updated = await updateUser(req.params.id, updates);
        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updated);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: error.message || 'Failed to update user' });
    }
});

/**
 * DELETE /api/users/:id
 * Delete user
 */
router.delete('/:id', async (req, res) => {
    try {
        // Prevent deleting self
        if (String(req.params.id) === String(req.user._id || req.user.id)) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await deleteUser(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
});

/**
 * PUT /api/users/:id/suspend
 * Toggle user suspension
 */
router.put('/:id/suspend', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updated = await updateUser(req.params.id, {
            isSuspended: !user.isSuspended
        });

        res.json({
            success: true,
            message: `User ${updated.isSuspended ? 'suspended' : 'activated'}`,
            user: updated
        });
    } catch (error) {
        console.error('Toggle suspend error:', error);
        res.status(500).json({ error: 'Failed to toggle suspension' });
    }
});

export default router;
