const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  memberName: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },
  vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
  vehicleType: { type: String, enum: ['2-wheeler', '4-wheeler'], required: true },
  membershipTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipType', required: true },
  membershipTypeName: { type: String, required: true },
  amount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operatorName: { type: String, required: true },
  shift: { type: String, enum: ['Morning', 'Night'], required: true },
  workDate: { type: String, required: true }, // yyyy-mm-dd — the actual work date chosen by operator
}, { timestamps: true });

membershipSchema.index({ createdAt: -1 });
membershipSchema.index({ workDate: -1 });
membershipSchema.index({ operatorId: 1 });
membershipSchema.index({ contactNumber: 1 });

module.exports = mongoose.model('Membership', membershipSchema);
