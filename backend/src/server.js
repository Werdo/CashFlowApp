// backend/src/server.js - CashFlow v3.0
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/cashflow')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  stripeCustomerId: { type: String, default: null },
  revolutCustomerId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['active', 'inactive', 'past_due', 'canceled', 'trial'],
    default: 'trial'
  },
  plan: {
    type: String,
    enum: ['free', 'monthly', 'yearly'],
    default: 'free'
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'revolut', 'manual'],
    default: null
  },
  stripeSubscriptionId: { type: String, default: null },
  revolutSubscriptionId: { type: String, default: null },
  currentPeriodStart: { type: Date, default: null },
  currentPeriodEnd: { type: Date, default: null },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  unpaidSince: { type: Date, default: null }, // For tracking 90-day restriction
  isReadOnly: { type: Boolean, default: false }, // Read-only mode for unpaid users
  trialEnd: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

subscriptionSchema.index({ userId: 1 }, { unique: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'revolut'],
    required: true
  },
  paymentIntentId: { type: String, default: null }, // Stripe/Revolut payment ID
  invoiceId: { type: String, default: null },
  paymentMethod: { type: String, default: null }, // card, bank_transfer, etc
  failureReason: { type: String, default: null },
  paidAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// BillingConfig Schema - Stores API keys and configuration
const billingConfigSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['stripe', 'revolut', 'system'],
    required: true,
    unique: true
  },
  isEnabled: { type: Boolean, default: false },
  config: {
    // Stripe configuration
    publishableKey: { type: String, default: '' },
    secretKey: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },

    // Revolut configuration
    apiKey: { type: String, default: '' },
    merchantPublicKey: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },
    sandboxMode: { type: Boolean, default: true },

    // System configuration
    trialDays: { type: Number, default: 30 },
    gracePeriodDays: { type: Number, default: 90 },
    monthlyPrice: { type: Number, default: 9.99 },
    yearlyPrice: { type: Number, default: 99.99 },
    currency: { type: String, default: 'EUR' }
  },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

const BillingConfig = mongoose.model('BillingConfig', billingConfigSchema);

// CashFlow Data Schema
const cashflowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true, default: 2025 },
  months: [{
    name: String,
    days: Number,
    weeks: [{
      weekNumber: Number,
      days: [{
        dayNumber: Number,
        isValid: Boolean,
        ingresos: {
          fijos: [{
            id: String,
            description: String,
            amount: Number,
            date: String,
            checked: Boolean,
            notes: String,
            tags: [String]
          }],
          variables: [{
            id: String,
            description: String,
            amount: Number,
            date: String,
            checked: Boolean,
            notes: String,
            tags: [String]
          }]
        },
        gastos: {
          fijos: [{
            id: String,
            description: String,
            amount: Number,
            date: String,
            checked: Boolean,
            notes: String,
            tags: [String]
          }],
          variables: [{
            id: String,
            description: String,
            amount: Number,
            date: String,
            checked: Boolean,
            notes: String,
            tags: [String]
          }]
        }
      }]
    }]
  }],
  lastModified: { type: Date, default: Date.now }
});

const CashFlow = mongoose.model('CashFlow', cashflowSchema);

// Year Schema - for managing configured years
const yearSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  name: { type: String, default: '' }, // Optional custom name
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure unique year per user
yearSchema.index({ userId: 1, year: 1 }, { unique: true });

const Year = mongoose.model('Year', yearSchema);

// Category/Hashtag Schema
const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['hashtag', 'group'], default: 'hashtag' },
  color: { type: String, default: '#6c5dd3' },
  parentGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  recurrence: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'monthly' },
    amount: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

// Alert Schema
const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['expense_limit', 'income_reminder', 'due_date'], required: true },
  category: { type: String, enum: ['income', 'expense'], required: true },
  threshold: { type: Number, default: 0 },
  hashtag: { type: String, default: '' },
  group: { type: String, default: '' },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly' },
  isActive: { type: Boolean, default: true },
  notifications: [{
    date: { type: Date },
    message: { type: String },
    read: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Alert = mongoose.model('Alert', alertSchema);

// Document Schema
const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  fileData: { type: String, required: true }, // base64
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);

// ==================== MIDDLEWARE ====================

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'cashflow-secret-key-2025', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Subscription Check Middleware
const checkSubscription = async (req, res, next) => {
  try {
    // Skip subscription check for admins
    if (req.user.role === 'admin') {
      return next();
    }

    const subscription = await Subscription.findOne({ userId: req.user.userId });

    if (!subscription) {
      return res.status(403).json({
        error: 'No subscription found',
        code: 'NO_SUBSCRIPTION'
      });
    }

    // Check if subscription is read-only (90-day unpaid grace period)
    if (subscription.isReadOnly) {
      // Allow GET requests (read-only)
      if (req.method === 'GET') {
        req.subscription = subscription;
        return next();
      }
      // Block POST, PUT, DELETE (write operations)
      return res.status(403).json({
        error: 'Su cuenta está en modo solo lectura debido a impago. Tiene 90 días para regularizar su situación.',
        code: 'READ_ONLY_MODE',
        unpaidSince: subscription.unpaidSince,
        daysRemaining: subscription.unpaidSince ? Math.max(0, 90 - Math.floor((Date.now() - subscription.unpaidSince) / (1000 * 60 * 60 * 24))) : 0
      });
    }

    // Check if subscription is active or in trial
    if (!['active', 'trial'].includes(subscription.status)) {
      return res.status(403).json({
        error: 'Suscripción inactiva',
        code: 'INACTIVE_SUBSCRIPTION',
        status: subscription.status
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: 'Error al verificar suscripción' });
  }
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    await user.save();

    const initialCashflow = {
      userId: user._id,
      year: 2025,
      months: []
    };

    const cashflow = new CashFlow(initialCashflow);
    await cashflow.save();

    // Create initial year
    const initialYear = new Year({
      userId: user._id,
      year: 2025,
      isActive: true
    });
    await initialYear.save();

    // Create initial subscription (30-day trial)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.now + 30);

    const subscription = new Subscription({
      userId: user._id,
      status: 'trial',
      plan: 'free',
      trialEnd: trialEndDate,
      isReadOnly: false
    });
    await subscription.save();

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: user._id
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'cashflow-secret-key-2025',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// ==================== CASHFLOW ROUTES ====================

// Get cashflow data
app.get('/api/cashflow', authenticateToken, async (req, res) => {
  try {
    const { year = 2025 } = req.query;

    let cashflow = await CashFlow.findOne({
      userId: req.user.userId,
      year: parseInt(year)
    });

    if (!cashflow) {
      cashflow = new CashFlow({
        userId: req.user.userId,
        year: parseInt(year),
        months: []
      });
      await cashflow.save();
    }

    res.json(cashflow);
  } catch (error) {
    console.error('Error al obtener cashflow:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Save/Update cashflow data
app.post('/api/cashflow', authenticateToken, async (req, res) => {
  try {
    const { year = 2025, months } = req.body;

    let cashflow = await CashFlow.findOne({
      userId: req.user.userId,
      year: parseInt(year)
    });

    if (cashflow) {
      cashflow.months = months;
      cashflow.lastModified = new Date();
      await cashflow.save();
    } else {
      cashflow = new CashFlow({
        userId: req.user.userId,
        year: parseInt(year),
        months: months
      });
      await cashflow.save();
    }

    res.json({
      message: 'Datos guardados exitosamente',
      cashflow
    });
  } catch (error) {
    console.error('Error al guardar cashflow:', error);
    res.status(500).json({ error: 'Error al guardar datos' });
  }
});

// Import/Export routes
app.post('/api/cashflow/import', authenticateToken, async (req, res) => {
  try {
    const { year = 2025, months } = req.body;

    if (!months || !Array.isArray(months)) {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }

    await CashFlow.deleteOne({
      userId: req.user.userId,
      year: parseInt(year)
    });

    const cashflow = new CashFlow({
      userId: req.user.userId,
      year: parseInt(year),
      months: months
    });

    await cashflow.save();

    res.json({
      message: 'Datos importados exitosamente',
      cashflow
    });
  } catch (error) {
    console.error('Error al importar cashflow:', error);
    res.status(500).json({ error: 'Error al importar datos' });
  }
});

app.get('/api/cashflow/export', authenticateToken, async (req, res) => {
  try {
    const { year = 2025 } = req.query;

    const cashflow = await CashFlow.findOne({
      userId: req.user.userId,
      year: parseInt(year)
    });

    if (!cashflow) {
      return res.status(404).json({ error: 'No hay datos para exportar' });
    }

    res.json({
      year: cashflow.year,
      months: cashflow.months,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al exportar cashflow:', error);
    res.status(500).json({ error: 'Error al exportar datos' });
  }
});

app.delete('/api/cashflow/:year', authenticateToken, async (req, res) => {
  try {
    const { year } = req.params;

    await CashFlow.deleteOne({
      userId: req.user.userId,
      year: parseInt(year)
    });

    res.json({ message: 'Datos eliminados exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cashflow:', error);
    res.status(500).json({ error: 'Error al eliminar datos' });
  }
});

// ==================== YEAR ROUTES ====================

// Get all years for user
app.get('/api/years', authenticateToken, async (req, res) => {
  try {
    const years = await Year.find({ userId: req.user.userId })
      .sort({ year: -1 });
    res.json(years);
  } catch (error) {
    console.error('Error al obtener años:', error);
    res.status(500).json({ error: 'Error al obtener años' });
  }
});

// Create new year
app.post('/api/years', authenticateToken, async (req, res) => {
  try {
    const { year, name } = req.body;

    if (!year) {
      return res.status(400).json({ error: 'El año es requerido' });
    }

    // Check if year already exists
    const existingYear = await Year.findOne({
      userId: req.user.userId,
      year: parseInt(year)
    });

    if (existingYear) {
      return res.status(400).json({ error: 'Este año ya está configurado' });
    }

    const newYear = new Year({
      userId: req.user.userId,
      year: parseInt(year),
      name: name || '',
      isActive: true
    });

    await newYear.save();

    // Also create empty cashflow data for this year
    const cashflow = new CashFlow({
      userId: req.user.userId,
      year: parseInt(year),
      months: []
    });
    await cashflow.save();

    res.status(201).json({
      message: 'Año creado exitosamente',
      year: newYear
    });
  } catch (error) {
    console.error('Error al crear año:', error);
    res.status(500).json({ error: 'Error al crear año' });
  }
});

// Delete year
app.delete('/api/years/:year', authenticateToken, async (req, res) => {
  try {
    const { year } = req.params;

    // Delete year configuration
    await Year.deleteOne({
      userId: req.user.userId,
      year: parseInt(year)
    });

    // Also delete cashflow data
    await CashFlow.deleteOne({
      userId: req.user.userId,
      year: parseInt(year)
    });

    res.json({ message: 'Año eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar año:', error);
    res.status(500).json({ error: 'Error al eliminar año' });
  }
});

// ==================== CATEGORY/HASHTAG ROUTES ====================

// Get all categories/hashtags
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.userId })
      .populate('parentGroup', 'name color')
      .sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Create category/hashtag
app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { name, type, color, parentGroup, recurrence } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const category = new Category({
      userId: req.user.userId,
      name,
      type: type || 'hashtag',
      color: color || '#6c5dd3',
      parentGroup: parentGroup || null,
      recurrence: recurrence || { enabled: false }
    });

    await category.save();

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// Update category/hashtag
app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, color, parentGroup, recurrence } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name, type, color, parentGroup, recurrence },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({
      message: 'Categoría actualizada exitosamente',
      category
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// Delete category/hashtag
app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOneAndDelete({
      _id: id,
      userId: req.user.userId
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// ==================== ALERT ROUTES ====================

// Get all alerts
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

// Create alert
app.post('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const { name, type, category, threshold, hashtag, group, frequency } = req.body;

    if (!name || !type || !category) {
      return res.status(400).json({ error: 'Nombre, tipo y categoría son requeridos' });
    }

    const alert = new Alert({
      userId: req.user.userId,
      name,
      type,
      category,
      threshold: threshold || 0,
      hashtag: hashtag || '',
      group: group || '',
      frequency: frequency || 'monthly',
      isActive: true
    });

    await alert.save();

    res.status(201).json({
      message: 'Alerta creada exitosamente',
      alert
    });
  } catch (error) {
    console.error('Error al crear alerta:', error);
    res.status(500).json({ error: 'Error al crear alerta' });
  }
});

// Update alert
app.put('/api/alerts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, category, threshold, hashtag, group, frequency, isActive } = req.body;

    const alert = await Alert.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name, type, category, threshold, hashtag, group, frequency, isActive },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    res.json({
      message: 'Alerta actualizada exitosamente',
      alert
    });
  } catch (error) {
    console.error('Error al actualizar alerta:', error);
    res.status(500).json({ error: 'Error al actualizar alerta' });
  }
});

// Delete alert
app.delete('/api/alerts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findOneAndDelete({
      _id: id,
      userId: req.user.userId
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    res.json({ message: 'Alerta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar alerta:', error);
    res.status(500).json({ error: 'Error al eliminar alerta' });
  }
});

// Mark notification as read
app.put('/api/alerts/:id/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { id, notificationId } = req.params;

    const alert = await Alert.findOne({ _id: id, userId: req.user.userId });

    if (!alert) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    const notification = alert.notifications.id(notificationId);
    if (notification) {
      notification.read = true;
      await alert.save();
    }

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
});

// ==================== REPORTS ROUTES ====================

// Generate report based on period
app.post('/api/reports/generate', authenticateToken, async (req, res) => {
  try {
    const { period, year, startDate, endDate, quarter, month, week } = req.body;

    // TODO: Implement actual report generation logic based on cashflow data
    // This would analyze transactions within the specified period
    const mockReport = {
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        totalIncome: 4700,
        totalExpense: 1845.50,
        balance: 2854.50,
        transactionCount: 15
      },
      breakdown: {
        incomeByCategory: [
          { category: 'Ingresos Fijos', amount: 3500 },
          { category: 'Ingresos Variables', amount: 1200 }
        ],
        expenseByCategory: [
          { category: 'Gastos Fijos', amount: 900 },
          { category: 'Gastos Variables', amount: 945.50 }
        ]
      },
      comparison: period !== 'custom' ? {
        previousPeriod: {
          totalIncome: 4200,
          totalExpense: 1950,
          balance: 2250
        },
        change: {
          income: '+11.9%',
          expense: '-5.4%',
          balance: '+26.9%'
        }
      } : null
    };

    res.json(mockReport);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

// ==================== DOCUMENTS ROUTES ====================

app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId })
      .select('-fileData')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

app.post('/api/documents', authenticateToken, async (req, res) => {
  try {
    const { name, description, fileData, fileType, fileSize } = req.body;

    const document = new Document({
      userId: req.user.userId,
      name,
      description: description || '',
      fileData,
      fileType,
      fileSize
    });

    await document.save();

    const { fileData: _, ...documentWithoutData } = document.toObject();
    res.status(201).json({ message: 'Documento subido exitosamente', document: documentWithoutData });
  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ error: 'Error al subir documento' });
  }
});

app.get('/api/documents/:id/download', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json({ fileData: document.fileData, fileType: document.fileType, name: document.name });
  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({ error: 'Error al descargar documento' });
  }
});

app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
});

// ==================== CHATGPT ROUTES (v3.0) ====================

// ChatGPT routes
const chatgptRoutes = require('./routes/chatgpt.routes');
app.use('/api/chatgpt', chatgptRoutes);

// ==================== BILLING & SUBSCRIPTION ROUTES ====================

// Get user subscription
app.get('/api/billing/subscription', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.userId });
    if (!subscription) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ error: 'Error al obtener suscripción' });
  }
});

// Get payment history
app.get('/api/billing/payments', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId })
      .populate('subscriptionId')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({ error: 'Error al obtener historial de pagos' });
  }
});

// Create Stripe checkout session
app.post('/api/billing/stripe/create-checkout', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'

    // Get or create Stripe customer
    const user = await User.findById(req.user.userId);
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // TODO: Create Stripe customer via Stripe API
      // const customer = await stripe.customers.create({ email: user.email });
      // customerId = customer.id;
      // user.stripeCustomerId = customerId;
      // await user.save();
      customerId = 'cus_mock_' + Date.now(); // Mock for now
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // TODO: Create Stripe checkout session via Stripe API
    // const session = await stripe.checkout.sessions.create({...});

    // Mock response
    const mockSession = {
      id: 'cs_mock_' + Date.now(),
      url: `https://checkout.stripe.com/pay/cs_mock_${Date.now()}`,
      customer: customerId
    };

    res.json({ sessionId: mockSession.id, url: mockSession.url });
  } catch (error) {
    console.error('Error creating Stripe checkout:', error);
    res.status(500).json({ error: 'Error al crear sesión de pago' });
  }
});

// Create Revolut payment
app.post('/api/billing/revolut/create-payment', authenticateToken, async (req, res) => {
  try {
    const { plan, amount } = req.body;

    // Get or create Revolut customer
    const user = await User.findById(req.user.userId);
    let customerId = user.revolutCustomerId;

    if (!customerId) {
      // TODO: Create Revolut customer via Revolut API
      customerId = 'rev_mock_' + Date.now(); // Mock for now
      user.revolutCustomerId = customerId;
      await user.save();
    }

    // TODO: Create Revolut payment via Revolut API

    // Mock response
    const mockPayment = {
      id: 'rev_pay_' + Date.now(),
      public_id: 'rev_public_' + Date.now(),
      checkout_url: `https://checkout.revolut.com/${Date.now()}`
    };

    res.json({ paymentId: mockPayment.id, url: mockPayment.checkout_url });
  } catch (error) {
    console.error('Error creating Revolut payment:', error);
    res.status(500).json({ error: 'Error al crear pago Revolut' });
  }
});

// Stripe webhook
app.post('/api/billing/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // TODO: Verify Stripe webhook signature
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    const event = req.body; // Mock for now

    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful checkout
        await handleStripeCheckoutSuccess(event.data.object);
        break;
      case 'invoice.payment_failed':
        // Handle payment failure
        await handleStripePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        await handleStripeSubscriptionDeleted(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Revolut webhook
app.post('/api/billing/revolut/webhook', express.json(), async (req, res) => {
  try {
    // TODO: Verify Revolut webhook signature

    const event = req.body;

    switch (event.event) {
      case 'ORDER_COMPLETED':
        // Handle successful payment
        await handleRevolutPaymentSuccess(event.order);
        break;
      case 'ORDER_PAYMENT_FAILED':
        // Handle payment failure
        await handleRevolutPaymentFailed(event.order);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Revolut webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Cancel subscription
app.post('/api/billing/subscription/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.userId });

    if (!subscription) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }

    // TODO: Cancel subscription in Stripe/Revolut
    // if (subscription.stripeSubscriptionId) {
    //   await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    //     cancel_at_period_end: true
    //   });
    // }

    subscription.cancelAtPeriodEnd = true;
    subscription.status = 'canceled';
    subscription.updatedAt = new Date();
    await subscription.save();

    res.json({ message: 'Suscripción cancelada exitosamente', subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
});

// Webhook handler helpers
async function handleStripeCheckoutSuccess(session) {
  // Find user by customer ID
  const user = await User.findOne({ stripeCustomerId: session.customer });
  if (!user) return;

  // Update subscription
  const subscription = await Subscription.findOne({ userId: user._id });
  subscription.status = 'active';
  subscription.stripeSubscriptionId = session.subscription;
  subscription.paymentProvider = 'stripe';
  subscription.currentPeriodStart = new Date();
  subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  subscription.isReadOnly = false;
  subscription.unpaidSince = null;
  subscription.updatedAt = new Date();
  await subscription.save();

  // Create payment record
  const payment = new Payment({
    userId: user._id,
    subscriptionId: subscription._id,
    amount: session.amount_total / 100,
    currency: session.currency.toUpperCase(),
    status: 'succeeded',
    paymentProvider: 'stripe',
    paymentIntentId: session.payment_intent,
    paidAt: new Date()
  });
  await payment.save();
}

async function handleStripePaymentFailed(invoice) {
  const user = await User.findOne({ stripeCustomerId: invoice.customer });
  if (!user) return;

  const subscription = await Subscription.findOne({ userId: user._id });
  subscription.status = 'past_due';
  subscription.updatedAt = new Date();

  // Start 90-day grace period
  if (!subscription.unpaidSince) {
    subscription.unpaidSince = new Date();
    subscription.isReadOnly = true;
  }

  await subscription.save();

  // Create failed payment record
  const payment = new Payment({
    userId: user._id,
    subscriptionId: subscription._id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency.toUpperCase(),
    status: 'failed',
    paymentProvider: 'stripe',
    paymentIntentId: invoice.payment_intent,
    failureReason: 'Payment failed'
  });
  await payment.save();
}

async function handleStripeSubscriptionDeleted(subscription) {
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  if (!user) return;

  const userSubscription = await Subscription.findOne({ userId: user._id });
  userSubscription.status = 'canceled';
  userSubscription.stripeSubscriptionId = null;
  userSubscription.updatedAt = new Date();
  await userSubscription.save();
}

async function handleRevolutPaymentSuccess(order) {
  // Similar to Stripe success handler
  const user = await User.findOne({ revolutCustomerId: order.customer_id });
  if (!user) return;

  const subscription = await Subscription.findOne({ userId: user._id });
  subscription.status = 'active';
  subscription.revolutSubscriptionId = order.id;
  subscription.paymentProvider = 'revolut';
  subscription.currentPeriodStart = new Date();
  subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  subscription.isReadOnly = false;
  subscription.unpaidSince = null;
  subscription.updatedAt = new Date();
  await subscription.save();

  const payment = new Payment({
    userId: user._id,
    subscriptionId: subscription._id,
    amount: order.order_amount.value / 100,
    currency: order.order_amount.currency,
    status: 'succeeded',
    paymentProvider: 'revolut',
    paymentIntentId: order.id,
    paidAt: new Date()
  });
  await payment.save();
}

async function handleRevolutPaymentFailed(order) {
  const user = await User.findOne({ revolutCustomerId: order.customer_id });
  if (!user) return;

  const subscription = await Subscription.findOne({ userId: user._id });
  subscription.status = 'past_due';
  subscription.updatedAt = new Date();

  if (!subscription.unpaidSince) {
    subscription.unpaidSince = new Date();
    subscription.isReadOnly = true;
  }

  await subscription.save();
}

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Admin: Get all subscriptions
app.get('/api/admin/billing/subscriptions', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const subscriptions = await Subscription.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({ error: 'Error al obtener suscripciones' });
  }
});

// Admin: Get all payments
app.get('/api/admin/billing/payments', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('subscriptionId')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// Admin: Get billing stats
app.get('/api/admin/billing/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const trialSubscriptions = await Subscription.countDocuments({ status: 'trial' });
    const pastDueSubscriptions = await Subscription.countDocuments({ status: 'past_due' });
    const readOnlyAccounts = await Subscription.countDocuments({ isReadOnly: true });

    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'succeeded' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });

    // Calculate revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthRevenueResult = await Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthRevenue = monthRevenueResult.length > 0 ? monthRevenueResult[0].total : 0;

    res.json({
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        trial: trialSubscriptions,
        pastDue: pastDueSubscriptions,
        readOnly: readOnlyAccounts
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        failed: failedPayments
      },
      revenue: {
        total: totalRevenue,
        thisMonth: monthRevenue
      }
    });
  } catch (error) {
    console.error('Error getting billing stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Admin: Update user subscription
app.put('/api/admin/billing/subscriptions/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { userId } = req.params;
    const { status, plan, isReadOnly } = req.body;

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }

    if (status) subscription.status = status;
    if (plan) subscription.plan = plan;
    if (typeof isReadOnly !== 'undefined') subscription.isReadOnly = isReadOnly;

    // Reset unpaidSince if activating
    if (status === 'active') {
      subscription.unpaidSince = null;
      subscription.isReadOnly = false;
    }

    subscription.updatedAt = new Date();
    await subscription.save();

    res.json({ message: 'Suscripción actualizada', subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Error al actualizar suscripción' });
  }
});

// Admin: Force payment for user (manual payment)
app.post('/api/admin/billing/manual-payment', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { userId, amount, currency, notes } = req.body;

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }

    // Activate subscription
    subscription.status = 'active';
    subscription.paymentProvider = 'manual';
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    subscription.isReadOnly = false;
    subscription.unpaidSince = null;
    subscription.updatedAt = new Date();
    await subscription.save();

    // Create payment record
    const payment = new Payment({
      userId,
      subscriptionId: subscription._id,
      amount,
      currency: currency || 'EUR',
      status: 'succeeded',
      paymentProvider: 'manual',
      paymentMethod: 'manual',
      failureReason: notes || 'Manual payment by admin',
      paidAt: new Date()
    });
    await payment.save();

    res.json({ message: 'Pago manual registrado', payment, subscription });
  } catch (error) {
    console.error('Error creating manual payment:', error);
    res.status(500).json({ error: 'Error al registrar pago manual' });
  }
});

// Admin: Get billing configuration
app.get('/api/admin/billing/config', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const configs = await BillingConfig.find().select('-config.secretKey -config.apiKey');

    // Initialize default configs if they don't exist
    if (configs.length === 0) {
      const defaultConfigs = [
        { provider: 'stripe', isEnabled: false, config: {} },
        { provider: 'revolut', isEnabled: false, config: {} },
        { provider: 'system', isEnabled: true, config: { trialDays: 30, gracePeriodDays: 90, monthlyPrice: 9.99, yearlyPrice: 99.99, currency: 'EUR' } }
      ];

      for (const cfg of defaultConfigs) {
        await BillingConfig.create(cfg);
      }

      const newConfigs = await BillingConfig.find().select('-config.secretKey -config.apiKey');
      return res.json(newConfigs);
    }

    res.json(configs);
  } catch (error) {
    console.error('Error getting billing config:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// Admin: Update billing configuration
app.put('/api/admin/billing/config/:provider', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { provider } = req.params;
    const { isEnabled, config } = req.body;

    let billingConfig = await BillingConfig.findOne({ provider });

    if (!billingConfig) {
      billingConfig = new BillingConfig({ provider, isEnabled: false, config: {} });
    }

    if (typeof isEnabled !== 'undefined') {
      billingConfig.isEnabled = isEnabled;
    }

    if (config) {
      billingConfig.config = { ...billingConfig.config, ...config };
    }

    billingConfig.lastUpdated = new Date();
    billingConfig.updatedBy = req.user.userId;
    await billingConfig.save();

    // Return without sensitive keys
    const response = billingConfig.toObject();
    delete response.config.secretKey;
    delete response.config.apiKey;

    res.json({ message: 'Configuración actualizada', config: response });
  } catch (error) {
    console.error('Error updating billing config:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// Admin: Test billing provider connection
app.post('/api/admin/billing/config/:provider/test', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { provider } = req.params;
    const billingConfig = await BillingConfig.findOne({ provider });

    if (!billingConfig) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    // TODO: Implement actual API tests
    // For Stripe: const stripe = require('stripe')(billingConfig.config.secretKey);
    // For Revolut: Test with API key

    // Mock test for now
    const testResult = {
      success: true,
      provider,
      message: 'Conexión exitosa (modo prueba)',
      details: {
        accountId: provider === 'stripe' ? 'acct_mock_123' : 'rev_mock_456',
        mode: billingConfig.config.sandboxMode ? 'sandbox' : 'live'
      }
    };

    res.json(testResult);
  } catch (error) {
    console.error('Error testing billing provider:', error);
    res.status(500).json({ error: 'Error al probar conexión' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 CashFlow API v3.0`);
  console.log(`🤖 ChatGPT Integration enabled`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
