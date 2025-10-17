const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  forecastDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  method: {
    type: String,
    enum: ['historical', 'manual', 'ai', 'trend'],
    default: 'manual'
  },
  basedOn: {
    historicalData: [{
      date: Date,
      quantity: Number
    }],
    factors: mongoose.Schema.Types.Mixed
  },
  actualQuantity: Number,
  variance: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
forecastSchema.index({ clientId: 1, forecastDate: 1 });
forecastSchema.index({ articleId: 1, forecastDate: 1 });
forecastSchema.index({ forecastDate: 1 });
forecastSchema.index({ status: 1 });

// Calculate variance when actual quantity is set
forecastSchema.pre('save', function(next) {
  if (this.actualQuantity !== undefined && this.actualQuantity !== null) {
    this.variance = this.actualQuantity - this.quantity;

    if (this.status === 'pending') {
      this.status = 'completed';
    }
  }
  next();
});

// Method to calculate accuracy
forecastSchema.methods.getAccuracy = function() {
  if (this.actualQuantity === null || this.actualQuantity === undefined) {
    return null;
  }

  if (this.quantity === 0) {
    return this.actualQuantity === 0 ? 100 : 0;
  }

  const accuracy = 100 - (Math.abs(this.variance) / this.quantity * 100);
  return Math.max(0, accuracy);
};

// Static method to get forecasts by period
forecastSchema.statics.getByPeriod = function(startDate, endDate, clientId) {
  const query = {
    forecastDate: {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (clientId) {
    query.clientId = clientId;
  }

  return this.find(query).populate('clientId').populate('articleId').sort({ forecastDate: 1 });
};

// Static method to get accuracy report
forecastSchema.statics.getAccuracyReport = async function(startDate, endDate, clientId) {
  const query = {
    forecastDate: {
      $gte: startDate,
      $lte: endDate
    },
    status: 'completed',
    actualQuantity: { $exists: true }
  };

  if (clientId) {
    query.clientId = clientId;
  }

  const forecasts = await this.find(query);

  let totalAccuracy = 0;
  let count = 0;

  forecasts.forEach(forecast => {
    const accuracy = forecast.getAccuracy();
    if (accuracy !== null) {
      totalAccuracy += accuracy;
      count++;
    }
  });

  return {
    averageAccuracy: count > 0 ? totalAccuracy / count : 0,
    totalForecasts: count,
    forecasts: forecasts
  };
};

const Forecast = mongoose.model('Forecast', forecastSchema);

module.exports = Forecast;
