const mongoose = require('mongoose');

const lotSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['master', 'expo'],
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  remainingQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  manufacturingDate: Date,
  expiryDate: Date,
  status: {
    type: String,
    enum: ['active', 'expired', 'depleted', 'blocked'],
    default: 'active'
  },
  parentLotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    default: null
  },
  traceability: {
    origin: String,
    supplier: String,
    supplierRef: String,
    certifications: [String],
    customsDocuments: [String]
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
lotSchema.index({ code: 1 });
lotSchema.index({ articleId: 1 });
lotSchema.index({ type: 1, status: 1 });
lotSchema.index({ expiryDate: 1 });
lotSchema.index({ parentLotId: 1 });

// Virtual for stock units
lotSchema.virtual('stockUnits', {
  ref: 'StockUnit',
  localField: '_id',
  foreignField: 'lotMasterId'
});

// Method to check if expired
lotSchema.methods.isExpired = function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
};

// Method to check if about to expire (within 30 days)
lotSchema.methods.isAboutToExpire = function(daysThreshold = 30) {
  if (!this.expiryDate) return false;
  const today = new Date();
  const daysUntilExpiry = Math.ceil((this.expiryDate - today) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
};

// Method to get alert level based on expiry
lotSchema.methods.getExpiryAlertLevel = function() {
  if (!this.expiryDate) return 'none';

  const daysUntilExpiry = Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 7) return 'critical';
  if (daysUntilExpiry <= 30) return 'warning';
  return 'normal';
};

// Method to update remaining quantity
lotSchema.methods.updateRemainingQuantity = async function() {
  const StockUnit = mongoose.model('StockUnit');
  const activeUnits = await StockUnit.countDocuments({
    lotMasterId: this._id,
    status: { $in: ['available', 'reserved'] }
  });

  this.remainingQuantity = activeUnits;

  if (this.remainingQuantity === 0) {
    this.status = 'depleted';
  }

  return this.save();
};

// Static method to get expiring lots
lotSchema.statics.getExpiringLots = function(daysThreshold = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysThreshold);

  return this.find({
    expiryDate: {
      $gte: new Date(),
      $lte: futureDate
    },
    status: 'active'
  }).populate('articleId').sort({ expiryDate: 1 });
};

// Static method to get expired lots
lotSchema.statics.getExpiredLots = function() {
  return this.find({
    expiryDate: { $lt: new Date() },
    status: 'active'
  }).populate('articleId');
};

// Pre-save: Update status based on expiry
lotSchema.pre('save', function(next) {
  if (this.expiryDate && this.isExpired() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Pre-save: Initialize remaining quantity
lotSchema.pre('save', function(next) {
  if (this.isNew) {
    this.remainingQuantity = this.quantity;
  }
  next();
});

const Lot = mongoose.model('Lot', lotSchema);

module.exports = Lot;
