const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Health', 'Education', 'Environment', 'Food Relief', 'Infrastructure'], required: true },
  urgency: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  location: { type: String, required: true },
  lat: { type: Number, default: 18.5204 },
  lng: { type: Number, default: 73.8567 },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
  assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isEmergency: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);
