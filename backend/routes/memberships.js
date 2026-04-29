const express = require('express');
const router = express.Router();
const { createMembership, getMemberships } = require('../controllers/membershipController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createMembership);
router.get('/', protect, getMemberships);

module.exports = router;
