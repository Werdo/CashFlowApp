/**
 * AssetFlow v1.0 - Backend Server
 * Express + MongoDB + JWT Authentication
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'AssetFlow API v1.0',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// API Routes placeholder
app.get('/api', (req, res) => {
    res.json({
        message: 'AssetFlow API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            assets: '/api/assets',
            maintenance: '/api/maintenance',
            movements: '/api/movements',
            depreciation: '/api/depreciation',
            deposit: '/api/deposit',
            reports: '/api/reports'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`,
        timestamp: new Date().toISOString()
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 AssetFlow Backend Server');
    console.log('='.repeat(50));
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Port: ${PORT}`);
    console.log(`✓ Status: Running`);
    console.log(`✓ Time: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
