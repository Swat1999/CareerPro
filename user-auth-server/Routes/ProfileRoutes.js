const express = require('express');
const router = express.Router();
const User = require('../Models/user');
const { spawn } = require('child_process');
const path = require("path");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const fs = require("fs");


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// AI recommendation
router.post('/ai/get-recommendations', authenticateToken, async (req, res) => {
    console.log("Routing to: /api/ai/get-recommendations");
    try {
        const userId = req.user.id;

        // Finding the user in the MongoDB
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userDetails = JSON.stringify({
            employmentType: user.employmentType,
            skills: user.skills,
            careerPaths: user.careerPaths,
            experience: user.experience,
            certifications: user.certifications
        });
        
        console.log('📤 Sending to Python:', userDetails);

        const pythonScriptPath = path.join('D:', 'Webpage', 'AI_service', 'ai_service.py');
        const pythonProcess = spawn('python', [pythonScriptPath, userDetails]);

        let recommendations = "";

        pythonProcess.stdout.on('data', (data) => {
            const chunk = data.toString();
            console.log("📥 Python stdout chunk:", data.toString());
            recommendations += chunk;
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python script error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log("🔥 Raw Python output:", recommendations);

            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                return res.status(500).json({ message: 'Failed to run AI service.' });
            }
            console.log("Raw Python output:", recommendations);

            try {
                const jsonStart = recommendations.indexOf("[");
                const jsonEnd = recommendations.lastIndexOf("]") + 1;
                const cleanOutput = recommendations.slice(jsonStart, jsonEnd);

                const parsed = JSON.parse(cleanOutput || "[]");

                if (!Array.isArray(parsed)){
                    throw new Error("Parsed data is not an array");
                }

                res.json({ recommendations: parsed });
            } catch (e) {
                console.error('Failed to parse JSON from Python script:', e.message, recommendations);
                res.status(500).json({ message: 'Invalid response from AI service.'});
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// Route to handle saving the user's profile details
// POST /api/setup-profile
router.post('/setup-profile', authenticateToken, async (req, res) => {
    console.log('🔥 Received payload:', req.body);

    try {
        const userId = req.user.id; 
        const { careerPaths, skills = [], age, ...rest } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        if (!careerPaths || careerPaths.length === 0) {
            return res.status(400).json({ message: 'At least one career path is required.' });
        }
        if (age !== undefined && (typeof age !== 'number' || age < 13 || age > 100)) {
            return res.status(400).json({ message: 'Age must be a number between 13 and 100.' });
        }
        
        // Find the user by their ID and update their profile
      const updatedUser = await User.findByIdAndUpdate(
        userId,
      { 
        $set: { 
            ...req.body,
             profileSetupComplete: true 
            } 
        },
      { new: true}
    );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log('✅ Update result:', updatedUser);
        res.status(200).json({ 
            message: 'Profile setup completed successfully!', 
            user: updatedUser 
        });

    } catch (error) {
        console.error('❌ server error', error);
        res.status(500).json({ 
            message: 'internal server error', 
            error: error.message 
        });
    }
});

// Route to provide a list of skills to the frontend
// GET /api/skills
router.get('/skills', async (req, res) => {
    try {
        const skillsList = [
            "JavaScript", "Python", "Java", "C++", "C#", "Go", "Ruby", "PHP",
            "HTML", "CSS", "SQL", "NoSQL", "React", "Angular", "Vue.js", "Node.js",
            "Django", "Flask", "Spring Boot", "Laravel", "Docker", "Kubernetes",
            "AWS", "Azure", "Google Cloud", "Agile", "Scrum", "Git", "DevOps",
            "Machine Learning", "Data Analysis", "Cybersecurity", "Network Security",
            "UI/UX Design", "Figma", "Sketch", "Photoshop", "Illustrator",
            "Project Management", "Jira", "Confluence", "SQL Server", "MySQL",
            "PostgreSQL", "MongoDB", "Redis", "TensorFlow", "PyTorch", "Tableau",
            "Power BI", "Excel", "Salesforce", "API Development", "Microservices",
            "RESTful APIs", "GraphQL", "Cyber Threat Intelligence", "Penetration Testing",
            "Ethical Hacking", "Incident Response", "Firewall Management", "VPN",
            "Cloud Security", "Data Privacy", "GDPR", "HIPAA", "Financial Modeling",
            "Budgeting", "Risk Management", "Business Analysis", "Requirements Gathering",
            "Communication", "Teamwork", "Problem Solving", "Critical Thinking", "Adaptability",
            "Time Management", "Leadership", "Creativity", "Attention to Detail", "Negotiation",
            "Public Speaking", "Writing", "Research", "Customer Service", "Sales", "Marketing",
            "Data Entry", "Bookkeeping", "Blockchain", "Quantum Computing", "AR/VR", "IoT"
        ];
        res.status(200).json(skillsList);
    } catch (error) {
        console.error('Error fetching skills list:', error);
        res.status(500).json({ message: 'Failed to retrieve skills list.' });
    }
});

// Subscription status check
router.get('/subscriptions/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      plan: user.subscription?.plan || 'free',
      status: user.subscription?.status || 'inactive',
      nextBillingDate: user.subscription?.nextBillingDate || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Upload API integration
const upload = multer({
  dest: "uploads/", // store temporarily in /uploads
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("❌ Invalid file type"), false);
    }
    cb(null, true);
  }
});

// Upload Resume & CV Analysis
router.post("/analyze-files", upload.fields([
  { name: "resume", maxCount: 1 },
  { name: "cv", maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Files received:", req.files);
    const files = {
      resume: req.files["resume"] ? req.files["resume"][0].path : null,
      cv: req.files["cv"] ? req.files["cv"][0].path : null
    };
    console.log('Sending to Python:', files);

    const pythonScriptPath = path.join('D:', 'Webpage', 'AI_service', 'ai_service.py');
    console.log('Python script path:', pythonScriptPath);

    const pythonProcess = spawn("python", [
      path.join(__dirname, "..", "ai_service.py"),
      JSON.stringify(files)
    ]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
      console.log("Python stdout:", data.toString());
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error("Python error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
        console.log("Python process exited with code:", code);
        console.log("Python stdout output:", output);
        console.log("Python stderr output:", errorOutput);

      if (code !== 0) {
        return res.status(500).json({ 
          message: "Python script failed", 
          error: errorOutput,
          code: code
        });
      }
      
      try {
        // Clean the output - remove any non-JJSON text before/after
        const jsonMatch = output.match(/\[.*\]/s);
        if (!jsonMatch) {
          throw new Error("No JSON array found in Python output");
        }
        
        const cleanOutput = jsonMatch[0];
        const result = JSON.parse(cleanOutput);
        
        res.json({ analysis: result });
      } catch (err) {
        console.error("Parse error:", err, "Raw output:", output);
        res.status(500).json({ 
          message: "Failed to parse Python output",
          error: err.message,
          rawOutput: output,
          stderr: errorOutput
        });
      }
    });
  } catch (error) {
    console.error("Analyze files error:", error);
    res.status(500).json({ message: "Failed to analyze files" });
  }
});


module.exports = router;
