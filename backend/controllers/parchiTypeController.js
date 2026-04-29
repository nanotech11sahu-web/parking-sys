const ParchiType = require('../models/ParchiType');

exports.getParchiTypes = async (req, res) => {
  try {
    const filter = req.user.role === 'operator' ? { isActive: true } : {};
    const types = await ParchiType.find(filter).sort({ amount: 1 });
    res.json({ success: true, data: types });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createParchiType = async (req, res) => {
  try {
    const { name, amount, prefix, color, description } = req.body;
    const type = await ParchiType.create({ name, amount, prefix, color, description });
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateParchiType = async (req, res) => {
  try {
    const { name, amount, prefix, isActive, color, description } = req.body;
    const type = await ParchiType.findByIdAndUpdate(
      req.params.id,
      { name, amount, prefix, isActive, color, description },
      { new: true, runValidators: true }
    );
    if (!type) return res.status(404).json({ success: false, message: 'Parchi type not found' });
    res.json({ success: true, data: type });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleParchiType = async (req, res) => {
  try {
    const type = await ParchiType.findById(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Parchi type not found' });
    type.isActive = !type.isActive;
    await type.save();
    res.json({ success: true, data: type });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteParchiType = async (req, res) => {
  try {
    const type = await ParchiType.findById(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Parchi type not found' });
    await type.deleteOne();
    res.json({ success: true, message: 'Parchi type deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetSerial = async (req, res) => {
  try {
    const type = await ParchiType.findByIdAndUpdate(
      req.params.id,
      { currentSerial: 0 },
      { new: true }
    );
    if (!type) return res.status(404).json({ success: false, message: 'Parchi type not found' });
    res.json({ success: true, data: type, message: 'Serial reset to 0' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
