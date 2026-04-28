const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user (NGO or Volunteer)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, contact, location, role, gender } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      contact,
      location,
      role,
      gender: role === 'volunteer' ? gender : ''
    });

    await user.save();

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name
      }
    };

    // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
      }
    );
  } catch (err) {
    console.error("Auth Route Error:", err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Verify role matches (optional but good for this specific UI flow)
    if (user.role !== role) {
        return res.status(400).json({ message: `Account is registered as ${user.role}, please select the correct role.` });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name
      }
    };

    // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
      }
    );
  } catch (err) {
    console.error("Auth Route Error:", err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
