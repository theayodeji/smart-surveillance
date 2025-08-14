import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'user'], 
        default: 'user' 
    },
    emailAlerts: {
        type: Boolean,
        default: true
    },
    alertEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^$|^\S+@\S+\.\S+$/, 'Please use a valid email address']
    }
}, {
    timestamps: true
});

export default mongoose.model('User', UserSchema);