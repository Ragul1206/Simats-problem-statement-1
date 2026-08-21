const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfqController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, rfqController.getAllRFQs);
router.get('/:id', authenticateToken, rfqController.getRFQById);
router.post('/', authenticateToken, rfqController.createRFQ);

module.exports = router;
