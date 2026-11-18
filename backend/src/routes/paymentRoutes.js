const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Payments
router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.recordPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

// Payment Receipt PDF
router.get('/:id/receipt', paymentController.downloadPaymentReceipt);

// Retailer Ledger & Live Ageing / Overdue Tracker
router.get('/ledger/summary', paymentController.getRetailerLedgerSummary);
router.get('/ledger/retailer/:id', paymentController.getRetailerLedgerDetail);

module.exports = router;
