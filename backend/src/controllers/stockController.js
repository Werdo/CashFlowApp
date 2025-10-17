const { StockUnit, Lot, Article } = require('../models');

async function getStock(req, res, next) {
  try {
    const { clientId, warehouseId, locationCode, articleId, status } = req.query;
    const query = {};

    if (clientId) query['currentLocation.clientId'] = clientId;
    if (warehouseId) query['currentLocation.warehouseId'] = warehouseId;
    if (locationCode) query['currentLocation.locationCode'] = locationCode;
    if (articleId) query.articleId = articleId;
    if (status) query.status = status;

    const stock = await StockUnit.find(query)
      .populate('articleId')
      .populate('lotMasterId')
      .populate('currentLocation.clientId', 'name code')
      .sort({ 'dates.received': -1 });

    res.json({ success: true, data: { stock } });
  } catch (error) {
    next(error);
  }
}

async function getStockUnit(req, res, next) {
  try {
    const unit = await StockUnit.findById(req.params.id)
      .populate('articleId')
      .populate('lotMasterId')
      .populate('currentLocation.clientId');

    if (!unit) return res.status(404).json({ success: false, message: 'Stock unit not found' });
    res.json({ success: true, data: { unit } });
  } catch (error) {
    next(error);
  }
}

async function createStockUnit(req, res, next) {
  try {
    const unit = new StockUnit(req.body);
    await unit.save();
    res.status(201).json({ success: true, message: 'Stock unit created', data: { unit } });
  } catch (error) {
    next(error);
  }
}

async function moveStockUnit(req, res, next) {
  try {
    const { clientId, warehouseId, locationCode, notes } = req.body;
    const unit = await StockUnit.findById(req.params.id);

    if (!unit) return res.status(404).json({ success: false, message: 'Stock unit not found' });

    await unit.moveTo(clientId, warehouseId, locationCode, req.userId, notes);
    res.json({ success: true, message: 'Stock unit moved', data: { unit } });
  } catch (error) {
    next(error);
  }
}

async function reserveStockUnit(req, res, next) {
  try {
    const { notes } = req.body;
    const unit = await StockUnit.findById(req.params.id);

    if (!unit) return res.status(404).json({ success: false, message: 'Stock unit not found' });

    await unit.reserve(req.userId, notes);
    res.json({ success: true, message: 'Stock unit reserved', data: { unit } });
  } catch (error) {
    next(error);
  }
}

async function getAgingReport(req, res, next) {
  try {
    const { clientId } = req.query;
    const report = await StockUnit.getAgingReport(clientId);
    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
}

// Lot endpoints
async function getLots(req, res, next) {
  try {
    const { articleId, type, status } = req.query;
    const query = {};

    if (articleId) query.articleId = articleId;
    if (type) query.type = type;
    if (status) query.status = status;

    const lots = await Lot.find(query).populate('articleId').sort({ createdAt: -1 });
    res.json({ success: true, data: { lots } });
  } catch (error) {
    next(error);
  }
}

async function createLot(req, res, next) {
  try {
    const lot = new Lot(req.body);
    await lot.save();
    res.status(201).json({ success: true, message: 'Lot created', data: { lot } });
  } catch (error) {
    next(error);
  }
}

async function getExpiringLots(req, res, next) {
  try {
    const { days = 30 } = req.query;
    const lots = await Lot.getExpiringLots(parseInt(days));
    res.json({ success: true, data: { lots } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStock,
  getStockUnit,
  createStockUnit,
  moveStockUnit,
  reserveStockUnit,
  getAgingReport,
  getLots,
  createLot,
  getExpiringLots
};
