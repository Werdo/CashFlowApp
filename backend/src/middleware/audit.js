const AuditLog = require('../models/AuditLog');

/**
 * Middleware de Auditoría
 * Automatiza el registro de acciones y la población de campos createdBy/updatedBy
 */

/**
 * Middleware para poblar automáticamente createdBy y updatedBy
 * Debe aplicarse ANTES de guardar el documento
 *
 * Uso en modelos:
 * schema.pre('save', auditFields);
 */
const auditFields = function(next) {
  // Solo si hay un usuario en el contexto (se debe pasar desde req)
  if (this.$locals && this.$locals.user) {
    const userId = this.$locals.user._id || this.$locals.user.userId;

    // Si es nuevo documento, establecer createdBy
    if (this.isNew) {
      this.createdBy = userId;
    }

    // Siempre establecer updatedBy
    this.updatedBy = userId;
  }

  next();
};

/**
 * Middleware para registrar automáticamente en AuditLog
 * Se ejecuta DESPUÉS de la operación
 *
 * @param {String} action - create, update, delete, etc.
 * @param {String} entity - user, client, article, etc.
 */
const logAction = (action, entity) => {
  return async function(doc) {
    try {
      // Obtener usuario del contexto local del documento
      const user = this.$locals?.user;

      if (!user) {
        console.warn('No user context for audit log');
        return;
      }

      const logData = {
        userId: user._id || user.userId,
        userName: user.name,
        userEmail: user.email,
        action,
        entity,
        entityId: doc._id,
        entityName: doc.name || doc.code || doc.sku || doc.email || 'Unknown',
        metadata: {
          method: this.$locals?.method || 'UNKNOWN',
          url: this.$locals?.url || '',
          ip: this.$locals?.ip || ''
        }
      };

      // Para updates, incluir cambios si están disponibles
      if (action === 'update' && this.$locals?.changes) {
        logData.changes = this.$locals.changes;
      }

      await AuditLog.log(logData);
    } catch (error) {
      // No fallar la operación principal si el log falla
      console.error('Error in audit log middleware:', error);
    }
  };
};

/**
 * Middleware Express para capturar información de la request
 * Debe aplicarse a nivel de rutas protegidas
 *
 * Uso:
 * router.post('/clients', authenticateToken, auditContext, createClient);
 */
const auditContext = (req, res, next) => {
  // Guardar información de la request en res.locals para usar en controladores
  res.locals.auditContext = {
    user: req.user,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    method: req.method,
    url: req.originalUrl
  };

  next();
};

/**
 * Helper para pasar contexto de auditoría a un documento de Mongoose
 * Usar en controladores antes de save()
 *
 * @param {Object} doc - Documento de Mongoose
 * @param {Object} auditContext - Contexto desde res.locals.auditContext
 */
const attachAuditContext = (doc, auditContext) => {
  if (!doc.$locals) {
    doc.$locals = {};
  }

  doc.$locals.user = auditContext.user;
  doc.$locals.ip = auditContext.ip;
  doc.$locals.userAgent = auditContext.userAgent;
  doc.$locals.method = auditContext.method;
  doc.$locals.url = auditContext.url;
};

/**
 * Helper para registrar manualmente en el audit log
 * Usar para operaciones complejas o bulk operations
 *
 * @param {Object} data - Datos del log
 * @param {Object} auditContext - Contexto desde res.locals.auditContext
 */
const manualLog = async (data, auditContext) => {
  try {
    const logData = {
      userId: auditContext.user._id || auditContext.user.userId,
      userName: auditContext.user.name,
      userEmail: auditContext.user.email,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId || null,
      entityName: data.entityName || null,
      changes: data.changes || null,
      metadata: {
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        method: auditContext.method,
        url: auditContext.url,
        statusCode: data.statusCode || 200,
        errorMessage: data.errorMessage || null
      }
    };

    await AuditLog.log(logData);
  } catch (error) {
    console.error('Error in manual audit log:', error);
  }
};

/**
 * Middleware para registrar login exitoso
 */
const logLogin = async (req, res, next) => {
  try {
    if (req.user) {
      await AuditLog.log({
        userId: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        action: 'login',
        entity: 'user',
        entityId: req.user._id,
        entityName: req.user.name,
        metadata: {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          method: req.method,
          url: req.originalUrl,
          statusCode: 200
        }
      });
    }
  } catch (error) {
    console.error('Error logging login:', error);
  }

  next();
};

/**
 * Middleware para registrar logout
 */
const logLogout = async (req, res, next) => {
  try {
    if (req.user) {
      await AuditLog.log({
        userId: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        action: 'logout',
        entity: 'user',
        entityId: req.user._id,
        entityName: req.user.name,
        metadata: {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          method: req.method,
          url: req.originalUrl,
          statusCode: 200
        }
      });
    }
  } catch (error) {
    console.error('Error logging logout:', error);
  }

  next();
};

/**
 * Helper para capturar cambios en updates
 * Usar antes de actualizar un documento
 *
 * @param {Object} doc - Documento original de Mongoose
 * @param {Object} updates - Cambios a aplicar
 * @returns {Object} - Objeto con before y after
 */
const captureChanges = (doc, updates) => {
  const changes = {
    before: {},
    after: {}
  };

  // Capturar solo los campos que van a cambiar
  Object.keys(updates).forEach(key => {
    if (key !== 'updatedBy' && key !== 'updatedAt') {
      changes.before[key] = doc[key];
      changes.after[key] = updates[key];
    }
  });

  return changes;
};

module.exports = {
  auditFields,
  logAction,
  auditContext,
  attachAuditContext,
  manualLog,
  logLogin,
  logLogout,
  captureChanges
};
