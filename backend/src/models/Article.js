const mongoose = require('mongoose');

const articleImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  filename: String,
  size: Number
}, { _id: true });

const articleSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  ean: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  specifications: {
    brand: String,
    model: String,
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  pricing: {
    cost: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },
  images: [articleImageSchema],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      default: 'cm/kg'
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for faster queries
articleSchema.index({ sku: 1 });
articleSchema.index({ ean: 1 });
articleSchema.index({ familyId: 1 });
articleSchema.index({ name: 'text', description: 'text' });
articleSchema.index({ 'specifications.brand': 1 });

// Virtual for total stock
articleSchema.virtual('totalStock', {
  ref: 'StockUnit',
  localField: '_id',
  foreignField: 'articleId',
  count: true
});

// Method to get primary image
articleSchema.methods.getPrimaryImage = function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || (this.images.length > 0 ? this.images[0] : null);
};

// Method to set primary image
articleSchema.methods.setPrimaryImage = function(imageId) {
  this.images.forEach(img => {
    img.isPrimary = img._id.toString() === imageId.toString();
  });
  return this.save();
};

// Static method to search articles
articleSchema.statics.search = function(query) {
  const searchQuery = {};

  if (query.text) {
    searchQuery.$text = { $search: query.text };
  }

  if (query.sku) {
    searchQuery.sku = new RegExp(query.sku, 'i');
  }

  if (query.ean) {
    searchQuery.ean = query.ean;
  }

  if (query.familyId) {
    searchQuery.familyId = query.familyId;
  }

  if (query.brand) {
    searchQuery['specifications.brand'] = new RegExp(query.brand, 'i');
  }

  if (query.active !== undefined) {
    searchQuery.active = query.active;
  }

  return this.find(searchQuery).populate('familyId');
};

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
