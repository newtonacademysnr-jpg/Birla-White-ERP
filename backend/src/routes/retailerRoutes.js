const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailerController');

router.get('/', retailerController.getAllRetailers);
router.get('/:id', retailerController.getRetailerById);
router.post('/', retailerController.createRetailer);
router.put('/:id', retailerController.updateRetailer);
router.delete('/:id', retailerController.deleteRetailer);

module.exports = router;
