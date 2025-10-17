const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/assetflow';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Mount API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AssetFlow API v2.1',
    version: '2.1.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      clients: '/api/clients',
      articles: '/api/articles',
      stock: '/api/stock',
      settings: '/api/settings'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Database connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${MONGODB_URI}`);

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('========================================');
      console.log(`🚀 AssetFlow API v2.1 is running`);
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('========================================');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;
