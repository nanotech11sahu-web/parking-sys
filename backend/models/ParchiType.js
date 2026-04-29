const mongoose = require('mongoose');

const parchiTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  prefix: { type: String, default: '', trim: true },
  currentSerial: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  color: { type: String, default: '#0d9488' },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ParchiType', parchiTypeSchema);
