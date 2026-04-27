const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ngoRoutes = require('./routes/ngo');
const issuesRoutes = require('./routes/issues');
const volunteerRoutes = require('./routes/volunteer');
const geminiRoutes = require('./routes/gemini');
const surveyRoutes = require('./routes/survey');

const app = express();

// Global CORS — allows Vercel frontend, localtunnel, and localhost
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : ['*'];

app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization', 'Bypass-Tunnel-Reminder']
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/survey', surveyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SevaSync API is running', timestamp: new Date() });
});

// Global error handler — prevents unhandled promise rejections from crashing the server
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Database connection with retry-on-failure logging
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Crash loudly so Railway/Render can restart the service
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
