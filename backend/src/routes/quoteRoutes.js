const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const quoteController = require('../controllers/quoteController');
const { authenticateToken } = require('../middleware/auth');

const uploadDir = process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, '../../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Upload directory warning:', e.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/upload', authenticateToken, upload.single('quoteFile'), quoteController.uploadAndProcessQuote);
router.get('/rfq/:rfq_id', authenticateToken, quoteController.getQuotesByRFQ);

module.exports = router;
