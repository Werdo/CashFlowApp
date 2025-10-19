const express = require('express');
const router = express.Router();
const {
  getDeposits,
  getDeposit,
  createDeposit,
  updateDeposit,
  deleteDeposit,
  addDepositItem,
  removeDepositItem,
  getDepositStats,
  getDepositsByAlertLevel,
  closeDeposit
} = require('../controllers/depositController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/deposits/stats - Get statistics (before /:id to avoid conflict)
router.get('/stats', getDepositStats);

// GET /api/deposits/alerts/:level - Get deposits by alert level (critical, warning, info)
router.get('/alerts/:level', getDepositsByAlertLevel);

// GET /api/deposits - List all deposits with filters
// Query params: status, clientId, alertLevel, search
router.get('/', getDeposits);

// GET /api/deposits/:id - Get single deposit
router.get('/:id', getDeposit);

// POST /api/deposits - Create new deposit
// Body: { client, warehouse, location, items[], dueDate, notes }
router.post('/', authorize('admin', 'manager'), createDeposit);

// PUT /api/deposits/:id - Update deposit
// Body: { client, warehouse, location, items[], status, dueDate, notes }
router.put('/:id', authorize('admin', 'manager'), updateDeposit);

// DELETE /api/deposits/:id - Delete (cancel) deposit
router.delete('/:id', authorize('admin', 'manager'), deleteDeposit);

// POST /api/deposits/:id/close - Close deposit
router.post('/:id/close', authorize('admin', 'manager'), closeDeposit);

// POST /api/deposits/:id/items - Add item to deposit
// Body: { article, quantity, unit, expiryDate, lotNumber, notes }
router.post('/:id/items', authorize('admin', 'manager'), addDepositItem);

// DELETE /api/deposits/:id/items/:itemId - Remove item from deposit
router.delete('/:id/items/:itemId', authorize('admin', 'manager'), removeDepositItem);

module.exports = router;
