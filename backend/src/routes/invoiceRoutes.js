const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markAsPaid,
  sendInvoice,
  getInvoiceStats,
  getInvoicesByStatus,
  addInvoiceItem,
  removeInvoiceItem
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/invoices/stats - Get statistics (before /:id to avoid conflict)
router.get('/stats', getInvoiceStats);

// GET /api/invoices/by-status/:status - Get invoices by status
router.get('/by-status/:status', getInvoicesByStatus);

// GET /api/invoices - List all invoices with filters
// Query params: status, clientId, dateFrom, dateTo, search, page, limit, sortBy, sortOrder
router.get('/', getInvoices);

// GET /api/invoices/:id - Get single invoice
router.get('/:id', getInvoice);

// POST /api/invoices - Create new invoice
// Body: { client, items[], subtotal, taxRate, tax, discount, total, issueDate, dueDate, status, paymentMethod, notes, internalNotes, relatedDeposits[], relatedDeliveryNotes[] }
router.post('/', authorize('admin', 'manager'), createInvoice);

// PUT /api/invoices/:id - Update invoice
// Body: { client, items[], subtotal, taxRate, tax, discount, total, issueDate, dueDate, status, paymentMethod, paymentReference, notes, internalNotes, relatedDeposits[], relatedDeliveryNotes[] }
router.put('/:id', authorize('admin', 'manager'), updateInvoice);

// DELETE /api/invoices/:id - Delete (cancel) invoice
router.delete('/:id', authorize('admin', 'manager'), deleteInvoice);

// POST /api/invoices/:id/mark-paid - Mark invoice as paid
// Body: { paidDate, paymentMethod, paymentReference }
router.post('/:id/mark-paid', authorize('admin', 'manager'), markAsPaid);

// POST /api/invoices/:id/send - Send invoice via email
// Body: { emails[] }
router.post('/:id/send', authorize('admin', 'manager'), sendInvoice);

// POST /api/invoices/:id/items - Add item to invoice
// Body: { description, quantity, unitPrice, total, type, period, relatedDeposit, relatedDeliveryNote }
router.post('/:id/items', authorize('admin', 'manager'), addInvoiceItem);

// DELETE /api/invoices/:id/items/:itemId - Remove item from invoice
router.delete('/:id/items/:itemId', authorize('admin', 'manager'), removeInvoiceItem);

module.exports = router;
