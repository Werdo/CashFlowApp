const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'viewer'],
    default: 'viewer'
  },
  company: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: Date,
    ip: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to record login
userSchema.methods.recordLogin = function(ip, userAgent) {
  this.lastLogin = new Date();
  this.loginHistory.push({
    timestamp: new Date(),
    ip,
    userAgent
  });

  // Keep only last 10 logins
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }

  return this.save();
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
