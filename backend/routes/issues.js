const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');
const User = require('../models/User');

// @route   POST /api/issues
// @desc    NGO creates an issue
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can create issues' });
    }

    const { title, description, category, urgency, location, lat, lng } = req.body;

    const newIssue = new Issue({
      title,
      description,
      category,
      urgency,
      location,
      lat: lat || 18.5204, // Default to Pune city center
      lng: lng || 73.8567,
      createdBy: req.user.id
    });

    const issue = await newIssue.save();
    
    // Add issue to NGO's createdIssues array
    await User.findByIdAndUpdate(req.user.id, { $push: { createdIssues: issue._id } });

    res.json(issue);
  } catch (err) {
    console.error("Create Issue Error:", err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   GET /api/issues
// @desc    Get all active issues (For Volunteers to see as tasks)
router.get('/', auth, async (req, res) => {
  try {
    // Return all issues that are not completed (Open or In Progress)
    const issues = await Issue.find({ status: { $ne: 'Completed' } }).populate('createdBy', 'name');
    res.json(issues);
  } catch (err) {
    console.error("Get Issues Error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/issues/:id
// @desc    Get single issue by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Issue.findById(req.params.id).populate('createdBy', 'name');
    if (!task) return res.status(404).json({ message: 'Issue not found' });
    res.json({ task });
  } catch (err) {
    console.error("Get Issue Error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/issues/:id/accept
// @desc    Volunteer accepts an issue
router.post('/:id/accept', auth, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can accept tasks' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    if (issue.assignedVolunteers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already accepted this task' });
    }

    // Update Issue
    issue.assignedVolunteers.push(req.user.id);
    issue.status = 'In Progress';
    await issue.save();

    // Update Volunteer
    await User.findByIdAndUpdate(req.user.id, { $push: { acceptedTasks: issue._id } });

    res.json({ message: 'Task accepted successfully', issue });
  } catch (err) {
    console.error("Accept Issue Error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/issues/:id/complete
// @desc    NGO or Volunteer marks issue as complete
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    issue.status = 'Completed';
    await issue.save();

    // Award impact score to assigned volunteers
    if (issue.assignedVolunteers?.length > 0) {
      await User.updateMany(
        { _id: { $in: issue.assignedVolunteers } },
        { 
          $inc: { impactScore: 150, hoursVolunteered: 4 }
        }
      );
    }
    res.json({ message: 'Issue marked as completed', issue });
  } catch (err) {
    console.error("Complete Issue Error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/issues/:id/broadcast
// @desc    NGO triggers an emergency broadcast
router.post('/:id/broadcast', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can trigger broadcasts' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.isEmergency = true;
    issue.urgency = 'High';
    await issue.save();

    res.json({ message: 'Emergency broadcast triggered successfully!', issue });
  } catch (err) {
    console.error("Broadcast Error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
