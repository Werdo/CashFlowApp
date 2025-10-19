const Article = require('../models/Article');
const Client = require('../models/Client');
const DeliveryNote = require('../models/DeliveryNote');
const Deposit = require('../models/Deposit');
const Invoice = require('../models/Invoice');
const StockUnit = require('../models/StockUnit');

/**
 * @desc    Get inventory report (articles and stock)
 * @route   GET /api/reports/inventory
 * @access  Private
 * @query   dateFrom, dateTo, familyId, warehouseId
 */
const getInventoryReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, familyId, warehouseId } = req.query;

    // Build filters
    const articleFilter = {};
    if (familyId) articleFilter.family = familyId;

    const stockFilter = {};
    if (warehouseId) stockFilter.warehouse = warehouseId;

    // Get articles with stock units
    const articles = await Article.find(articleFilter)
      .populate('family', 'name code')
      .lean();

    const stockUnits = await StockUnit.find(stockFilter)
      .populate('article', 'name sku')
      .populate('warehouse', 'name code')
      .lean();

    // Aggregate by article
    const inventoryByArticle = articles.map(article => {
      const articleStock = stockUnits.filter(
        su => su.article && su.article._id.toString() === article._id.toString()
      );

      const totalQuantity = articleStock.reduce((sum, su) => sum + (su.quantity || 0), 0);
      const totalValue = articleStock.reduce((sum, su) => sum + (su.quantity * su.unitCost || 0), 0);

      return {
        article: {
          _id: article._id,
          sku: article.sku,
          name: article.name,
          family: article.family
        },
        totalQuantity,
        totalValue,
        stockUnits: articleStock.length
      };
    });

    // Aggregate by family
    const inventoryByFamily = {};
    articles.forEach(article => {
      const familyName = article.family?.name || 'Sin Familia';
      if (!inventoryByFamily[familyName]) {
        inventoryByFamily[familyName] = {
          articles: 0,
          totalQuantity: 0,
          totalValue: 0
        };
      }
      inventoryByFamily[familyName].articles += 1;
    });

    stockUnits.forEach(su => {
      const familyName = su.article?.family?.name || 'Sin Familia';
      if (inventoryByFamily[familyName]) {
        inventoryByFamily[familyName].totalQuantity += su.quantity || 0;
        inventoryByFamily[familyName].totalValue += (su.quantity * su.unitCost) || 0;
      }
    });

    // Aggregate by warehouse
    const inventoryByWarehouse = {};
    stockUnits.forEach(su => {
      const warehouseName = su.warehouse?.name || 'Sin Almacén';
      if (!inventoryByWarehouse[warehouseName]) {
        inventoryByWarehouse[warehouseName] = {
          stockUnits: 0,
          totalQuantity: 0,
          totalValue: 0
        };
      }
      inventoryByWarehouse[warehouseName].stockUnits += 1;
      inventoryByWarehouse[warehouseName].totalQuantity += su.quantity || 0;
      inventoryByWarehouse[warehouseName].totalValue += (su.quantity * su.unitCost) || 0;
    });

    // Summary
    const summary = {
      totalArticles: articles.length,
      totalStockUnits: stockUnits.length,
      totalQuantity: stockUnits.reduce((sum, su) => sum + (su.quantity || 0), 0),
      totalValue: stockUnits.reduce((sum, su) => sum + ((su.quantity * su.unitCost) || 0), 0)
    };

    res.json({
      success: true,
      data: {
        summary,
        byArticle: inventoryByArticle,
        byFamily: inventoryByFamily,
        byWarehouse: inventoryByWarehouse
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get movements report (delivery notes)
 * @route   GET /api/reports/movements
 * @access  Private
 * @query   dateFrom, dateTo, clientId, type
 */
const getMovementsReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, clientId, type } = req.query;

    // Build query
    const query = {};

    if (dateFrom || dateTo) {
      query.deliveryDate = {};
      if (dateFrom) query.deliveryDate.$gte = new Date(dateFrom);
      if (dateTo) query.deliveryDate.$lte = new Date(dateTo);
    }

    if (clientId) query.client = clientId;
    if (type) query.type = type;

    const deliveryNotes = await DeliveryNote.find(query)
      .populate('client', 'name code')
      .populate('items.article', 'name sku')
      .lean();

    // Aggregate by type
    const byType = deliveryNotes.reduce((acc, dn) => {
      const t = dn.type || 'unknown';
      if (!acc[t]) {
        acc[t] = { count: 0, items: 0, totalQuantity: 0 };
      }
      acc[t].count += 1;
      acc[t].items += dn.items.length;
      acc[t].totalQuantity += dn.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      return acc;
    }, {});

    // Aggregate by status
    const byStatus = deliveryNotes.reduce((acc, dn) => {
      const s = dn.status || 'unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    // Aggregate by client
    const byClient = {};
    deliveryNotes.forEach(dn => {
      const clientName = dn.client?.name || 'Sin Cliente';
      if (!byClient[clientName]) {
        byClient[clientName] = { count: 0, items: 0, totalQuantity: 0 };
      }
      byClient[clientName].count += 1;
      byClient[clientName].items += dn.items.length;
      byClient[clientName].totalQuantity += dn.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    });

    // Aggregate by month
    const byMonth = {};
    deliveryNotes.forEach(dn => {
      const date = new Date(dn.deliveryDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { count: 0, items: 0, totalQuantity: 0 };
      }
      byMonth[monthKey].count += 1;
      byMonth[monthKey].items += dn.items.length;
      byMonth[monthKey].totalQuantity += dn.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    });

    // Summary
    const summary = {
      totalDeliveryNotes: deliveryNotes.length,
      totalItems: deliveryNotes.reduce((sum, dn) => sum + dn.items.length, 0),
      totalQuantity: deliveryNotes.reduce((sum, dn) =>
        sum + dn.items.reduce((s, item) => s + (item.quantity || 0), 0), 0
      )
    };

    res.json({
      success: true,
      data: {
        summary,
        byType,
        byStatus,
        byClient,
        byMonth
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get deposits report
 * @route   GET /api/reports/deposits
 * @access  Private
 * @query   dateFrom, dateTo, clientId, status
 */
const getDepositsReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, clientId, status } = req.query;

    // Build query
    const query = {};

    if (dateFrom || dateTo) {
      query.receivedDate = {};
      if (dateFrom) query.receivedDate.$gte = new Date(dateFrom);
      if (dateTo) query.receivedDate.$lte = new Date(dateTo);
    }

    if (clientId) query.client = clientId;
    if (status) query.status = status;

    const deposits = await Deposit.find(query)
      .populate('client', 'name code')
      .populate('items.article', 'name sku')
      .lean();

    // Aggregate by status
    const byStatus = deposits.reduce((acc, dep) => {
      const s = dep.status || 'unknown';
      if (!acc[s]) {
        acc[s] = { count: 0, items: 0, totalValue: 0 };
      }
      acc[s].count += 1;
      acc[s].items += dep.items.length;
      acc[s].totalValue += dep.totalValue || 0;
      return acc;
    }, {});

    // Aggregate by client
    const byClient = {};
    deposits.forEach(dep => {
      const clientName = dep.client?.name || 'Sin Cliente';
      if (!byClient[clientName]) {
        byClient[clientName] = { count: 0, items: 0, totalValue: 0 };
      }
      byClient[clientName].count += 1;
      byClient[clientName].items += dep.items.length;
      byClient[clientName].totalValue += dep.totalValue || 0;
    });

    // Aggregate by alert level
    const now = new Date();
    const byAlertLevel = { none: 0, info: 0, warning: 0, critical: 0 };
    deposits.forEach(dep => {
      if (!dep.dueDate || !['active', 'partial'].includes(dep.status)) {
        byAlertLevel.none += 1;
        return;
      }

      const daysUntilDue = Math.ceil((new Date(dep.dueDate) - now) / (1000 * 60 * 60 * 24));

      if (daysUntilDue < 0) {
        byAlertLevel.critical += 1;
      } else if (daysUntilDue <= 7) {
        byAlertLevel.warning += 1;
      } else if (daysUntilDue <= 30) {
        byAlertLevel.info += 1;
      } else {
        byAlertLevel.none += 1;
      }
    });

    // Aggregate by warehouse
    const byWarehouse = {};
    deposits.forEach(dep => {
      const warehouse = dep.warehouse || 'Sin Almacén';
      if (!byWarehouse[warehouse]) {
        byWarehouse[warehouse] = { count: 0, items: 0, totalValue: 0 };
      }
      byWarehouse[warehouse].count += 1;
      byWarehouse[warehouse].items += dep.items.length;
      byWarehouse[warehouse].totalValue += dep.totalValue || 0;
    });

    // Summary
    const summary = {
      totalDeposits: deposits.length,
      totalItems: deposits.reduce((sum, dep) => sum + dep.items.length, 0),
      totalValue: deposits.reduce((sum, dep) => sum + (dep.totalValue || 0), 0)
    };

    res.json({
      success: true,
      data: {
        summary,
        byStatus,
        byClient,
        byAlertLevel,
        byWarehouse
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get financial report (invoices)
 * @route   GET /api/reports/financial
 * @access  Private
 * @query   dateFrom, dateTo, clientId, status
 */
const getFinancialReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, clientId, status } = req.query;

    // Build query
    const query = {};

    if (dateFrom || dateTo) {
      query.issueDate = {};
      if (dateFrom) query.issueDate.$gte = new Date(dateFrom);
      if (dateTo) query.issueDate.$lte = new Date(dateTo);
    }

    if (clientId) query.client = clientId;
    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .populate('client', 'name code')
      .lean();

    // Aggregate by status
    const byStatus = invoices.reduce((acc, inv) => {
      const s = inv.status || 'unknown';
      if (!acc[s]) {
        acc[s] = { count: 0, subtotal: 0, tax: 0, total: 0 };
      }
      acc[s].count += 1;
      acc[s].subtotal += inv.subtotal || 0;
      acc[s].tax += inv.tax || 0;
      acc[s].total += inv.total || 0;
      return acc;
    }, {});

    // Aggregate by client
    const byClient = {};
    invoices.forEach(inv => {
      const clientName = inv.client?.name || 'Sin Cliente';
      if (!byClient[clientName]) {
        byClient[clientName] = { count: 0, subtotal: 0, tax: 0, total: 0 };
      }
      byClient[clientName].count += 1;
      byClient[clientName].subtotal += inv.subtotal || 0;
      byClient[clientName].tax += inv.tax || 0;
      byClient[clientName].total += inv.total || 0;
    });

    // Aggregate by month
    const byMonth = {};
    invoices.forEach(inv => {
      const date = new Date(inv.issueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { count: 0, subtotal: 0, tax: 0, total: 0 };
      }
      byMonth[monthKey].count += 1;
      byMonth[monthKey].subtotal += inv.subtotal || 0;
      byMonth[monthKey].tax += inv.tax || 0;
      byMonth[monthKey].total += inv.total || 0;
    });

    // Aggregate by payment method
    const byPaymentMethod = {};
    invoices.forEach(inv => {
      const method = inv.paymentMethod || 'unknown';
      if (!byPaymentMethod[method]) {
        byPaymentMethod[method] = { count: 0, total: 0 };
      }
      byPaymentMethod[method].count += 1;
      byPaymentMethod[method].total += inv.total || 0;
    });

    // Calculate aging (overdue invoices)
    const now = new Date();
    const aging = {
      current: { count: 0, total: 0 },        // Not overdue
      days_1_30: { count: 0, total: 0 },      // 1-30 days overdue
      days_31_60: { count: 0, total: 0 },     // 31-60 days overdue
      days_61_90: { count: 0, total: 0 },     // 61-90 days overdue
      days_90_plus: { count: 0, total: 0 }    // 90+ days overdue
    };

    invoices.forEach(inv => {
      if (inv.status === 'paid' || inv.status === 'cancelled') return;

      if (!inv.dueDate) {
        aging.current.count += 1;
        aging.current.total += inv.total || 0;
        return;
      }

      const daysOverdue = Math.ceil((now - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));

      if (daysOverdue <= 0) {
        aging.current.count += 1;
        aging.current.total += inv.total || 0;
      } else if (daysOverdue <= 30) {
        aging.days_1_30.count += 1;
        aging.days_1_30.total += inv.total || 0;
      } else if (daysOverdue <= 60) {
        aging.days_31_60.count += 1;
        aging.days_31_60.total += inv.total || 0;
      } else if (daysOverdue <= 90) {
        aging.days_61_90.count += 1;
        aging.days_61_90.total += inv.total || 0;
      } else {
        aging.days_90_plus.count += 1;
        aging.days_90_plus.total += inv.total || 0;
      }
    });

    // Summary
    const summary = {
      totalInvoices: invoices.length,
      totalSubtotal: invoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0),
      totalTax: invoices.reduce((sum, inv) => sum + (inv.tax || 0), 0),
      totalAmount: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      totalPaid: invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total || 0), 0),
      totalPending: invoices
        .filter(inv => ['sent', 'overdue'].includes(inv.status))
        .reduce((sum, inv) => sum + (inv.total || 0), 0),
      totalOverdue: invoices
        .filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + (inv.total || 0), 0)
    };

    res.json({
      success: true,
      data: {
        summary,
        byStatus,
        byClient,
        byMonth,
        byPaymentMethod,
        aging
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get clients report
 * @route   GET /api/reports/clients
 * @access  Private
 */
const getClientsReport = async (req, res, next) => {
  try {
    const clients = await Client.find().lean();

    // Get activity counts for each client
    const clientActivity = await Promise.all(
      clients.map(async (client) => {
        const [deliveryNotes, deposits, invoices] = await Promise.all([
          DeliveryNote.countDocuments({ client: client._id }),
          Deposit.countDocuments({ client: client._id }),
          Invoice.countDocuments({ client: client._id })
        ]);

        const invoiceStats = await Invoice.aggregate([
          { $match: { client: client._id } },
          {
            $group: {
              _id: null,
              totalInvoiced: { $sum: '$total' },
              totalPaid: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'paid'] }, '$total', 0]
                }
              }
            }
          }
        ]);

        const stats = invoiceStats[0] || { totalInvoiced: 0, totalPaid: 0 };

        return {
          client: {
            _id: client._id,
            code: client.code,
            name: client.name,
            email: client.email,
            phone: client.phone
          },
          activity: {
            deliveryNotes,
            deposits,
            invoices
          },
          financial: {
            totalInvoiced: stats.totalInvoiced,
            totalPaid: stats.totalPaid,
            totalPending: stats.totalInvoiced - stats.totalPaid
          }
        };
      })
    );

    // Sort by total invoiced (top clients)
    const topClients = [...clientActivity]
      .sort((a, b) => b.financial.totalInvoiced - a.financial.totalInvoiced)
      .slice(0, 10);

    // Summary
    const summary = {
      totalClients: clients.length,
      activeClients: clientActivity.filter(ca =>
        ca.activity.deliveryNotes > 0 || ca.activity.deposits > 0 || ca.activity.invoices > 0
      ).length,
      inactiveClients: clientActivity.filter(ca =>
        ca.activity.deliveryNotes === 0 && ca.activity.deposits === 0 && ca.activity.invoices === 0
      ).length,
      totalInvoiced: clientActivity.reduce((sum, ca) => sum + ca.financial.totalInvoiced, 0),
      totalPaid: clientActivity.reduce((sum, ca) => sum + ca.financial.totalPaid, 0)
    };

    res.json({
      success: true,
      data: {
        summary,
        clients: clientActivity,
        topClients
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comprehensive dashboard report
 * @route   GET /api/reports/dashboard
 * @access  Private
 */
const getDashboardReport = async (req, res, next) => {
  try {
    // Get counts and aggregates in parallel
    const [
      articleCount,
      stockUnitsCount,
      clientCount,
      deliveryNoteCount,
      depositCount,
      invoiceCount,
      invoiceStats,
      depositStats
    ] = await Promise.all([
      Article.countDocuments(),
      StockUnit.countDocuments(),
      Client.countDocuments(),
      DeliveryNote.countDocuments(),
      Deposit.countDocuments(),
      Invoice.countDocuments(),
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$total' },
            totalPaid: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paid'] }, '$total', 0]
              }
            },
            totalPending: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['sent', 'overdue']] },
                  '$total',
                  0
                ]
              }
            }
          }
        }
      ]),
      Deposit.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$totalValue' }
          }
        }
      ])
    ]);

    const invoice = invoiceStats[0] || { totalAmount: 0, totalPaid: 0, totalPending: 0 };
    const deposit = depositStats[0] || { totalValue: 0 };

    res.json({
      success: true,
      data: {
        inventory: {
          totalArticles: articleCount,
          totalStockUnits: stockUnitsCount
        },
        clients: {
          totalClients: clientCount
        },
        operations: {
          totalDeliveryNotes: deliveryNoteCount,
          totalDeposits: depositCount,
          totalDepositValue: deposit.totalValue
        },
        financial: {
          totalInvoices: invoiceCount,
          totalInvoiced: invoice.totalAmount,
          totalPaid: invoice.totalPaid,
          totalPending: invoice.totalPending
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryReport,
  getMovementsReport,
  getDepositsReport,
  getFinancialReport,
  getClientsReport,
  getDashboardReport
};
