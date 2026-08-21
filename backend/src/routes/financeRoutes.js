const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authenticateToken } = require('../middleware/auth');

router.get('/overview', authenticateToken, financeController.getFinanceOverview);
router.post('/pay-emi', authenticateToken, financeController.payEMIInstallment);

module.exports = router;
