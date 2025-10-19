const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Item total is required'],
    min: [0, 'Total cannot be negative']
  },
  type: {
    type: String,
    enum: ['storage', 'handling', 'transport', 'other'],
    default: 'other'
  },
  period: {
    from: {
      type: Date
    },
    to: {
      type: Date
    }
  },
  // Reference to related entities if applicable
  relatedDeposit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit'
  },
  relatedDeliveryNote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryNote'
  }
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  // Denormalized client data for performance and consistency
  clientName: {
    type: String,
    required: true
  },
  clientTaxId: {
    type: String
  },
  clientEmail: {
    type: String
  },
  clientAddress: {
    type: String
  },
  // Invoice items
  items: {
    type: [invoiceItemSchema],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Invoice must have at least one item'
    }
  },
  // Financial information
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 21, // IVA 21% by default
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  tax: {
    type: Number,
    required: [true, 'Tax amount is required'],
    min: [0, 'Tax cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  // Dates
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paidDate: {
    type: Date
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'draft',
    required: true
  },
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['transfer', 'cash', 'card', 'check', 'other'],
    default: 'transfer'
  },
  paymentReference: {
    type: String,
    trim: true
  },
  // Notes and additional info
  notes: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
  },
  // PDF generation
  pdfUrl: {
    type: String
  },
  pdfGeneratedAt: {
    type: Date
  },
  // Email tracking
  sentTo: [{
    email: String,
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'failed']
    }
  }],
  // Related documents
  relatedDeposits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit'
  }],
  relatedDeliveryNotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryNote'
  }],
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
invoiceSchema.index({ client: 1, issueDate: -1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ issueDate: -1 });

// Virtual: Days until due date
invoiceSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual: Is overdue
invoiceSchema.virtual('isOverdue').get(function() {
  if (this.status === 'paid' || this.status === 'cancelled' || this.status === 'refunded') {
    return false;
  }
  if (!this.dueDate) return false;
  return new Date() > new Date(this.dueDate);
});

// Virtual: Days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = now - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual: Payment status
invoiceSchema.virtual('paymentStatus').get(function() {
  if (this.status === 'paid') return 'paid';
  if (this.isOverdue) return 'overdue';
  if (this.status === 'sent') return 'pending';
  return this.status;
});

// Pre-save hook: Auto-generate invoice number if not provided
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    // Find the last invoice number for this year
    const lastInvoice = await this.constructor
      .findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
      .sort({ invoiceNumber: -1 })
      .select('invoiceNumber')
      .lean();

    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop());
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    this.invoiceNumber = `${prefix}${String(nextNumber).padStart(6, '0')}`;
  }
  next();
});

// Pre-save hook: Auto-update status to overdue if applicable
invoiceSchema.pre('save', function(next) {
  if (this.status === 'sent' && this.dueDate && new Date() > new Date(this.dueDate)) {
    this.status = 'overdue';
  }
  next();
});

// Pre-save hook: Validate financial calculations
invoiceSchema.pre('save', function(next) {
  // Calculate expected subtotal from items
  const calculatedSubtotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Allow small floating point differences
  const difference = Math.abs(calculatedSubtotal - this.subtotal);
  if (difference > 0.01) {
    return next(new Error(`Subtotal mismatch: items total ${calculatedSubtotal.toFixed(2)} but subtotal is ${this.subtotal.toFixed(2)}`));
  }

  // Validate tax calculation
  const calculatedTax = (this.subtotal - this.discount) * (this.taxRate / 100);
  const taxDifference = Math.abs(calculatedTax - this.tax);
  if (taxDifference > 0.01) {
    return next(new Error(`Tax calculation mismatch: expected ${calculatedTax.toFixed(2)} but got ${this.tax.toFixed(2)}`));
  }

  // Validate total
  const calculatedTotal = this.subtotal - this.discount + this.tax;
  const totalDifference = Math.abs(calculatedTotal - this.total);
  if (totalDifference > 0.01) {
    return next(new Error(`Total mismatch: expected ${calculatedTotal.toFixed(2)} but got ${this.total.toFixed(2)}`));
  }

  next();
});

// Pre-save hook: Set paidDate when status changes to paid
invoiceSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'paid' && !this.paidDate) {
    this.paidDate = new Date();
  }
  next();
});

// Static method: Get statistics
invoiceSchema.statics.getStats = async function(filters = {}) {
  const query = { ...filters };

  const [invoices, totals] = await Promise.all([
    this.find(query).lean(),
    this.aggregate([
      { $match: query },
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
          },
          totalOverdue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'overdue'] }, '$total', 0]
            }
          }
        }
      }
    ])
  ]);

  const byStatus = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});

  const stats = totals[0] || {
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0
  };

  return {
    total: invoices.length,
    byStatus,
    amounts: stats
  };
};

// Instance method: Mark as paid
invoiceSchema.methods.markAsPaid = function(paymentData = {}) {
  this.status = 'paid';
  this.paidDate = paymentData.paidDate || new Date();
  if (paymentData.paymentMethod) {
    this.paymentMethod = paymentData.paymentMethod;
  }
  if (paymentData.paymentReference) {
    this.paymentReference = paymentData.paymentReference;
  }
  return this.save();
};

// Instance method: Send invoice
invoiceSchema.methods.sendInvoice = function(emails = []) {
  if (this.status === 'draft') {
    this.status = 'sent';
  }

  const sentRecords = emails.map(email => ({
    email,
    sentAt: new Date(),
    status: 'sent'
  }));

  this.sentTo = [...(this.sentTo || []), ...sentRecords];
  return this.save();
};

// Instance method: Cancel invoice
invoiceSchema.methods.cancel = function(reason) {
  if (this.status === 'paid') {
    throw new Error('Cannot cancel a paid invoice. Use refund instead.');
  }
  this.status = 'cancelled';
  if (reason) {
    this.internalNotes = (this.internalNotes || '') + `\nCancelled: ${reason}`;
  }
  return this.save();
};

module.exports = mongoose.model('Invoice', invoiceSchema);
