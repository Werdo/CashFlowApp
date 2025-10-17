const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['estanteria', 'pasillo', 'zona', 'pallet', 'otro'],
    default: 'estanteria'
  },
  capacity: {
    type: Number,
    default: 0
  },
  currentStock: {
    type: Number,
    default: 0
  },
  metadata: {
    pasillo: String,
    rack: String,
    nivel: String
  }
}, { _id: true });

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['central', 'branch'],
    default: 'branch'
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    province: String,
    country: { type: String, default: 'España' }
  },
  locations: [locationSchema],
  active: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const clientSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['client', 'sub-client', 'sub-sub-client'],
    required: true
  },
  level: {
    type: Number,
    enum: [1, 2, 3],
    required: true
  },
  parentClientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null
  },
  contactInfo: {
    email: {
      type: String,
      lowercase: true
    },
    phone: String,
    mobile: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      province: String,
      country: { type: String, default: 'España' }
    }
  },
  warehouses: [warehouseSchema],
  fiscalInfo: {
    cif: String,
    legalName: String
  },
  active: {
    type: Boolean,
    default: true
  },
  notes: String
}, {
  timestamps: true
});

// Index for faster parent-child queries
clientSchema.index({ parentClientId: 1 });
clientSchema.index({ type: 1, level: 1 });

// Virtual for sub-clients
clientSchema.virtual('subClients', {
  ref: 'Client',
  localField: '_id',
  foreignField: 'parentClientId'
});

// Method to get full hierarchy path
clientSchema.methods.getHierarchyPath = async function() {
  const path = [this.name];
  let current = this;

  while (current.parentClientId) {
    current = await mongoose.model('Client').findById(current.parentClientId);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }

  return path.join(' > ');
};

// Method to get all descendants
clientSchema.methods.getAllDescendants = async function() {
  const descendants = [];
  const Client = mongoose.model('Client');

  const findChildren = async (parentId) => {
    const children = await Client.find({ parentClientId: parentId });
    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };

  await findChildren(this._id);
  return descendants;
};

// Static method to get root clients
clientSchema.statics.getRootClients = function() {
  return this.find({ level: 1, parentClientId: null, active: true });
};

// Static method to get client tree
clientSchema.statics.getClientTree = async function() {
  const rootClients = await this.getRootClients();
  const tree = [];

  for (const client of rootClients) {
    const node = client.toObject();
    node.children = await buildTree(client._id);
    tree.push(node);
  }

  async function buildTree(parentId) {
    const children = await mongoose.model('Client').find({ parentClientId: parentId, active: true });
    const result = [];

    for (const child of children) {
      const node = child.toObject();
      node.children = await buildTree(child._id);
      result.push(node);
    }

    return result;
  }

  return tree;
};

// Validation: Check level consistency with parent
clientSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('parentClientId')) {
    if (this.parentClientId) {
      const parent = await mongoose.model('Client').findById(this.parentClientId);
      if (!parent) {
        return next(new Error('Parent client not found'));
      }

      // Verify level consistency
      if (this.level !== parent.level + 1) {
        return next(new Error(`Invalid level. Must be ${parent.level + 1} for this parent`));
      }

      // Verify type consistency
      const typeMap = {
        1: 'client',
        2: 'sub-client',
        3: 'sub-sub-client'
      };

      if (this.type !== typeMap[this.level]) {
        this.type = typeMap[this.level];
      }
    } else if (this.level !== 1) {
      return next(new Error('Root clients must be level 1'));
    }
  }

  next();
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
