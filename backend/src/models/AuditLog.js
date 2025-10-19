const mongoose = require('mongoose');

/**
 * AuditLog Model
 * Registra todas las acciones importantes del sistema para trazabilidad y cumplimiento
 */
const auditLogSchema = new mongoose.Schema({
  // Usuario que realizó la acción
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },

  // Acción realizada
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'password_reset', 'bulk_import', 'export', 'other']
  },

  // Entidad afectada
  entity: {
    type: String,
    required: true,
    enum: ['user', 'client', 'article', 'warehouse', 'stock', 'movement', 'deposit', 'invoice', 'settings', 'role', 'other']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // No required para acciones como login/logout
  },
  entityName: {
    type: String // Nombre legible de la entidad (ej: nombre del cliente)
  },

  // Cambios realizados (solo para update)
  changes: {
    before: {
      type: mongoose.Schema.Types.Mixed
    },
    after: {
      type: mongoose.Schema.Types.Mixed
    }
  },

  // Información adicional
  metadata: {
    ip: String,
    userAgent: String,
    method: String, // GET, POST, PUT, DELETE
    url: String,
    statusCode: Number,
    errorMessage: String
  },

  // Timestamp automático
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  // No usar timestamps automáticos de mongoose, usamos nuestro propio timestamp
  timestamps: false
});

// Índices para consultas rápidas
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // Para consultas cronológicas
auditLogSchema.index({ 'metadata.ip': 1 });

// TTL Index: Eliminar logs después de 2 años (cumplimiento GDPR)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 años en segundos

// Método estático para registrar una acción
auditLogSchema.statics.log = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    // No fallar la operación principal si el log falla
    console.error('Error saving audit log:', error);
    return null;
  }
};

// Método estático para obtener logs de un usuario
auditLogSchema.statics.getUserLogs = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('-changes'); // Excluir changes para mejor rendimiento
};

// Método estático para obtener logs de una entidad
auditLogSchema.statics.getEntityLogs = function(entity, entityId, limit = 50) {
  return this.find({ entity, entityId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

// Método estático para obtener logs por rango de fechas
auditLogSchema.statics.getLogsByDateRange = function(startDate, endDate, filters = {}) {
  const query = {
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    ...filters
  };

  return this.find(query)
    .sort({ timestamp: -1 })
    .populate('userId', 'name email');
};

// Método estático para obtener estadísticas de actividad
auditLogSchema.statics.getActivityStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          action: '$action',
          entity: '$entity'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
