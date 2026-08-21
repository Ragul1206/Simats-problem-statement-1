const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register-vendor', authController.registerVendor);
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
