const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'OK',
    service: 'Procurement ERP Backend REST API',
    timestamp: new Date().toISOString()
  });
});

// Import backend routes
const authRoutes = require('../backend/src/routes/authRoutes');
const vendorRoutes = require('../backend/src/routes/vendorRoutes');
const rfqRoutes = require('../backend/src/routes/rfqRoutes');
const quoteRoutes = require('../backend/src/routes/quoteRoutes');
const aiRoutes = require('../backend/src/routes/aiRoutes');
const poRoutes = require('../backend/src/routes/poRoutes');
const inventoryRoutes = require('../backend/src/routes/inventoryRoutes');
const financeRoutes = require('../backend/src/routes/financeRoutes');
const warrantyRoutes = require('../backend/src/routes/warrantyRoutes');
const auditRoutes = require('../backend/src/routes/auditRoutes');

const registerRoute = (routePath, router) => {
  app.use(routePath, router);
  if (routePath.startsWith('/api')) {
    app.use(routePath.replace('/api', ''), router);
  }
};

registerRoute('/api/auth', authRoutes);
registerRoute('/api/vendors', vendorRoutes);
registerRoute('/api/rfqs', rfqRoutes);
registerRoute('/api/quotations', quoteRoutes);
registerRoute('/api/ai', aiRoutes);
registerRoute('/api/purchase-orders', poRoutes);
registerRoute('/api/inventory', inventoryRoutes);
registerRoute('/api/finance', financeRoutes);
registerRoute('/api/warranty', warrantyRoutes);
registerRoute('/api/audit', auditRoutes);

module.exports = app;
