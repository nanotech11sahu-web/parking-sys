const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  serialIndex: { type: Number, required: true },
  parchiTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParchiType', required: true },
  parchiTypeName: { type: String, required: true },
  amount: { type: Number, required: true },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operatorName: { type: String, required: true },
  shift: { type: String, enum: ['Morning', 'Night'], required: true },
  workDate: { type: String, required: true }, // yyyy-mm-dd — the actual work date chosen by operator
  batchId: { type: String },
}, { timestamps: true });

ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ workDate: -1 });
ticketSchema.index({ operatorId: 1 });
ticketSchema.index({ parchiTypeId: 1 });
ticketSchema.index({ shift: 1 });
ticketSchema.index({ batchId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
