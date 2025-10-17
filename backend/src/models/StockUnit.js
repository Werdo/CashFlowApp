const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['entry', 'movement', 'exit', 'reservation', 'release'],
    required: true
  },
  from: {
    clientId: mongoose.Schema.Types.ObjectId,
    warehouseId: mongoose.Schema.Types.ObjectId,
    locationCode: String
  },
  to: {
    clientId: mongoose.Schema.Types.ObjectId,
    warehouseId: mongoose.Schema.Types.ObjectId,
    locationCode: String
  },
  deliveryNoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryNote'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, { _id: true });

const stockUnitSchema = new mongoose.Schema({
  traceabilityCode: {
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
  lotMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true
  },
  lotExpoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot'
  },
  deliveryNoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryNote'
  },
  currentLocation: {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    locationCode: {
      type: String,
      required: true
    }
  },
  dates: {
    received: {
      type: Date,
      default: Date.now
    },
    expiry: Date,
    lastMovement: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'shipped', 'expired', 'damaged'],
    default: 'available'
  },
  movements: [movementSchema],
  metadata: {
    serialNumber: String,
    batchInfo: mongoose.Schema.Types.Mixed,
    customFields: mongoose.Schema.Types.Mixed
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for performance
stockUnitSchema.index({ traceabilityCode: 1 });
stockUnitSchema.index({ articleId: 1 });
stockUnitSchema.index({ lotMasterId: 1 });
stockUnitSchema.index({ 'currentLocation.clientId': 1 });
stockUnitSchema.index({ 'currentLocation.warehouseId': 1 });
stockUnitSchema.index({ status: 1 });
stockUnitSchema.index({ 'dates.received': 1 });
stockUnitSchema.index({ 'dates.expiry': 1 });

// Virtual for stock age in days
stockUnitSchema.virtual('stockAge').get(function() {
  const today = new Date();
  const received = this.dates.received;
  const diffTime = Math.abs(today - received);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for days until expiry
stockUnitSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.dates.expiry) return null;
  const today = new Date();
  const diffTime = this.dates.expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to get stock age alert level
stockUnitSchema.methods.getStockAgeAlertLevel = function() {
  const age = this.stockAge;

  if (age < 60) return 'green';
  if (age < 90) return 'yellow';
  return 'red';
};

// Method to get expiry alert level
stockUnitSchema.methods.getExpiryAlertLevel = function() {
  if (!this.dates.expiry) return 'none';

  const days = this.daysUntilExpiry;

  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  return 'normal';
};

// Method to add movement
stockUnitSchema.methods.addMovement = function(movementData) {
  this.movements.push(movementData);
  this.dates.lastMovement = new Date();

  // Update location if it's a movement
  if (movementData.to && movementData.to.clientId) {
    this.currentLocation = movementData.to;
  }

  return this.save();
};

// Method to move to location
stockUnitSchema.methods.moveTo = function(clientId, warehouseId, locationCode, userId, notes) {
  const movement = {
    type: 'movement',
    from: { ...this.currentLocation },
    to: {
      clientId,
      warehouseId,
      locationCode
    },
    userId,
    notes
  };

  return this.addMovement(movement);
};

// Method to reserve
stockUnitSchema.methods.reserve = function(userId, notes) {
  if (this.status !== 'available') {
    throw new Error('Stock unit is not available for reservation');
  }

  this.status = 'reserved';

  const movement = {
    type: 'reservation',
    from: { ...this.currentLocation },
    to: { ...this.currentLocation },
    userId,
    notes
  };

  this.movements.push(movement);
  this.dates.lastMovement = new Date();

  return this.save();
};

// Method to release reservation
stockUnitSchema.methods.release = function(userId, notes) {
  if (this.status !== 'reserved') {
    throw new Error('Stock unit is not reserved');
  }

  this.status = 'available';

  const movement = {
    type: 'release',
    from: { ...this.currentLocation },
    to: { ...this.currentLocation },
    userId,
    notes
  };

  this.movements.push(movement);
  this.dates.lastMovement = new Date();

  return this.save();
};

// Method to ship
stockUnitSchema.methods.ship = function(userId, deliveryNoteId, notes) {
  this.status = 'shipped';

  const movement = {
    type: 'exit',
    from: { ...this.currentLocation },
    to: null,
    userId,
    deliveryNoteId,
    notes
  };

  this.movements.push(movement);
  this.dates.lastMovement = new Date();

  return this.save();
};

// Static method to get stock by location
stockUnitSchema.statics.getStockByLocation = function(clientId, warehouseId, locationCode) {
  const query = {
    'currentLocation.clientId': clientId,
    status: { $in: ['available', 'reserved'] }
  };

  if (warehouseId) query['currentLocation.warehouseId'] = warehouseId;
  if (locationCode) query['currentLocation.locationCode'] = locationCode;

  return this.find(query).populate('articleId').populate('lotMasterId');
};

// Static method to get aging report
stockUnitSchema.statics.getAgingReport = function(clientId) {
  const query = {
    status: { $in: ['available', 'reserved'] }
  };

  if (clientId) {
    query['currentLocation.clientId'] = clientId;
  }

  return this.aggregate([
    { $match: query },
    {
      $addFields: {
        stockAge: {
          $floor: {
            $divide: [
              { $subtract: [new Date(), '$dates.received'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    },
    {
      $bucket: {
        groupBy: '$stockAge',
        boundaries: [0, 30, 60, 90, 1000],
        default: '>90',
        output: {
          count: { $sum: 1 },
          articles: { $push: '$articleId' }
        }
      }
    }
  ]);
};

// Pre-save: Generate traceability code if not exists
stockUnitSchema.pre('save', async function(next) {
  if (this.isNew && !this.traceabilityCode) {
    // Generate unique traceability code
    const date = new Date();
    const year = date.getFullYear();
    const count = await mongoose.model('StockUnit').countDocuments();
    this.traceabilityCode = `TRZ-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save: Check expiry status
stockUnitSchema.pre('save', function(next) {
  if (this.dates.expiry && new Date() > this.dates.expiry && this.status === 'available') {
    this.status = 'expired';
  }
  next();
});

// Make virtuals visible in JSON
stockUnitSchema.set('toJSON', { virtuals: true });
stockUnitSchema.set('toObject', { virtuals: true });

const StockUnit = mongoose.model('StockUnit', stockUnitSchema);

module.exports = StockUnit;
