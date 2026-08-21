const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.get('/', authenticateToken, vendorController.getAllVendors);
router.get('/:id', authenticateToken, vendorController.getVendorById);
router.post('/', authenticateToken, requireRoles('admin', 'procurement_manager'), vendorController.createVendor);
router.put('/:id', authenticateToken, requireRoles('admin', 'procurement_manager'), vendorController.updateVendor);

module.exports = router;
