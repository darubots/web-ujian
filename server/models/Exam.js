import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['essay', 'multiple_choice'],
        required: true
    },
    question: {
        type: String,
        required: true
    },
    // For essay questions
    keyAnswer: {
        type: String
    },
    // For multiple choice questions
    options: [{
        type: String
    }],
    correctAnswer: {
        type: Number // index of correct option (0-based)
    },
    points: {
        type: Number,
        default: 10
    }
}, { _id: false });

const examSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    questions: [questionSchema],
    isPublished: {
        type: Boolean,
        default: false
    },
    settings: {
        shuffleQuestions: {
            type: Boolean,
            default: true
        },
        shuffleOptions: {
            type: Boolean,
            default: true
        },
        showResults: {
            type: Boolean,
            default: true
        },
        allowReview: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
examSchema.index({ classId: 1 });
examSchema.index({ startTime: 1, endTime: 1 });
examSchema.index({ isPublished: 1 });

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
