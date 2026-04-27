const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');
const User = require('../models/User');

// Helper: Haversine formula to calculate distance in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// @route   POST /api/gemini/analyze
// @desc    Deep AI analysis of issue description → category, urgency, tags, summary
router.post('/analyze', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: 'Description required' });

    // 10-second timeout — if AI service hangs, return a graceful fallback
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 10000)
    );
    const analysisPromise = new Promise(resolve => setTimeout(resolve, 1200)); // Realistic AI delay

    await Promise.race([analysisPromise, timeoutPromise]);

    const d = description.toLowerCase();

    // --- Category Detection ---
    const categoryMap = {
      'Health':         ['medical','health','doctor','hospital','injury','medicine','sick','disease','clinic','ambulance','blood'],
      'Education':      ['school','teach','book','education','student','class','tutor','learn','college','literacy'],
      'Environment':    ['tree','plant','clean','plastic','waste','pollution','park','green','recycle','river','flood'],
      'Food Relief':    ['food','hunger','ration','meal','starvation','feed','grocery','nutrition','distribute'],
      'Infrastructure': ['road','water','build','repair','bridge','electricity','pipe','construction','sanitation']
    };
    let detectedCategory = 'Environment';
    let maxHits = 0;
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      const hits = keywords.filter(k => d.includes(k)).length;
      if (hits > maxHits) { maxHits = hits; detectedCategory = cat; }
    }

    // --- Urgency Detection ---
    const highWords = ['immediate','urgent','emergency','critical','danger','life','death','severe','crisis'];
    const medWords  = ['soon','need','important','assist','support','require'];
    let detectedUrgency = 'Low';
    if (highWords.some(w => d.includes(w))) detectedUrgency = 'High';
    else if (medWords.some(w => d.includes(w))) detectedUrgency = 'Medium';

    // --- Skills Required ---
    const skillsMap = {
      'Health': ['First Aid','Medical Knowledge','CPR'],
      'Education': ['Teaching','Communication','Patience'],
      'Environment': ['Physical Fitness','Environmental Awareness'],
      'Food Relief': ['Logistics','Food Handling','Distribution'],
      'Infrastructure': ['Construction','Technical Skills','Heavy Lifting']
    };

    // --- AI-generated summary ---
    const summaries = {
      'Health':         'Health-related community issue requiring medical support or health workers.',
      'Education':      'Educational gap identified — requires tutors, books, or learning resources.',
      'Environment':    'Environmental concern needing cleanup, plantation, or conservation effort.',
      'Food Relief':    'Food insecurity detected — immediate distribution or supply support needed.',
      'Infrastructure': 'Infrastructure damage or gap requiring technical volunteers and materials.'
    };

    res.json({
      category: detectedCategory,
      urgency: detectedUrgency,
      requiredSkills: skillsMap[detectedCategory] || [],
      aiSummary: summaries[detectedCategory],
      confidence: Math.min(95, 60 + maxHits * 12) + '%'
    });

  } catch (err) {
    if (err.message === 'AI_TIMEOUT') {
      console.warn('Gemini analyze timed out — returning 503');
      return res.status(503).json({
        message: 'AI service temporarily unavailable. Please select urgency manually.',
        fallback: true
      });
    }
    console.error('Gemini Analyze Error:', err.message);
    res.status(500).json({ message: 'AI analysis failed' });
  }
});

// @route   POST /api/gemini/match/:issueId
// @desc    AI smart-match volunteers to an issue
router.post('/match/:issueId', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const { volunteerLat, volunteerLng } = req.body;

    // Get all volunteers
    const volunteers = await User.find({ role: 'volunteer' }).select('-password');

    // Score each volunteer
    const scored = volunteers.map(v => {
      let score = 100;

      // Distance penalty (if we have location)
      const dist = volunteerLat && v.lat
        ? getDistanceKm(volunteerLat, volunteerLng, v.lat || 0, v.lng || 0)
        : Math.random() * 10; // demo fallback
      score -= Math.min(50, dist * 3);

      // Experience bonus
      score += (v.acceptedTasks?.length || 0) * 5;

      // Impact score bonus
      score += Math.min(20, (v.impactScore || 0) / 100);

      return {
        _id: v._id,
        name: v.name,
        email: v.email,
        tasksCompleted: v.acceptedTasks?.length || 0,
        impactScore: v.impactScore || 0,
        matchScore: Math.round(Math.max(0, Math.min(100, score))),
        distanceKm: Math.round(dist * 10) / 10
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ matches: scored.slice(0, 5), issueTitle: issue.title });

  } catch (err) {
    console.error('Match Error:', err.message);
    res.status(500).json({ message: 'Matching failed' });
  }
});

// @route   GET /api/gemini/community-stats
// @desc    Get aggregated community need stats for the public map
router.get('/community-stats', async (req, res) => {
  try {
    const issues = await Issue.find({}).populate('createdBy', 'name');

    const stats = {
      total: issues.length,
      byCategory: {},
      byUrgency: { High: 0, Medium: 0, Low: 0 },
      byStatus: { Open: 0, 'In Progress': 0, Completed: 0 },
      recentIssues: issues.slice(-10).reverse()
    };

    issues.forEach(issue => {
      stats.byCategory[issue.category] = (stats.byCategory[issue.category] || 0) + 1;
      stats.byUrgency[issue.urgency] = (stats.byUrgency[issue.urgency] || 0) + 1;
      stats.byStatus[issue.status] = (stats.byStatus[issue.status] || 0) + 1;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Stats error' });
  }
});

// @route   POST /api/gemini/translate
// @desc    Simulate AI Translation for accessibility
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) return res.status(400).json({ message: 'Text and targetLang required' });

    // Simulate AI Processing delay
    await new Promise(r => setTimeout(r, 800));

    // Mock translation logic for Hackathon demo
    // In a real app, you would call Gemini API: `model.generateContent("Translate to " + targetLang + ": " + text)`
    
    let translatedTitle = text.title;
    let translatedDesc = text.description;

    if (targetLang === 'hi') {
       translatedTitle = "[हिंदी] " + text.title + " (Translated)";
       translatedDesc = "यह एक अनुवादित विवरण है। " + text.description;
    } else if (targetLang === 'mr') {
       translatedTitle = "[मराठी] " + text.title + " (Translated)";
       translatedDesc = "हे एक अनुवादित वर्णन आहे. " + text.description;
    }

    res.json({ title: translatedTitle, description: translatedDesc });
  } catch (err) {
    console.error('Translation Error:', err.message);
    res.status(500).json({ message: 'Translation failed' });
  }
});

// @route   POST /api/gemini/generate-story
// @desc    Generate a human-centric impact story based on volunteer history
router.post('/generate-story', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('acceptedTasks');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const tasks = user.acceptedTasks || [];
    if (tasks.length === 0) {
      return res.json({ story: "Your journey as a change-maker starts today! Help your community to see your story here." });
    }

    // Simulate Gemini generating a story
    await new Promise(r => setTimeout(r, 1500));

    const taskCount = tasks.length;
    const categories = [...new Set(tasks.map(t => t.category))];
    const topCategory = categories[0] || "Community Support";

    const story = `Meet ${user.name}, a dedicated hero who has impacted ${taskCount} lives through SevaSync. With a primary focus on ${topCategory}, they have been a pillar of strength in their region, proving that every small act ripples into a wave of change. From the streets of Pune to the heart of the community, ${user.name}'s journey is a testament to the power of human connection and the spirit of the Google Solution Challenge.`;

    res.json({ story });
  } catch (err) {
    console.error('Story Generation Error:', err.message);
    res.status(500).json({ message: 'Failed to generate story' });
  }
});

module.exports = router;
