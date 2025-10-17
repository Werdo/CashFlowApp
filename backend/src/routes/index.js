const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const clientRoutes = require('./clientRoutes');
const articleRoutes = require('./articleRoutes');
const stockRoutes = require('./stockRoutes');
const settingsRoutes = require('./settingsRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/articles', articleRoutes);
router.use('/stock', stockRoutes);
router.use('/settings', settingsRoutes);

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
