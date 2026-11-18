const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/dashboard', analyticsController.getDashboardSummary);
router.get('/bi', analyticsController.getBiAnalytics);

module.exports = router;
