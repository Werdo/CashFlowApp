const DeliveryNote = require('../models/DeliveryNote');
const StockUnit = require('../models/StockUnit');
const Article = require('../models/Article');
const Client = require('../models/Client');
const Lot = require('../models/Lot');

/**
 * Get all delivery notes with filters
 * GET /api/delivery-notes
 * Query params: type, status, clientId, startDate, endDate, search
 */
async function getDeliveryNotes(req, res, next) {
  try {
    const { type, status, clientId, startDate, endDate, search } = req.query;

    const filter = {};

    // Filter by type (entry, exit, transfer)
    if (type && ['entry', 'exit', 'transfer'].includes(type)) {
      filter.type = type;
    }

    // Filter by status
    if (status && ['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    // Filter by client
    if (clientId) {
      filter.clientId = clientId;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Search by number
    if (search) {
      filter.number = { $regex: search, $options: 'i' };
    }

    const deliveryNotes = await DeliveryNote.find(filter)
      .populate('clientId', 'code name')
      .populate('items.articleId', 'sku name')
      .populate('items.lotId', 'code')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('processedBy', 'name email')
      .sort({ date: -1, number: -1 })
      .lean();

    res.json({
      success: true,
      count: deliveryNotes.length,
      data: deliveryNotes
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single delivery note by ID
 * GET /api/delivery-notes/:id
 */
async function getDeliveryNote(req, res, next) {
  try {
    const deliveryNote = await DeliveryNote.findById(req.params.id)
      .populate('clientId', 'code name email phone address color')
      .populate('items.articleId', 'sku ean name description familyId')
      .populate('items.lotId', 'code expiryDate')
      .populate('items.stockUnits')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('processedBy', 'name email')
      .lean();

    if (!deliveryNote) {
      return res.status(404).json({
        success: false,
        message: 'Delivery note not found'
      });
    }

    res.json({
      success: true,
      data: deliveryNote
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new delivery note
 * POST /api/delivery-notes
 */
async function createDeliveryNote(req, res, next) {
  try {
    const {
      type,
      date,
      clientId,
      warehouseId,
      items,
      origin,
      destination,
      notes
    } = req.body;

    // Validate required fields
    if (!type || !clientId || !warehouseId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, clientId, warehouseId, items'
      });
    }

    // Validate type
    if (!['entry', 'exit', 'transfer'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be: entry, exit, or transfer'
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

    // Validate articles and lots exist
    for (const item of items) {
      const article = await Article.findById(item.articleId);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: `Article not found: ${item.articleId}`
        });
      }

      const lot = await Lot.findById(item.lotId);
      if (!lot) {
        return res.status(404).json({
          success: false,
          message: `Lot not found: ${item.lotId}`
        });
      }
    }

    // Generate next delivery note number
    const number = await DeliveryNote.generateNextNumber(type);

    // Create delivery note
    const deliveryNote = new DeliveryNote({
      number,
      type,
      date: date || new Date(),
      clientId,
      warehouseId,
      items,
      origin,
      destination,
      notes,
      status: 'pending',
      createdBy: req.userId,
      updatedBy: req.userId
    });

    await deliveryNote.save();

    // Populate for response
    await deliveryNote.populate('clientId', 'code name');
    await deliveryNote.populate('items.articleId', 'sku name');
    await deliveryNote.populate('items.lotId', 'code');

    res.status(201).json({
      success: true,
      message: 'Delivery note created successfully',
      data: deliveryNote
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update delivery note
 * PUT /api/delivery-notes/:id
 */
async function updateDeliveryNote(req, res, next) {
  try {
    const deliveryNote = await DeliveryNote.findById(req.params.id);

    if (!deliveryNote) {
      return res.status(404).json({
        success: false,
        message: 'Delivery note not found'
      });
    }

    // Don't allow editing completed or cancelled delivery notes
    if (['completed', 'cancelled'].includes(deliveryNote.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit ${deliveryNote.status} delivery note`
      });
    }

    const {
      date,
      clientId,
      warehouseId,
      items,
      origin,
      destination,
      status,
      notes
    } = req.body;

    // Update fields
    if (date) deliveryNote.date = date;
    if (clientId) deliveryNote.clientId = clientId;
    if (warehouseId) deliveryNote.warehouseId = warehouseId;
    if (items) deliveryNote.items = items;
    if (origin) deliveryNote.origin = origin;
    if (destination) deliveryNote.destination = destination;
    if (status) deliveryNote.status = status;
    if (notes !== undefined) deliveryNote.notes = notes;

    deliveryNote.updatedBy = req.userId;

    await deliveryNote.save();

    // Populate for response
    await deliveryNote.populate('clientId', 'code name');
    await deliveryNote.populate('items.articleId', 'sku name');
    await deliveryNote.populate('items.lotId', 'code');

    res.json({
      success: true,
      message: 'Delivery note updated successfully',
      data: deliveryNote
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete delivery note (soft delete - change status to cancelled)
 * DELETE /api/delivery-notes/:id
 */
async function deleteDeliveryNote(req, res, next) {
  try {
    const deliveryNote = await DeliveryNote.findById(req.params.id);

    if (!deliveryNote) {
      return res.status(404).json({
        success: false,
        message: 'Delivery note not found'
      });
    }

    // Don't allow deleting completed delivery notes
    if (deliveryNote.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed delivery note. Cancel it instead.',
        error: {
          code: 'DELIVERY_NOTE_COMPLETED',
          details: 'Completed delivery notes cannot be deleted',
          suggestions: [
            'Change status to cancelled if needed',
            'Create a reversal delivery note instead'
          ]
        }
      });
    }

    // Soft delete - mark as cancelled
    deliveryNote.status = 'cancelled';
    deliveryNote.updatedBy = req.userId;
    await deliveryNote.save();

    res.json({
      success: true,
      message: 'Delivery note cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Complete delivery note processing
 * POST /api/delivery-notes/:id/complete
 */
async function completeDeliveryNote(req, res, next) {
  try {
    const deliveryNote = await DeliveryNote.findById(req.params.id);

    if (!deliveryNote) {
      return res.status(404).json({
        success: false,
        message: 'Delivery note not found'
      });
    }

    if (deliveryNote.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Delivery note is already completed'
      });
    }

    if (deliveryNote.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete cancelled delivery note'
      });
    }

    // Mark as completed
    await deliveryNote.complete(req.userId);

    // Populate for response
    await deliveryNote.populate('clientId', 'code name');
    await deliveryNote.populate('processedBy', 'name email');

    res.json({
      success: true,
      message: 'Delivery note completed successfully',
      data: deliveryNote
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get delivery note statistics
 * GET /api/delivery-notes/stats
 */
async function getDeliveryNoteStats(req, res, next) {
  try {
    const { startDate, endDate, type } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (type) {
      filter.type = type;
    }

    const [
      totalCount,
      pendingCount,
      processingCount,
      completedCount,
      cancelledCount,
      entryCount,
      exitCount,
      transferCount,
      totalUnits
    ] = await Promise.all([
      DeliveryNote.countDocuments(filter),
      DeliveryNote.countDocuments({ ...filter, status: 'pending' }),
      DeliveryNote.countDocuments({ ...filter, status: 'processing' }),
      DeliveryNote.countDocuments({ ...filter, status: 'completed' }),
      DeliveryNote.countDocuments({ ...filter, status: 'cancelled' }),
      DeliveryNote.countDocuments({ ...filter, type: 'entry' }),
      DeliveryNote.countDocuments({ ...filter, type: 'exit' }),
      DeliveryNote.countDocuments({ ...filter, type: 'transfer' }),
      DeliveryNote.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$totalUnits' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalCount,
        byStatus: {
          pending: pendingCount,
          processing: processingCount,
          completed: completedCount,
          cancelled: cancelledCount
        },
        byType: {
          entry: entryCount,
          exit: exitCount,
          transfer: transferCount
        },
        totalUnits: totalUnits[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDeliveryNotes,
  getDeliveryNote,
  createDeliveryNote,
  updateDeliveryNote,
  deleteDeliveryNote,
  completeDeliveryNote,
  getDeliveryNoteStats
};
