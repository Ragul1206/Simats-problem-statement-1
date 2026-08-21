const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const rfqRoutes = require('./src/routes/rfqRoutes');
const quoteRoutes = require('./src/routes/quoteRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const poRoutes = require('./src/routes/poRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const warrantyRoutes = require('./src/routes/warrantyRoutes');
const auditRoutes = require('./src/routes/auditRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotations', quoteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/warranty', warrantyRoutes);
app.use('/api/audit', auditRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Procurement ERP Backend REST API',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Procurement ERP Backend Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
