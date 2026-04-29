const express = require('express');
const router = express.Router();
const {
  getParchiTypes, createParchiType, updateParchiType,
  toggleParchiType, deleteParchiType, resetSerial
} = require('../controllers/parchiTypeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getParchiTypes);
router.post('/', protect, adminOnly, createParchiType);
router.put('/:id', protect, adminOnly, updateParchiType);
router.patch('/:id/toggle', protect, adminOnly, toggleParchiType);
router.patch('/:id/reset-serial', protect, adminOnly, resetSerial);
router.delete('/:id', protect, adminOnly, deleteParchiType);

module.exports = router;
