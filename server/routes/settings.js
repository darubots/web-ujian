import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getSettings, updateSettings } from '../services/storageService.js';
import { connectDatabase, getStorageMode } from '../db/connection.js';

const router = express.Router();

// All routes require authentication and owner role
router.use(authMiddleware);
router.use(requireRole('owner'));

/**
 * GET /api/settings
 * Get app settings
 */
router.get('/', async (req, res) => {
    try {
        const settings = await getSettings();
        res.json({
            ...settings,
            currentStorageMode: getStorageMode()
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

/**
 * PUT /api/settings
 * Update settings
 */
router.put('/', async (req, res) => {
    try {
        const { geminiApiKey, mongodbUrl, appName } = req.body;
        const userId = req.user._id || req.user.id;

        const updates = {};
        if (geminiApiKey !== undefined) updates.geminiApiKey = geminiApiKey;
        if (mongodbUrl !== undefined) updates.mongodbUrl = mongodbUrl;
        if (appName !== undefined) updates.appName = appName;

        const updated = await updateSettings(updates, userId);

        res.json({
            success: true,
            message: 'Settings updated',
            settings: updated
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: error.message || 'Failed to update settings' });
    }
});

/**
 * POST /api/settings/test-db
 * Test MongoDB connection
 */
router.post('/test-db', async (req, res) => {
    try {
        const { mongodbUrl } = req.body;

        if (!mongodbUrl) {
            return res.status(400).json({ error: 'MongoDB URL is required' });
        }

        // Try to connect
        process.env.MONGODB_URL = mongodbUrl;
        await connectDatabase();

        const mode = getStorageMode();
        const success = mode === 'mongodb';

        res.json({
            success,
            mode,
            message: success ? 'Connected successfully' : 'Connection failed, using local storage'
        });
    } catch (error) {
        console.error('Test DB error:', error);
        res.json({
            success: false,
            mode: 'local',
            message: error.message || 'Connection failed'
        });
    }
});

export default router;
