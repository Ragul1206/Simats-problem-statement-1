const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

router.post('/recommend-vendor', authenticateToken, aiController.recommendVendorForRFQ);

module.exports = router;
