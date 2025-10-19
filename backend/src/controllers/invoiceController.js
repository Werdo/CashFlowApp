const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Deposit = require('../models/Deposit');
const DeliveryNote = require('../models/DeliveryNote');

/**
 * @desc    Get all invoices with filters
 * @route   GET /api/invoices
 * @access  Private
 * @query   status, clientId, dateFrom, dateTo, search, page, limit
 */
const getInvoices = async (req, res, next) => {
  try {
    const {
      status,
      clientId,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 100,
      sortBy = 'issueDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by client
    if (clientId) {
      query.client = clientId;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.issueDate = {};
      if (dateFrom) {
        query.issueDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.issueDate.$lte = new Date(dateTo);
      }
    }

    // Search by invoice number or client name
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('client', 'code name taxId email color')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Invoice.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: invoices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'code name taxId email phone address color')
      .populate('relatedDeposits', 'code status dueDate')
      .populate('relatedDeliveryNotes', 'code deliveryDate')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new invoice
 * @route   POST /api/invoices
 * @access  Private (admin, manager)
 */
const createInvoice = async (req, res, next) => {
  try {
    const {
      invoiceNumber, // Optional - auto-generated if not provided
      client: clientId,
      items,
      subtotal,
      taxRate,
      tax,
      discount,
      total,
      issueDate,
      dueDate,
      status,
      paymentMethod,
      notes,
      internalNotes,
      relatedDeposits,
      relatedDeliveryNotes
    } = req.body;

    // Validate required fields
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client is required'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invoice must have at least one item'
      });
    }

    // Validate client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Create invoice with enriched client data
    const invoice = new Invoice({
      invoiceNumber, // Will be auto-generated if not provided
      client: clientId,
      clientName: client.name,
      clientTaxId: client.taxId,
      clientEmail: client.email,
      clientAddress: client.address,
      items,
      subtotal,
      taxRate: taxRate || 21,
      tax,
      discount: discount || 0,
      total,
      issueDate: issueDate || new Date(),
      dueDate,
      status: status || 'draft',
      paymentMethod: paymentMethod || 'transfer',
      notes,
      internalNotes,
      relatedDeposits,
      relatedDeliveryNotes,
      createdBy: req.user._id
    });

    await invoice.save();

    // Populate for response
    await invoice.populate('client', 'code name taxId email color');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle duplicate invoice number
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number already exists'
      });
    }

    next(error);
  }
};

/**
 * @desc    Update invoice
 * @route   PUT /api/invoices/:id
 * @access  Private (admin, manager)
 */
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Prevent updating paid invoices (except to mark as refunded)
    if (invoice.status === 'paid' && req.body.status !== 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify paid invoice. Use refund if needed.',
        error: {
          code: 'INVOICE_PAID',
          details: 'Paid invoices cannot be modified except to refund them'
        }
      });
    }

    // Prevent updating cancelled invoices
    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify cancelled invoice',
        error: {
          code: 'INVOICE_CANCELLED',
          details: 'Cancelled invoices cannot be modified'
        }
      });
    }

    const {
      client: clientId,
      items,
      subtotal,
      taxRate,
      tax,
      discount,
      total,
      issueDate,
      dueDate,
      status,
      paymentMethod,
      paymentReference,
      notes,
      internalNotes,
      relatedDeposits,
      relatedDeliveryNotes
    } = req.body;

    // If client is changed, update denormalized client data
    if (clientId && clientId !== invoice.client.toString()) {
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      invoice.client = clientId;
      invoice.clientName = client.name;
      invoice.clientTaxId = client.taxId;
      invoice.clientEmail = client.email;
      invoice.clientAddress = client.address;
    }

    // Update fields
    if (items !== undefined) invoice.items = items;
    if (subtotal !== undefined) invoice.subtotal = subtotal;
    if (taxRate !== undefined) invoice.taxRate = taxRate;
    if (tax !== undefined) invoice.tax = tax;
    if (discount !== undefined) invoice.discount = discount;
    if (total !== undefined) invoice.total = total;
    if (issueDate !== undefined) invoice.issueDate = issueDate;
    if (dueDate !== undefined) invoice.dueDate = dueDate;
    if (status !== undefined) invoice.status = status;
    if (paymentMethod !== undefined) invoice.paymentMethod = paymentMethod;
    if (paymentReference !== undefined) invoice.paymentReference = paymentReference;
    if (notes !== undefined) invoice.notes = notes;
    if (internalNotes !== undefined) invoice.internalNotes = internalNotes;
    if (relatedDeposits !== undefined) invoice.relatedDeposits = relatedDeposits;
    if (relatedDeliveryNotes !== undefined) invoice.relatedDeliveryNotes = relatedDeliveryNotes;

    invoice.updatedBy = req.user._id;

    await invoice.save();

    // Populate for response
    await invoice.populate('client', 'code name taxId email color');

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    next(error);
  }
};

/**
 * @desc    Delete (cancel) invoice
 * @route   DELETE /api/invoices/:id
 * @access  Private (admin, manager)
 */
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Prevent deleting paid invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid invoice. Use refund instead.',
        error: {
          code: 'INVOICE_PAID',
          details: 'Paid invoices cannot be deleted. Create a refund invoice instead.'
        }
      });
    }

    // Prevent deleting already cancelled invoices
    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Invoice already cancelled',
        error: {
          code: 'INVOICE_ALREADY_CANCELLED',
          details: 'This invoice is already cancelled'
        }
      });
    }

    // Soft delete by changing status to cancelled
    invoice.status = 'cancelled';
    invoice.updatedBy = req.user._id;
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice cancelled successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark invoice as paid
 * @route   POST /api/invoices/:id/mark-paid
 * @access  Private (admin, manager)
 */
const markAsPaid = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is already paid'
      });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark cancelled invoice as paid'
      });
    }

    const { paidDate, paymentMethod, paymentReference } = req.body;

    await invoice.markAsPaid({
      paidDate,
      paymentMethod,
      paymentReference
    });

    invoice.updatedBy = req.user._id;
    await invoice.save();

    await invoice.populate('client', 'code name taxId email color');

    res.json({
      success: true,
      message: 'Invoice marked as paid successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send invoice via email
 * @route   POST /api/invoices/:id/send
 * @access  Private (admin, manager)
 */
const sendInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'code name email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send cancelled invoice'
      });
    }

    const { emails } = req.body;

    // Use client email if no emails provided
    const recipientEmails = emails && emails.length > 0
      ? emails
      : invoice.client.email
        ? [invoice.client.email]
        : [];

    if (recipientEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipient email addresses provided or found for client'
      });
    }

    // TODO: Implement actual email sending logic here
    // For now, just update the invoice status and sent records

    await invoice.sendInvoice(recipientEmails);

    invoice.updatedBy = req.user._id;
    await invoice.save();

    res.json({
      success: true,
      message: `Invoice sent to ${recipientEmails.length} recipient(s)`,
      data: invoice,
      recipients: recipientEmails
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get invoice statistics
 * @route   GET /api/invoices/stats
 * @access  Private
 */
const getInvoiceStats = async (req, res, next) => {
  try {
    const { clientId, dateFrom, dateTo } = req.query;

    // Build filter
    const filter = {};
    if (clientId) {
      filter.client = clientId;
    }
    if (dateFrom || dateTo) {
      filter.issueDate = {};
      if (dateFrom) filter.issueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.issueDate.$lte = new Date(dateTo);
    }

    const stats = await Invoice.getStats(filter);

    // Get overdue count
    const overdueCount = await Invoice.countDocuments({
      ...filter,
      status: 'overdue'
    });

    res.json({
      success: true,
      data: {
        ...stats,
        overdueCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get invoices by status
 * @route   GET /api/invoices/by-status/:status
 * @access  Private
 */
const getInvoicesByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const { clientId, limit = 50 } = req.query;

    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const query = { status };
    if (clientId) {
      query.client = clientId;
    }

    const invoices = await Invoice.find(query)
      .populate('client', 'code name taxId email color')
      .sort({ issueDate: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      count: invoices.length,
      status,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to invoice
 * @route   POST /api/invoices/:id/items
 * @access  Private (admin, manager)
 */
const addInvoiceItem = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Prevent modifying paid or cancelled invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify paid invoice',
        error: { code: 'INVOICE_PAID' }
      });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify cancelled invoice',
        error: { code: 'INVOICE_CANCELLED' }
      });
    }

    const { description, quantity, unitPrice, total, type, period, relatedDeposit, relatedDeliveryNote } = req.body;

    if (!description || quantity === undefined || unitPrice === undefined || total === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Description, quantity, unitPrice, and total are required'
      });
    }

    const newItem = {
      description,
      quantity,
      unitPrice,
      total,
      type: type || 'other',
      period,
      relatedDeposit,
      relatedDeliveryNote
    };

    invoice.items.push(newItem);

    // Recalculate totals
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
    invoice.tax = (invoice.subtotal - invoice.discount) * (invoice.taxRate / 100);
    invoice.total = invoice.subtotal - invoice.discount + invoice.tax;

    invoice.updatedBy = req.user._id;
    await invoice.save();

    await invoice.populate('client', 'code name taxId email color');

    res.json({
      success: true,
      message: 'Item added to invoice successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from invoice
 * @route   DELETE /api/invoices/:id/items/:itemId
 * @access  Private (admin, manager)
 */
const removeInvoiceItem = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Prevent modifying paid or cancelled invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify paid invoice',
        error: { code: 'INVOICE_PAID' }
      });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify cancelled invoice',
        error: { code: 'INVOICE_CANCELLED' }
      });
    }

    const itemIndex = invoice.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in invoice'
      });
    }

    // Check if this is the last item
    if (invoice.items.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the last item from invoice. Delete invoice instead.',
        error: { code: 'LAST_ITEM' }
      });
    }

    invoice.items.splice(itemIndex, 1);

    // Recalculate totals
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
    invoice.tax = (invoice.subtotal - invoice.discount) * (invoice.taxRate / 100);
    invoice.total = invoice.subtotal - invoice.discount + invoice.tax;

    invoice.updatedBy = req.user._id;
    await invoice.save();

    await invoice.populate('client', 'code name taxId email color');

    res.json({
      success: true,
      message: 'Item removed from invoice successfully',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
