const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');

// @route   POST /api/survey/bulk
// @desc    Bulk-create issues from survey/field report data
router.post('/bulk', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can upload surveys' });
    }

    const { entries } = req.body; // Array of parsed survey entries
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'No entries provided' });
    }

    const created = [];
    for (const entry of entries) {
      const issue = new Issue({
        title: entry.title || 'Community Issue',
        description: entry.description || entry.title,
        category: entry.category || 'Environment',
        urgency: entry.urgency || 'Medium',
        location: entry.location || 'Unknown Location',
        lat: entry.lat || 20.5937,
        lng: entry.lng || 78.9629,
        createdBy: req.user.id,
        status: 'Open'
      });
      await issue.save();
      created.push(issue);
    }

    res.json({ message: `${created.length} issues created from survey`, issues: created });
  } catch (err) {
    console.error('Survey Upload Error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
