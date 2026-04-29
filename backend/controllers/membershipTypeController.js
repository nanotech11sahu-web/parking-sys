const MembershipType = require('../models/MembershipType');

exports.getMembershipTypes = async (req, res) => {
  try {
    const filter = req.user.role === 'operator' ? { isActive: true } : {};
    const types = await MembershipType.find(filter).sort({ amount: 1 });
    res.json({ success: true, data: types });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMembershipType = async (req, res) => {
  try {
    const { name, amount, durationDays, color, description } = req.body;
    const type = await MembershipType.create({ name, amount, durationDays, color, description });
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMembershipType = async (req, res) => {
  try {
    const { name, amount, durationDays, isActive, color, description } = req.body;
    const type = await MembershipType.findByIdAndUpdate(
      req.params.id,
      { name, amount, durationDays, isActive, color, description },
      { new: true, runValidators: true }
    );
    if (!type) return res.status(404).json({ success: false, message: 'Membership type not found' });
    res.json({ success: true, data: type });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMembershipType = async (req, res) => {
  try {
    const type = await MembershipType.findById(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Membership type not found' });
    await type.deleteOne();
    res.json({ success: true, message: 'Membership type deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleMembershipType = async (req, res) => {
  try {
    const type = await MembershipType.findById(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Membership type not found' });
    type.isActive = !type.isActive;
    await type.save();
    res.json({ success: true, data: type });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
