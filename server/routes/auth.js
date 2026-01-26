import express from 'express';
import bcrypt from 'bcryptjs';
import {
    getUserByUsername,
    getUserByNisn,
    createUser,
    updateUser
} from '../services/storageService.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login for all user roles
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password, nisn, role } = req.body;

        // Validation
        if (!role) {
            return res.status(400).json({ error: 'Role is required' });
        }

        let user;

        if (role === 'siswa') {
            // Student login with NISN
            if (!username || !nisn) {
                return res.status(400).json({ error: 'Username and NISN required for student' });
            }

            user = await getUserByNisn(nisn);

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            if (user.username.toLowerCase() !== username.toLowerCase()) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

        } else {
            // Guru/Owner login with username & password
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password required' });
            }

            user = await getUserByUsername(username);

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check if user has the 'comparePassword' method (MongoDB)
            let passwordMatch;
            if (typeof user.comparePassword === 'function') {
                passwordMatch = await user.comparePassword(password);
            } else {
                // Local storage - use bcrypt to compare hashed password
                passwordMatch = await bcrypt.compare(password, user.password);
            }

            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            if (user.role !== role) {
                return res.status(403).json({ error: 'Invalid role for this user' });
            }
        }

        // Check if suspended
        if (user.isSuspended) {
            return res.status(403).json({ error: 'Account suspended. Contact administrator.' });
        }

        // Update last active
        await updateUser(user._id || user.id, {
            lastActive: new Date(),
            isOnline: true
        });

        // Generate JWT token
        const token = generateToken(user._id || user.id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id || user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                nisn: user.nisn
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/auth/register
 * Register new user (Owner only, or self-registration for students if enabled)
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, nisn } = req.body;

        // Validation
        if (!username || !role) {
            return res.status(400).json({ error: 'Username and role are required' });
        }

        if (role !== 'siswa' && !password) {
            return res.status(400).json({ error: 'Password required for guru/owner' });
        }

        if (role === 'siswa' && !nisn) {
            return res.status(400).json({ error: 'NISN required for students' });
        }

        // Check if user exists
        const existingUser = role === 'siswa'
            ? await getUserByNisn(nisn)
            : await getUserByUsername(username);

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const userData = {
            username,
            email,
            role,
            nisn,
            password: password || Math.random().toString(36), // Random password for siswa
            isSuspended: false
        };

        const newUser = await createUser(userData);

        res.status(201).json({
            success: true,
            user: {
                id: newUser._id || newUser.id,
                username: newUser.username,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req, res) => {
    try {
        // In a full implementation, you might want to invalidate the token
        // For now, just update user status
        const userId = req.body.userId;
        if (userId) {
            await updateUser(userId, { isOnline: false });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

export default router;
