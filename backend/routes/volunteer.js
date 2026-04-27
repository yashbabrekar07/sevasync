const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Issue = require('../models/Issue');

// @route   GET /api/volunteer/dashboard
// @desc    Get stats and accepted tasks for volunteer
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Populate the accepted tasks from the user document
    const user = await User.findById(req.user.id).populate({
      path: 'acceptedTasks',
      populate: { path: 'createdBy', select: 'name' }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      stats: {
        impactScore: user.impactScore || (user.acceptedTasks.length * 150),
        tasksCompleted: user.acceptedTasks.length,
        hoursVolunteered: user.hoursVolunteered || (user.acceptedTasks.length * 4)
      },
      acceptedTasks: user.acceptedTasks
    });

  } catch (err) {
    console.error("Volunteer Dashboard Error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/volunteer/leaderboard
// @desc    Get top 10 volunteers by impact score
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const topVolunteers = await User.find({ role: 'volunteer' })
      .sort({ impactScore: -1 })
      .limit(10)
      .select('name impactScore tasksCompleted');
    
    res.json(topVolunteers);
  } catch (err) {
    console.error("Leaderboard Error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
