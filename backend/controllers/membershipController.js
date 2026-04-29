const Membership = require('../models/Membership');
const MembershipType = require('../models/MembershipType');

exports.createMembership = async (req, res) => {
  try {
    const { memberName, contactNumber, vehicleNumber, vehicleType, membershipTypeId, startDate, shift, workDate } = req.body;

    if (!memberName || !contactNumber || !vehicleNumber || !vehicleType || !membershipTypeId || !startDate || !shift || !workDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!['Morning', 'Night'].includes(shift)) {
      return res.status(400).json({ success: false, message: 'Shift must be Morning or Night' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) {
      return res.status(400).json({ success: false, message: 'Work date must be in yyyy-mm-dd format' });
    }

    const membershipType = await MembershipType.findOne({ _id: membershipTypeId, isActive: true });
    if (!membershipType) {
      return res.status(404).json({ success: false, message: 'Membership type not found or inactive' });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + membershipType.durationDays);

    const membership = await Membership.create({
      memberName,
      contactNumber,
      vehicleNumber,
      vehicleType,
      membershipTypeId: membershipType._id,
      membershipTypeName: membershipType.name,
      amount: membershipType.amount,
      startDate: start,
      endDate: end,
      operatorId: req.user._id,
      operatorName: req.user.name,
      shift,
      workDate,
    });

    res.status(201).json({ success: true, data: membership });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMemberships = async (req, res) => {
  try {
    const { page = 1, limit = 20, operatorId, startDate, endDate, shift, workDate } = req.query;
    const filter = {};

    if (req.user.role === 'operator') filter.operatorId = req.user._id;
    else if (operatorId) filter.operatorId = operatorId;

    if (shift) filter.shift = shift;

    // Filter by workDate (yyyy-mm-dd string) if provided, else fallback to range
    if (workDate) {
      filter.workDate = workDate;
    } else if (startDate || endDate) {
      filter.workDate = {};
      if (startDate) filter.workDate.$gte = startDate;
      if (endDate) filter.workDate.$lte = endDate;
    }

    const total = await Membership.countDocuments(filter);
    const memberships = await Membership.find(filter)
      .sort({ workDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('operatorId', 'name email')
      .populate('membershipTypeId', 'name amount durationDays color');

    res.json({
      success: true,
      data: memberships,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
