const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  title: { type: String, required: true },
  requiredSkills: [{ type: String }],
  location: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
  
  assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Task', taskSchema);
