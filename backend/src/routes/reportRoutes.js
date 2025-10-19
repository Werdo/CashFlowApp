const express = require('express');
const router = express.Router();
const {
  getInventoryReport,
  getMovementsReport,
  getDepositsReport,
  getFinancialReport,
  getClientsReport,
  getDashboardReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/reports/dashboard - Get dashboard overview
router.get('/dashboard', getDashboardReport);

// GET /api/reports/inventory - Get inventory report
// Query params: dateFrom, dateTo, familyId, warehouseId
router.get('/inventory', getInventoryReport);

// GET /api/reports/movements - Get movements report (delivery notes)
// Query params: dateFrom, dateTo, clientId, type
router.get('/movements', getMovementsReport);

// GET /api/reports/deposits - Get deposits report
// Query params: dateFrom, dateTo, clientId, status
router.get('/deposits', getDepositsReport);

// GET /api/reports/financial - Get financial report (invoices)
// Query params: dateFrom, dateTo, clientId, status
router.get('/financial', getFinancialReport);

// GET /api/reports/clients - Get clients activity report
router.get('/clients', getClientsReport);

module.exports = router;
