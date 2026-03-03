const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    experience: [{
        company: String,
        position: String,
        duration: String,
        description: String
    }],
    education: [{
        institution: String,
        degree: String,
        year: String
    }],
    skills: [String],
    achievements: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isImproved: {
        type: Boolean,
        default: false
    },
    originalResumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        default: null
    }
});

module.exports = mongoose.model('Resume', resumeSchema);
