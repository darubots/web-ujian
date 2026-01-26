import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

let storageMode = 'local'; // 'local' or 'mongodb'
let isConnected = false;

/**
 * Connect to MongoDB if URL is provided, otherwise use local JSON storage
 */
export const connectDatabase = async () => {
    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl || mongoUrl.trim() === '') {
        console.log('📁 No MongoDB URL found. Using LOCAL JSON storage mode.');
        storageMode = 'local';
        isConnected = false;
        return;
    }

    try {
        console.log('🔌 Connecting to MongoDB...');

        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        storageMode = 'mongodb';

        console.log('✅ MongoDB connected successfully!');

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            storageMode = 'local';
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Falling back to local storage.');
            storageMode = 'local';
            isConnected = false;
        });

    } catch (error) {
        console.warn('⚠️  MongoDB connection failed:', error.message);
        console.log('📁 Falling back to LOCAL JSON storage mode.');
        storageMode = 'local';
        isConnected = false;
    }
};

/**
 * Get current storage mode
 */
export const getStorageMode = () => storageMode;

/**
 * Check if MongoDB is connected
 */
export const isMongoConnected = () => isConnected;

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async () => {
    if (isConnected) {
        await mongoose.disconnect();
        isConnected = false;
        storageMode = 'local';
        console.log('MongoDB disconnected');
    }
};

export default mongoose;
