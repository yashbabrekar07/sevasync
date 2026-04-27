const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');

// @route   POST /api/ngo/analyze-issue
// @desc    Analyze issue description using AI to auto-detect category & urgency
router.post('/analyze-issue', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Simulate AI processing delay (for demo effect)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Smart Mock NLP Logic
    const descLower = description.toLowerCase();
    
    let detectedUrgency = "Low";
    let detectedCategory = "Environment"; // Default fallback

    // Detect Urgency
    if (descLower.includes("immediate") || descLower.includes("urgent") || descLower.includes("emergency") || descLower.includes("critical")) {
      detectedUrgency = "High";
    } else if (descLower.includes("soon") || descLower.includes("need") || descLower.includes("important")) {
      detectedUrgency = "Medium";
    }

    // Detect Category
    if (descLower.includes("medical") || descLower.includes("health") || descLower.includes("doctor") || descLower.includes("injury")) {
      detectedCategory = "Health";
    } else if (descLower.includes("school") || descLower.includes("teach") || descLower.includes("book") || descLower.includes("education")) {
      detectedCategory = "Education";
    } else if (descLower.includes("tree") || descLower.includes("park") || descLower.includes("clean") || descLower.includes("plastic")) {
      detectedCategory = "Environment";
    } else if (descLower.includes("food") || descLower.includes("hunger") || descLower.includes("ration") || descLower.includes("meal")) {
      detectedCategory = "Food Relief";
    } else if (descLower.includes("road") || descLower.includes("water") || descLower.includes("build") || descLower.includes("repair")) {
      detectedCategory = "Infrastructure";
    }

    res.json({
      category: detectedCategory,
      urgency: detectedUrgency
    });

  } catch (err) {
    console.error("AI Analysis Error:", err.message);
    res.status(500).json({ message: "AI Analysis failed" });
  }
});

// @route   GET /api/ngo/dashboard
// @desc    Get real stats and created issues for NGO
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const issues = await Issue.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    
    // Calculate stats
    const totalIssues = issues.length;
    const highUrgency = issues.filter(i => i.urgency === 'High').length;
    const mediumUrgency = issues.filter(i => i.urgency === 'Medium').length;
    const openTasks = issues.filter(i => i.status === 'Open').length;

    // Calculate Category Breakdown
    const categories = [
      { name: "Education", count: 0, color: "bg-primary" },
      { name: "Health", count: 0, color: "bg-success" },
      { name: "Environment", count: 0, color: "bg-green-400" },
      { name: "Food Relief", count: 0, color: "bg-yellow-500" },
      { name: "Infrastructure", count: 0, color: "bg-purple-500" }
    ];

    issues.forEach(issue => {
      const cat = categories.find(c => c.name === issue.category);
      if (cat) cat.count++;
    });

    // Add percentage
    categories.forEach(cat => {
      cat.percentage = totalIssues > 0 ? Math.round((cat.count / totalIssues) * 100) : 0;
    });

    res.json({
      stats: [
        { label: "Total Issues", value: totalIssues, color: "text-primary", bg: "bg-blue-100" },
        { label: "High Urgency", value: highUrgency, color: "text-urgency", bg: "bg-red-100" },
        { label: "Medium Urgency", value: mediumUrgency, color: "text-yellow-600", bg: "bg-yellow-100" },
        { label: "Open Tasks", value: openTasks, color: "text-success", bg: "bg-green-100" }
      ],
      categories: categories.filter(c => c.count > 0).sort((a,b) => b.count - a.count),
      issues: issues.slice(0, 5) // Send 5 most recent
    });

  } catch (err) {
    console.error("NGO Dashboard Error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
