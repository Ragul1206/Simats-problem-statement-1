const express = require('express');
const router = express.Router();
const poController = require('../controllers/poController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.get('/', authenticateToken, poController.getAllPurchaseOrders);
router.get('/:id', authenticateToken, poController.getPOById);
router.post('/generate', authenticateToken, requireRoles('admin', 'procurement_manager', 'procurement_executive', 'customer'), poController.createPOFromQuotation);

module.exports = router;
