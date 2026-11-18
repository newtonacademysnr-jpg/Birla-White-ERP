const express = require('express');
const router = express.Router();
const pjpController = require('../controllers/pjpController');

router.get('/', pjpController.getAllPjpVisits);
router.post('/', pjpController.createPjpVisit);
router.put('/:id', pjpController.updatePjpVisit);
router.delete('/:id', pjpController.deletePjpVisit);

module.exports = router;
