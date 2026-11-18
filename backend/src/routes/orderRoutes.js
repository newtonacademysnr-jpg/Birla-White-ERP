const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.put('/:id/deliver', orderController.markAsDelivered);
router.delete('/:id', orderController.deleteOrder);

// Dual-Receipt Generation Endpoints
router.get('/:id/receipt/retailer', orderController.downloadRetailerReceipt);
router.get('/:id/receipt/stockist', orderController.downloadStockistReceipt);

module.exports = router;
