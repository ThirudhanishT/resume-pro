const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Generate resume content using AI
async function generateResumeContent(userData) {
    try {
        const prompt = `Generate a professional resume content based on the following information:
        Name: ${userData.name}
        Email: ${userData.email}
        Phone: ${userData.phone}
        Current Role/Target Role: ${userData.role}
        Experience: ${userData.experience}
        Education: ${userData.education}
        Skills: ${userData.skills}
        
        Please provide:
        1. A professional summary (2-3 lines)
        2. Formatted experience section
        3. Key achievements
        4. Properly organized skills`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('AI Generation Error:', error);
        // Fallback content if AI fails
        return {
            summary: userData.experience || "Professional with diverse experience",
            formattedExperience: userData.experience,
            achievements: ["Successfully completed various projects", "Demonstrated leadership skills"],
            skills: userData.skills ? userData.skills.split(',') : []
        };
    }
}

// Improve existing resume using AI
async function improveResumeContent(resumeData) {
    try {
        const prompt = `Improve and enhance this resume content:
        Current Summary: ${resumeData.summary}
        Experience: ${JSON.stringify(resumeData.experience)}
        Skills: ${resumeData.skills.join(', ')}
        
        Please provide:
        1. An improved, more impactful professional summary
        2. Enhanced experience descriptions with action verbs
        3. Additional relevant skills
        4. Suggested achievements based on the experience`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('AI Improvement Error:', error);
        // Return original with minor enhancements
        return {
            summary: `${resumeData.summary} - Enhanced with proven track record of success.`,
            experience: resumeData.experience,
            skills: [...resumeData.skills, "Leadership", "Problem Solving"],
            achievements: [...(resumeData.achievements || []), "Improved team efficiency"]
        };
    }
}

// Create new resume
router.post('/create', async (req, res) => {
    try {
        const aiContent = await generateResumeContent(req.body);
        
        // Parse AI response (this is simplified - you may need better parsing)
        let parsedContent;
        try {
            parsedContent = typeof aiContent === 'string' ? 
                { summary: aiContent, achievements: [] } : aiContent;
        } catch (e) {
            parsedContent = { summary: aiContent, achievements: [] };
        }

        const resumeData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            title: req.body.role,
            summary: parsedContent.summary || req.body.experience,
            experience: [{
                company: req.body.company || "Previous Company",
                position: req.body.role,
                duration: req.body.duration || "2020-Present",
                description: req.body.experience
            }],
            education: [{
                institution: req.body.institution || "University",
                degree: req.body.education,
                year: req.body.graduationYear || "2020"
            }],
            skills: req.body.skills ? req.body.skills.split(',').map(s => s.trim()) : [],
            achievements: parsedContent.achievements || []
        };

        const resume = new Resume(resumeData);
        await resume.save();
        res.json({ success: true, resumeId: resume._id, data: resume });
    } catch (error) {
        console.error('Create Resume Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Improve existing resume
router.post('/improve', async (req, res) => {
    try {
        const originalResume = await Resume.findById(req.body.resumeId);
        if (!originalResume) {
            return res.status(404).json({ success: false, error: 'Resume not found' });
        }

        const improvedContent = await improveResumeContent(originalResume);
        
        // Parse improved content
        let parsedContent;
        try {
            parsedContent = typeof improvedContent === 'string' ? 
                { summary: improvedContent } : improvedContent;
        } catch (e) {
            parsedContent = { summary: improvedContent };
        }

        const improvedResumeData = {
            ...originalResume.toObject(),
            _id: undefined,
            summary: parsedContent.summary || `${originalResume.summary} - Enhanced version`,
            skills: parsedContent.skills || [...originalResume.skills, "Enhanced Skills"],
            achievements: parsedContent.achievements || originalResume.achievements,
            isImproved: true,
            originalResumeId: originalResume._id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const improvedResume = new Resume(improvedResumeData);
        await improvedResume.save();
        res.json({ success: true, resumeId: improvedResume._id, data: improvedResume });
    } catch (error) {
        console.error('Improve Resume Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all resumes
router.get('/all', async (req, res) => {
    try {
        const resumes = await Resume.find().sort({ createdAt: -1 });
        res.json({ success: true, data: resumes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single resume
router.get('/:id', async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ success: false, error: 'Resume not found' });
        }
        res.json({ success: true, data: resume });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search resumes
router.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const resumes = await Resume.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { title: { $regex: query, $options: 'i' } },
                { skills: { $in: [new RegExp(query, 'i')] } }
            ]
        }).sort({ createdAt: -1 });
        res.json({ success: true, data: resumes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
