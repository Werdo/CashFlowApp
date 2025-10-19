const express = require('express');
const router = express.Router();
const {
  getDeliveryNotes,
  getDeliveryNote,
  createDeliveryNote,
  updateDeliveryNote,
  deleteDeliveryNote,
  completeDeliveryNote,
  getDeliveryNoteStats
} = require('../controllers/deliveryNoteController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/delivery-notes/stats - Get statistics (before /:id to avoid conflict)
router.get('/stats', getDeliveryNoteStats);

// GET /api/delivery-notes - List all delivery notes with filters
// Query params: type, status, clientId, startDate, endDate, search
router.get('/', getDeliveryNotes);

// GET /api/delivery-notes/:id - Get single delivery note
router.get('/:id', getDeliveryNote);

// POST /api/delivery-notes - Create new delivery note
// Body: { type, date, clientId, warehouseId, items[], origin{}, destination{}, notes }
router.post('/', authorize('admin', 'manager'), createDeliveryNote);

// PUT /api/delivery-notes/:id - Update delivery note
// Body: { date, clientId, warehouseId, items[], origin{}, destination{}, status, notes }
router.put('/:id', authorize('admin', 'manager'), updateDeliveryNote);

// DELETE /api/delivery-notes/:id - Delete (cancel) delivery note
router.delete('/:id', authorize('admin', 'manager'), deleteDeliveryNote);

// POST /api/delivery-notes/:id/complete - Mark delivery note as completed
router.post('/:id/complete', authorize('admin', 'manager'), completeDeliveryNote);

module.exports = router;
