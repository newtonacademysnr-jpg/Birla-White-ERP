const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');

// Dispatch processing
router.post('/orders/:orderId/dispatch', dispatchController.processDispatch);

// Stage-Specific Split Receipts
router.get('/:id/receipt/dispatched', dispatchController.downloadDispatchedChallan);
router.get('/:id/receipt/pending', dispatchController.downloadPendingSlip);

module.exports = router;
