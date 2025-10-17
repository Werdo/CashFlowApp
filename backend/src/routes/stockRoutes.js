const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Stock unit routes
router.get('/', stockController.getStock);
router.get('/aging-report', stockController.getAgingReport);
router.get('/:id', stockController.getStockUnit);
router.post('/', authorize('admin', 'manager'), stockController.createStockUnit);
router.put('/:id/move', authorize('admin', 'manager'), stockController.moveStockUnit);
router.put('/:id/reserve', authorize('admin', 'manager'), stockController.reserveStockUnit);

// Lot routes
router.get('/lots', stockController.getLots);
router.get('/lots/expiring', stockController.getExpiringLots);
router.post('/lots', authorize('admin', 'manager'), stockController.createLot);

module.exports = router;
