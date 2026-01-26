import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    geminiApiKey: {
        type: String,
        default: process.env.GEMINI_API_KEY || ''
    },
    mongodbUrl: {
        type: String,
        default: process.env.MONGODB_URL || ''
    },
    storageMode: {
        type: String,
        enum: ['local', 'mongodb'],
        default: 'local'
    },
    appName: {
        type: String,
        default: 'Web Ujian AI'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Only allow one settings document
settingsSchema.statics.get = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
