import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true // Allow null but unique if provided
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'guru', 'siswa'],
        required: true
    },
    nisn: {
        type: String,
        sparse: true, // For siswa only, unique if provided
        trim: true
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    lastActive: {
        type: Date,
        default: Date.now
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
