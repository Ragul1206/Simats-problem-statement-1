const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, warrantyController.getAllWarrantyClaims);
router.post('/', authenticateToken, warrantyController.createWarrantyClaim);
router.put('/:id/status', authenticateToken, warrantyController.updateWarrantyClaimStatus);

module.exports = router;
