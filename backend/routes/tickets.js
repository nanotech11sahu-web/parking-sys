const express = require('express');
const router = express.Router();
const { createBatchTickets, getTickets, getBatchSummary } = require('../controllers/ticketController');
const { protect, adminOnly } = require('../middleware/auth');


router.post('/batch', protect, createBatchTickets);
router.get('/', protect, getTickets);
router.get('/batch-summary', protect, getBatchSummary);
router.delete('/batch', protect, adminOnly, deleteBatchTickets);

module.exports = router;
