// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Utility Functions
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-container"><div class="loading"></div></div>';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Create Resume Functions
async function submitCreateForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        role: document.getElementById('role').value,
        experience: document.getElementById('experience').value,
        education: document.getElementById('education').value,
        skills: document.getElementById('skills').value,
        company: document.getElementById('company')?.value,
        institution: document.getElementById('institution')?.value
    };
    
    showLoading('formContainer');
    
    try {
        const response = await fetch(`${API_BASE}/resumes/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Resume created successfully!');
            setTimeout(() => {
                window.location.href = `/display/${data.resumeId}`;
            }, 1000);
        } else {
            showNotification('Error creating resume: ' + data.error, 'error');
            hideLoading('formContainer');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Network error. Please try again.', 'error');
        hideLoading('formContainer');
    }
}

// Improve Resume Functions
async function loadResumesForImprovement() {
    showLoading('resumesList');
    
    try {
        const response = await fetch(`${API_BASE}/resumes/all`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            displayResumesForImprovement(data.data);
        } else {
            document.getElementById('resumesList').innerHTML = 
                '<p style="text-align: center; color: #718096;">No resumes found. Please create a resume first.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('resumesList').innerHTML = 
            '<p style="text-align: center; color: #ef4444;">Error loading resumes</p>';
    }
}

function displayResumesForImprovement(resumes) {
    const container = document.getElementById('resumesList');
    
    const resumesHTML = resumes.map(resume => `
        <div class="resume-card" onclick="improveResume('${resume._id}')">
            <h3>${resume.name}</h3>
            <p class="meta">${resume.title}</p>
            <p style="color: #718096; font-size: 0.9rem;">${resume.email}</p>
            ${resume.isImproved ? '<span class="badge improved">Improved</span>' : '<span class="badge">Original</span>'}
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="resume-grid">
            ${resumesHTML}
        </div>
    `;
}

async function improveResume(resumeId) {
    if (!confirm('Do you want to improve this resume?')) return;
    
    showLoading('resumesList');
    
    try {
        const response = await fetch(`${API_BASE}/resumes/improve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resumeId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Resume improved successfully!');
            setTimeout(() => {
                window.location.href = `/display/${data.resumeId}`;
            }, 1000);
        } else {
            showNotification('Error improving resume: ' + data.error, 'error');
            loadResumesForImprovement();
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Network error. Please try again.', 'error');
        loadResumesForImprovement();
    }
}

// Display Resume Functions
async function loadResume() {
    const resumeId = window.location.pathname.split('/').pop();
    showLoading('resumeDisplay');
    
    try {
        const response = await fetch(`${API_BASE}/resumes/${resumeId}`);
        const data = await response.json();
        
        if (data.success) {
            displayResume(data.data);
        } else {
            document.getElementById('resumeDisplay').innerHTML = 
                '<p style="text-align: center; color: #ef4444;">Resume not found</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('resumeDisplay').innerHTML = 
            '<p style="text-align: center; color: #ef4444;">Error loading resume</p>';
    }
}

function displayResume(resume) {
    const container = document.getElementById('resumeDisplay');
    
    const experienceHTML = resume.experience.map(exp => `
        <div class="experience-item">
            <h3>${exp.position} at ${exp.company}</h3>
            <p class="date">${exp.duration}</p>
            <p>${exp.description}</p>
        </div>
    `).join('');
    
    const educationHTML = resume.education.map(edu => `
        <div class="education-item">
            <h3>${edu.degree}</h3>
            <p>${edu.institution}</p>
            <p class="date">${edu.year}</p>
        </div>
    `).join('');
    
    const skillsHTML = resume.skills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
    
    const achievementsHTML = resume.achievements && resume.achievements.length > 0 ? `
        <div class="resume-section">
            <h2>Key Achievements</h2>
            <ul>
                ${resume.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
        </div>
    ` : '';
    
    container.innerHTML = `
        <div class="resume-container fade-in">
            <div class="resume-header">
                <h1>${resume.name}</h1>
                <p style="font-size: 1.2rem; color: #667eea; margin: 0.5rem 0;">${resume.title}</p>
                <div class="contact-info">
                    <span>📧 ${resume.email}</span>
                    <span>📱 ${resume.phone}</span>
                </div>
                ${resume.isImproved ? '<span class="badge improved" style="margin-top: 1rem;">AI-Improved Version</span>' : ''}
            </div>
            
            <div class="resume-section">
                <h2>Professional Summary</h2>
                <p>${resume.summary}</p>
            </div>
            
            <div class="resume-section">
                <h2>Experience</h2>
                ${experienceHTML}
            </div>
            
            <div class="resume-section">
                <h2>Education</h2>
                ${educationHTML}
            </div>
            
            <div class="resume-section">
                <h2>Skills</h2>
                <div class="skills-list">
                    ${skillsHTML}
                </div>
            </div>
            
            ${achievementsHTML}
            
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn" onclick="window.print()">Download PDF</button>
                <button class="btn btn-secondary" onclick="window.location.href='/search'" style="margin-left: 1rem;">View All Resumes</button>
            </div>
        </div>
    `;
}

// Search Page Functions
async function loadAllResumes() {
    showLoading('searchResults');
    
    try {
        const response = await fetch(`${API_BASE}/resumes/all`);
        const data = await response.json();
        
        if (data.success) {
            displaySearchResults(data.data);
        } else {
            document.getElementById('searchResults').innerHTML = 
                '<p style="text-align: center; color: #718096;">No resumes found</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('searchResults').innerHTML = 
            '<p style="text-align: center; color: #ef4444;">Error loading resumes</p>';
    }
}

async function searchResumes() {
    const query = document.getElementById('searchInput').value;
    
    if (!query) {
        loadAllResumes();
        return;
    }
    
    showLoading('searchResults');
    
    try {
        const response = await fetch(`${API_BASE}/resumes/search/${query}`);
        const data = await response.json();
        
        if (data.success) {
            displaySearchResults(data.data);
        } else {
            document.getElementById('searchResults').innerHTML = 
                '<p style="text-align: center; color: #718096;">No resumes found matching your search</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('searchResults').innerHTML = 
            '<p style="text-align: center; color: #ef4444;">Error searching resumes</p>';
    }
}

function displaySearchResults(resumes) {
    const container = document.getElementById('searchResults');
    
    if (resumes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No resumes found</p>';
        return;
    }
    
    const resumesHTML = resumes.map(resume => `
        <div class="resume-card" onclick="window.location.href='/display/${resume._id}'">
            <h3>${resume.name}</h3>
            <p class="meta">${resume.title}</p>
            <p style="color: #718096; font-size: 0.9rem; margin: 0.5rem 0;">${resume.email}</p>
            <div style="margin-top: 1rem;">
                ${resume.skills.slice(0, 3).map(skill => 
                    `<span class="badge" style="margin-right: 0.5rem;">${skill}</span>`
                ).join('')}
            </div>
            ${resume.isImproved ? '<span class="badge improved" style="margin-top: 0.5rem;">Improved</span>' : ''}
            <p style="color: #a0aec0; font-size: 0.85rem; margin-top: 1rem;">
                Created: ${new Date(resume.createdAt).toLocaleDateString()}
            </p>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="resume-grid">
            ${resumesHTML}
        </div>
    `;
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path === '/improve' || path.includes('improve')) {
        loadResumesForImprovement();
    } else if (path.includes('/display/')) {
        loadResume();
    } else if (path === '/search' || path.includes('search')) {
        loadAllResumes();
    }
});
