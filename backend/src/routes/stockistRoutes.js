const express = require('express');
const router = express.Router();
const stockistController = require('../controllers/stockistController');

router.get('/', stockistController.getAllStockists);
router.get('/:id', stockistController.getStockistById);
router.post('/', stockistController.createStockist);
router.put('/:id', stockistController.updateStockist);
router.delete('/:id', stockistController.deleteStockist);

module.exports = router;
