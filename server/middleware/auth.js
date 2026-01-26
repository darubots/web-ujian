import jwt from 'jsonwebtoken';
import { getUserById } from '../services/storageService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const user = await getUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.isSuspended) {
            return res.status(403).json({ error: 'Account suspended' });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

/**
 * Generate JWT token for user
 */
export const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: '7d' } // Token valid for 7 days
    );
};

export default { authMiddleware, requireRole, generateToken };
