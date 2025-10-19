const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const clientRoutes = require('./clientRoutes');
const articleRoutes = require('./articleRoutes');
const stockRoutes = require('./stockRoutes');
const settingsRoutes = require('./settingsRoutes');
const deliveryNoteRoutes = require('./deliveryNoteRoutes');
const depositRoutes = require('./depositRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const reportRoutes = require('./reportRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/articles', articleRoutes);
router.use('/stock', stockRoutes);
router.use('/settings', settingsRoutes);
router.use('/delivery-notes', deliveryNoteRoutes);
router.use('/deposits', depositRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/reports', reportRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.1.0'
  });
});

module.exports = router;
