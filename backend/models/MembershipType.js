const mongoose = require('mongoose');

const membershipTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  durationDays: { type: Number, required: true, default: 30 },
  color: { type: String, default: '#7c3aed' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('MembershipType', membershipTypeSchema);
