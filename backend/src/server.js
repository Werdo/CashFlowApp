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
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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
