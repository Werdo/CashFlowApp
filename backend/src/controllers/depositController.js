const Deposit = require('../models/Deposit');
const Article = require('../models/Article');
const Client = require('../models/Client');

/**
 * Get all deposits with filters
 * GET /api/deposits
 * Query params: status, clientId, alertLevel, search
 */
async function getDeposits(req, res, next) {
  try {
    const { status, clientId, alertLevel, search } = req.query;

    const filter = {};

    // Filter by status
    if (status && ['active', 'invoiced', 'partial', 'closed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    // Filter by client
    if (clientId) {
      filter.client = clientId;
    }

    // Search by code or client name
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } }
      ];
    }

    let query = Deposit.find(filter)
      .populate('client', 'code name color')
      .populate('items.article', 'sku name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ receivedDate: -1, code: -1 });

    // Special handling for alert level filter
    if (alertLevel && ['critical', 'warning', 'info'].includes(alertLevel)) {
      // This requires post-processing since alertLevel is a virtual
      const allDeposits = await query.lean();

      const now = new Date();
      const filteredDeposits = allDeposits.filter(deposit => {
        if (!deposit.dueDate || !['active', 'partial'].includes(deposit.status)) {
          return false;
        }

        const daysUntilDue = Math.ceil((new Date(deposit.dueDate) - now) / (1000 * 60 * 60 * 24));

        if (alertLevel === 'critical' && daysUntilDue < 0) return true;
        if (alertLevel === 'warning' && daysUntilDue >= 0 && daysUntilDue <= 7) return true;
        if (alertLevel === 'info' && daysUntilDue > 7 && daysUntilDue <= 30) return true;

        return false;
      });

      return res.json({
        success: true,
        count: filteredDeposits.length,
        data: filteredDeposits
      });
    }

    const deposits = await query.lean();

    res.json({
      success: true,
      count: deposits.length,
      data: deposits
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single deposit by ID
 * GET /api/deposits/:id
 */
async function getDeposit(req, res, next) {
  try {
    const deposit = await Deposit.findById(req.params.id)
      .populate('client', 'code name email phone address color')
      .populate('items.article', 'sku ean name description familyId pricing dimensions')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    res.json({
      success: true,
      data: deposit
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new deposit
 * POST /api/deposits
 */
async function createDeposit(req, res, next) {
  try {
    const {
      code,
      client: clientId,
      warehouse,
      location,
      items,
      dueDate,
      notes
    } = req.body;

    // Validate required fields
    if (!clientId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: client, items'
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

    // Validate articles exist and enrich item data
    const enrichedItems = [];
    for (const item of items) {
      const article = await Article.findById(item.article);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: `Article not found: ${item.article}`
        });
      }

      enrichedItems.push({
        article: item.article,
        articleName: article.name,
        articleSKU: article.sku,
        quantity: item.quantity,
        unit: item.unit || 'units',
        receivedDate: item.receivedDate || new Date(),
        expiryDate: item.expiryDate,
        lotNumber: item.lotNumber,
        notes: item.notes
      });
    }

    // Create deposit
    const deposit = new Deposit({
      code, // Will be auto-generated if not provided
      client: clientId,
      clientName: client.name,
      warehouse,
      warehouseName: warehouse, // TODO: populate from warehouse ref when available
      location,
      items: enrichedItems,
      receivedDate: new Date(),
      dueDate,
      notes,
      status: 'active',
      createdBy: req.userId,
      updatedBy: req.userId
    });

    await deposit.save();

    // Populate for response
    await deposit.populate('client', 'code name color');
    await deposit.populate('items.article', 'sku name');

    res.status(201).json({
      success: true,
      message: 'Deposit created successfully',
      data: deposit
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update deposit
 * PUT /api/deposits/:id
 */
async function updateDeposit(req, res, next) {
  try {
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    // Don't allow editing closed or cancelled deposits
    if (['closed', 'cancelled'].includes(deposit.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit ${deposit.status} deposit`,
        error: {
          code: 'DEPOSIT_LOCKED',
          details: `Deposit with status '${deposit.status}' cannot be modified`,
          suggestions: [
            'Create a new deposit instead',
            'Contact administrator if this is an error'
          ]
        }
      });
    }

    const {
      client: clientId,
      warehouse,
      location,
      items,
      status,
      dueDate,
      notes
    } = req.body;

    // Update client if provided
    if (clientId && clientId !== deposit.client.toString()) {
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }
      deposit.client = clientId;
      deposit.clientName = client.name;
    }

    // Update items if provided
    if (items && items.length > 0) {
      // Validate articles and enrich data
      const enrichedItems = [];
      for (const item of items) {
        const article = await Article.findById(item.article);
        if (!article) {
          return res.status(404).json({
            success: false,
            message: `Article not found: ${item.article}`
          });
        }

        enrichedItems.push({
          _id: item._id, // Preserve item ID if updating existing
          article: item.article,
          articleName: article.name,
          articleSKU: article.sku,
          quantity: item.quantity,
          unit: item.unit || 'units',
          receivedDate: item.receivedDate || deposit.receivedDate,
          expiryDate: item.expiryDate,
          lotNumber: item.lotNumber,
          notes: item.notes
        });
      }
      deposit.items = enrichedItems;
    }

    // Update other fields
    if (warehouse !== undefined) deposit.warehouse = warehouse;
    if (location !== undefined) deposit.location = location;
    if (status !== undefined) deposit.status = status;
    if (dueDate !== undefined) deposit.dueDate = dueDate;
    if (notes !== undefined) deposit.notes = notes;

    deposit.updatedBy = req.userId;

    await deposit.save();

    // Populate for response
    await deposit.populate('client', 'code name color');
    await deposit.populate('items.article', 'sku name');

    res.json({
      success: true,
      message: 'Deposit updated successfully',
      data: deposit
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete deposit (soft delete - change status to cancelled)
 * DELETE /api/deposits/:id
 */
async function deleteDeposit(req, res, next) {
  try {
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    // Don't allow deleting closed deposits
    if (deposit.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete closed deposit',
        error: {
          code: 'DEPOSIT_CLOSED',
          details: 'Closed deposits cannot be deleted',
          suggestions: [
            'Mark as cancelled if needed',
            'Contact administrator for historical record changes'
          ]
        }
      });
    }

    // Don't allow deleting invoiced deposits
    if (deposit.status === 'invoiced') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete invoiced deposit',
        error: {
          code: 'DEPOSIT_INVOICED',
          details: 'Deposits that have been invoiced cannot be deleted',
          suggestions: [
            'Create a credit note instead',
            'Contact administrator for invoice-related changes'
          ]
        }
      });
    }

    // Soft delete - mark as cancelled
    deposit.status = 'cancelled';
    deposit.updatedBy = req.userId;
    await deposit.save();

    res.json({
      success: true,
      message: 'Deposit cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add item to deposit
 * POST /api/deposits/:id/items
 */
async function addDepositItem(req, res, next) {
  try {
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    if (['closed', 'cancelled'].includes(deposit.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot add items to ${deposit.status} deposit`
      });
    }

    const { article: articleId, quantity, unit, expiryDate, lotNumber, notes } = req.body;

    if (!articleId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: article, quantity'
      });
    }

    // Validate article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Add item
    await deposit.addItem({
      article: articleId,
      articleName: article.name,
      articleSKU: article.sku,
      quantity,
      unit: unit || 'units',
      receivedDate: new Date(),
      expiryDate,
      lotNumber,
      notes
    });

    deposit.updatedBy = req.userId;
    await deposit.save();

    await deposit.populate('items.article', 'sku name');

    res.json({
      success: true,
      message: 'Item added to deposit successfully',
      data: deposit
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove item from deposit
 * DELETE /api/deposits/:id/items/:itemId
 */
async function removeDepositItem(req, res, next) {
  try {
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    if (['closed', 'cancelled'].includes(deposit.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove items from ${deposit.status} deposit`
      });
    }

    const item = deposit.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in deposit'
      });
    }

    await deposit.removeItem(req.params.itemId);
    deposit.updatedBy = req.userId;
    await deposit.save();

    await deposit.populate('items.article', 'sku name');

    res.json({
      success: true,
      message: 'Item removed from deposit successfully',
      data: deposit
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get deposit statistics
 * GET /api/deposits/stats
 */
async function getDepositStats(req, res, next) {
  try {
    const { clientId } = req.query;

    const filter = clientId ? { client: clientId } : {};

    const [
      totalCount,
      activeCount,
      invoicedCount,
      partialCount,
      closedCount,
      cancelledCount,
      totalValue,
      criticalAlerts,
      warningAlerts,
      infoAlerts
    ] = await Promise.all([
      Deposit.countDocuments(filter),
      Deposit.countDocuments({ ...filter, status: 'active' }),
      Deposit.countDocuments({ ...filter, status: 'invoiced' }),
      Deposit.countDocuments({ ...filter, status: 'partial' }),
      Deposit.countDocuments({ ...filter, status: 'closed' }),
      Deposit.countDocuments({ ...filter, status: 'cancelled' }),
      Deposit.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$totalValue' } } }
      ]),
      Deposit.getByAlertLevel('critical').countDocuments(),
      Deposit.getByAlertLevel('warning').countDocuments(),
      Deposit.getByAlertLevel('info').countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        total: totalCount,
        byStatus: {
          active: activeCount,
          invoiced: invoicedCount,
          partial: partialCount,
          closed: closedCount,
          cancelled: cancelledCount
        },
        totalValue: totalValue[0]?.total || 0,
        alerts: {
          critical: criticalAlerts,
          warning: warningAlerts,
          info: infoAlerts
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get deposits by alert level
 * GET /api/deposits/alerts/:level
 */
async function getDepositsByAlertLevel(req, res, next) {
  try {
    const { level } = req.params;

    if (!['critical', 'warning', 'info'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert level. Must be: critical, warning, or info'
      });
    }

    const deposits = await Deposit.getByAlertLevel(level)
      .populate('client', 'code name color')
      .populate('items.article', 'sku name')
      .sort({ dueDate: 1 })
      .lean();

    res.json({
      success: true,
      count: deposits.length,
      data: deposits
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Close deposit
 * POST /api/deposits/:id/close
 */
async function closeDeposit(req, res, next) {
  try {
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    if (deposit.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Deposit is already closed'
      });
    }

    if (deposit.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot close cancelled deposit'
      });
    }

    deposit.status = 'closed';
    deposit.updatedBy = req.userId;
    await deposit.save();

    await deposit.populate('client', 'code name color');

    res.json({
      success: true,
      message: 'Deposit closed successfully',
      data: deposit
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
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
};
