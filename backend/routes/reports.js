const express = require('express');
const router = express.Router();
const { getDashboardStats, getOperatorStats, getDailyReport, getShiftReport, getBatchReport } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/operators', protect, adminOnly, getOperatorStats);
router.get('/daily', protect, adminOnly, getDailyReport);
router.get('/shift', protect, adminOnly, getShiftReport);
router.get('/batch', protect, adminOnly, getBatchReport);

module.exports = router;
