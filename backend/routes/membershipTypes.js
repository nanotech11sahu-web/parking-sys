const express = require('express');
const router = express.Router();
const {
  getMembershipTypes, createMembershipType, updateMembershipType,
  deleteMembershipType, toggleMembershipType
} = require('../controllers/membershipTypeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getMembershipTypes);
router.post('/', protect, adminOnly, createMembershipType);
router.put('/:id', protect, adminOnly, updateMembershipType);
router.patch('/:id/toggle', protect, adminOnly, toggleMembershipType);
router.delete('/:id', protect, adminOnly, deleteMembershipType);

module.exports = router;
