const mongoose = require('mongoose');

const deliveryItemSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  stockUnits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockUnit'
  }],
  notes: String
}, { _id: true });

const deliveryNoteSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['entry', 'exit', 'transfer'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  items: [deliveryItemSchema],
  origin: {
    supplier: String,
    reference: String,
    address: String
  },
  destination: {
    clientId: mongoose.Schema.Types.ObjectId,
    warehouseId: mongoose.Schema.Types.ObjectId,
    address: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  document: {
    filename: String,
    url: String,
    uploadedAt: Date
  },
  totalUnits: {
    type: Number,
    default: 0
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Indexes
deliveryNoteSchema.index({ number: 1 });
deliveryNoteSchema.index({ type: 1, status: 1 });
deliveryNoteSchema.index({ clientId: 1 });
deliveryNoteSchema.index({ date: -1 });

// Calculate total units before saving
deliveryNoteSchema.pre('save', function(next) {
  this.totalUnits = this.items.reduce((sum, item) => sum + item.quantity, 0);
  next();
});

// Static method to generate next delivery note number
deliveryNoteSchema.statics.generateNextNumber = async function(type) {
  const year = new Date().getFullYear();
  const prefix = type === 'entry' ? 'ALB-E' : type === 'exit' ? 'ALB-S' : 'ALB-T';

  const lastNote = await this.findOne({
    number: new RegExp(`^${prefix}-${year}`)
  }).sort({ number: -1 });

  let nextNumber = 1;
  if (lastNote) {
    const match = lastNote.number.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(5, '0')}`;
};

// Method to complete processing
deliveryNoteSchema.methods.complete = function(userId) {
  this.status = 'completed';
  this.processedBy = userId;
  this.processedAt = new Date();
  return this.save();
};

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);

module.exports = DeliveryNote;
