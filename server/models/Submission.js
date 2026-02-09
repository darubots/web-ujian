import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    questionIndex: {
        type: Number,
        required: true
    },
    questionType: {
        type: String,
        enum: ['essay', 'multiple_choice', 'math', 'coding'],
        required: true
    },
    answer: {
        type: mongoose.Schema.Types.Mixed, // string for essay, number for MC
        required: true
    },
    isCorrect: {
        type: Boolean // for MC questions
    },
    score: {
        type: Number,
        default: 0
    },
    aiFeedback: {
        type: String // for essay questions
    }
}, { _id: false });

const submissionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    answers: [answerSchema],
    totalScore: {
        type: Number,
        default: 0
    },
    maxScore: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['in_progress', 'submitted', 'graded'],
        default: 'in_progress'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    submittedAt: {
        type: Date
    },
    gradedAt: {
        type: Date
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
submissionSchema.index({ examId: 1, studentId: 1 });
submissionSchema.index({ classId: 1 });
submissionSchema.index({ status: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
