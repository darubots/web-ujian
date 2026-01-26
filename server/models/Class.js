import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviteCode: {
        type: String,
        unique: true,
        default: () => nanoid(8)
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    exams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
classSchema.index({ teacherId: 1 });
classSchema.index({ inviteCode: 1 });
classSchema.index({ students: 1 });

const Class = mongoose.model('Class', classSchema);

export default Class;
