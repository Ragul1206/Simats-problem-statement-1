const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');

router.get('/products', authenticateToken, inventoryController.getInventoryProducts);
router.post('/receive-goods', authenticateToken, inventoryController.receiveGoodsForPO);

module.exports = router;
