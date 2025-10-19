const mongoose = require('mongoose');

const familyAttributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'boolean', 'select', 'date'],
    default: 'text'
  },
  unit: String,
  required: {
    type: Boolean,
    default: false
  },
  options: [String], // For select type
  defaultValue: mongoose.Schema.Types.Mixed
}, { _id: false });

const familySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  parentFamilyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null
  },
  attributes: [familyAttributeSchema],
  active: {
    type: Boolean,
    default: true
  },

  // Campos de auditoría
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Index for parent-child queries
familySchema.index({ parentFamilyId: 1 });

// Virtual for sub-families
familySchema.virtual('subFamilies', {
  ref: 'Family',
  localField: '_id',
  foreignField: 'parentFamilyId'
});

// Method to get full hierarchy path
familySchema.methods.getHierarchyPath = async function() {
  const path = [this.name];
  let current = this;

  while (current.parentFamilyId) {
    current = await mongoose.model('Family').findById(current.parentFamilyId);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }

  return path.join(' > ');
};

const Family = mongoose.model('Family', familySchema);

module.exports = Family;
