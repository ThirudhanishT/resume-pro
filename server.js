const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Routes
const resumeRoutes = require('./routes/resumeRoutes');
app.use('/api/resumes', resumeRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/index.html'));
});

app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/create.html'));
});
app.get('/improve', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/improve.html'));
});

app.get('/display/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/display.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/search.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
