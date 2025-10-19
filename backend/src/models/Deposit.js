const mongoose = require('mongoose');

const depositItemSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  articleName: String,
  articleSKU: String,
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'units'
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  lotNumber: String,
  notes: String
}, { _id: true });

const depositSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  clientName: String, // Denormalized for quick access

  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client.warehouses'
  },
  warehouseName: String,

  location: String, // Location code within warehouse

  items: [depositItemSchema],

  status: {
    type: String,
    enum: ['active', 'invoiced', 'partial', 'closed', 'cancelled'],
    default: 'active'
  },

  receivedDate: {
    type: Date,
    default: Date.now
  },

  dueDate: Date, // When deposit expires/must be picked up

  totalValue: {
    type: Number,
    default: 0
  },

  notes: String,

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
depositSchema.index({ code: 1 });
depositSchema.index({ client: 1 });
depositSchema.index({ status: 1 });
depositSchema.index({ receivedDate: -1 });
depositSchema.index({ dueDate: 1 });
depositSchema.index({ 'items.article': 1 });

// Virtual: days until due
depositSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const diff = this.dueDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual: is overdue
depositSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate;
});

// Virtual: alert level
depositSchema.virtual('alertLevel').get(function() {
  const days = this.daysUntilDue;
  if (days === null) return 'none';
  if (days < 0) return 'critical'; // Overdue
  if (days <= 7) return 'warning'; // Less than a week
  if (days <= 30) return 'info'; // Less than a month
  return 'none';
});

// Method: Add item to deposit
depositSchema.methods.addItem = function(itemData) {
  this.items.push(itemData);
  this.calculateTotalValue();
  return this.save();
};

// Method: Remove item from deposit
depositSchema.methods.removeItem = function(itemId) {
  this.items.id(itemId).remove();
  this.calculateTotalValue();
  return this.save();
};

// Method: Calculate total value
depositSchema.methods.calculateTotalValue = function() {
  this.totalValue = this.items.reduce((sum, item) => {
    return sum + (item.value || 0);
  }, 0);
};

// Static: Get deposits by alert level
depositSchema.statics.getByAlertLevel = function(level) {
  const now = new Date();
  let daysThreshold;

  switch(level) {
    case 'critical':
      // Overdue
      return this.find({
        status: { $in: ['active', 'partial'] },
        dueDate: { $lt: now }
      });
    case 'warning':
      // Due in 7 days or less
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return this.find({
        status: { $in: ['active', 'partial'] },
        dueDate: { $gte: now, $lte: weekFromNow }
      });
    case 'info':
      // Due in 30 days or less
      const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return this.find({
        status: { $in: ['active', 'partial'] },
        dueDate: { $gte: now, $lte: monthFromNow }
      });
    default:
      return this.find({});
  }
};

// Static: Get deposits with specific article
depositSchema.statics.getByArticle = function(articleId) {
  return this.find({
    'items.article': articleId,
    status: { $in: ['active', 'partial'] }
  });
};

// Static: Check if article has active deposits
depositSchema.statics.hasActiveDeposits = async function(articleId) {
  const count = await this.countDocuments({
    'items.article': articleId,
    status: { $in: ['active', 'partial'] }
  });
  return count > 0;
};

// Pre-save: Auto-generate code if not provided
depositSchema.pre('save', async function(next) {
  if (!this.code) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      code: new RegExp(`^DEP-${year}-`)
    });
    this.code = `DEP-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Ensure virtuals are included in JSON
depositSchema.set('toJSON', { virtuals: true });
depositSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Deposit', depositSchema);
