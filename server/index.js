import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDatabase, getStorageMode } from './db/connection.js';
import authRoutes from './routes/auth.js';
import classRoutes from './routes/classes.js';
import examRoutes from './routes/exams.js';
import submissionRoutes from './routes/submissions.js';
import userRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import realtimeRoutes from './routes/realtime.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        storageMode: getStorageMode(),
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/realtime', realtimeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
    try {
        // Try to connect to database
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Storage mode: ${getStorageMode()}`);
            console.log(`🔑 API endpoint: http://localhost:${PORT}/api\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
