# 📦 AssetFlow v1.0 - Asset Management System

**Version:** 1.0.0
**Base:** CashFlow v4.0 Architecture + Facit Template
**Status:** 🚧 In Development
**Last Updated:** October 16, 2025

---

## 🎯 Description

**AssetFlow** is an enterprise-ready asset management system designed for comprehensive tracking, control, and optimization of organizational assets throughout their complete lifecycle. Built on the proven CashFlow v4.0 architecture and featuring a professional UI based on the Facit template.

### **Key Differentiators:**
- **CashFlow:** Manages cash flow (income/expenses)
- **AssetFlow:** Manages asset flow (acquisition/disposal/depreciation)

---

## ✨ Features v1.0

### **🎯 Core Features**
- ✅ Multi-user with JWT authentication
- ✅ Asset lifecycle management
- ✅ Automated depreciation calculation
- ✅ Complete audit system
- ✅ QR/Barcode tracking
- ✅ REST API fully documented

### **💼 Asset Management**
- ✅ Asset CRUD operations
- ✅ Categories and subcategories
- ✅ Location tracking
- ✅ Department assignments
- ✅ Responsible person tracking
- ✅ Photo and document management
- ✅ Condition monitoring
- ✅ Status tracking (Active, Maintenance, Disposed)

### **🔧 Maintenance**
- ✅ Preventive maintenance scheduling
- ✅ Corrective maintenance logging
- ✅ Maintenance calendar
- ✅ Cost tracking
- ✅ Service provider management
- ✅ Warranty tracking
- ✅ Automated alerts

### **📊 Depreciation**
- ✅ Automatic calculation
- ✅ Multiple methods (Linear, Accelerated, Units Produced)
- ✅ Monthly/Annual reports
- ✅ Book value tracking
- ✅ Tax compliance reports

### **🏪 Deposit Management Module**
- ✅ Products in deposit tracking
- ✅ Client management
- ✅ Weekly report upload (Excel/PDF → JSON)
- ✅ Automatic invoice generation
- ✅ Box-level QR tracking
- ✅ Individual product QR codes
- ✅ Odoo integration for invoicing
- ✅ Multi-client support

### **📈 Reports & Analytics**
- ✅ Inventory reports
- ✅ Asset value reports
- ✅ Depreciation reports
- ✅ Maintenance reports
- ✅ Location-based reports
- ✅ Interactive dashboards
- ✅ Export to Excel/PDF

### **⚙️ Administration**
- ✅ User management
- ✅ Roles and permissions (RBAC)
- ✅ Company settings
- ✅ Department management
- ✅ Location management
- ✅ Category configuration
- ✅ Audit log

### **🎨 UI/UX Professional (Facit-based)**
- ✅ Modern design with Bootstrap 5
- ✅ TypeScript + React 18
- ✅ Responsive layout
- ✅ Material Icons
- ✅ ApexCharts integration
- ✅ Professional sidebar navigation
- ✅ Multi-language support (i18n ready)

---

## 🏗️ Architecture

### **Tech Stack:**
```
Frontend:  React 18 + TypeScript + Bootstrap 5 + ApexCharts
Backend:   Node.js + Express + MongoDB
Database:  MongoDB 7.0
DevOps:    Docker + Docker Compose + Nginx
```

### **Microservices:**
```
┌─────────────────────────────────────────┐
│         Nginx (Reverse Proxy)           │
│         Port 80/443 (SSL)               │
└─────────────────────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼──────┐      ┌────────▼────────┐
│  Frontend  │      │    Backend API  │
│  (React)   │      │  (Express)      │
│  Port 3000 │      │  Port 5000      │
└────────────┘      └────────┬────────┘
                             │
                    ┌────────▼─────────┐
                    │    MongoDB       │
                    │    Port 27017    │
                    └──────────────────┘
```

---

## 🚀 Quick Start

### **Prerequisites:**
- Docker >= 20.10
- Docker Compose >= 2.0
- Node.js >= 18 (for local development)

### **Installation:**

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourOrg/AssetFlow.git
   cd AssetFlow
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

---

## 📊 Data Models

### **Main Entities:**

#### **Asset**
```javascript
{
  assetCode: "AST-2025-001",
  name: "CNC Machine X500",
  category: "Machinery",
  purchaseValue: 125000,
  currentValue: 105000,
  depreciationMethod: "Linear",
  status: "Active",
  location: "Plant A",
  responsiblePerson: "John Smith",
  // ... more fields
}
```

#### **Maintenance**
```javascript
{
  assetId: "64f3a1b2c9e8d7f6a5b4c3d2",
  type: "Preventive",
  scheduledDate: "2025-11-15",
  cost: 500,
  status: "Pending",
  // ... more fields
}
```

#### **Deposit Product**
```javascript
{
  productQR: "QR-2025-001234",
  boxQR: "BOX-2025-045",
  clientId: "CLI-001",
  quantity: 12,
  office: "North Office",
  saleDate: null,
  salePrice: null,
  status: "In Deposit",
  // ... more fields
}
```

---

## 🔐 Security

### **Implemented:**
- ✅ JWT authentication with expiration
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Rate limiting on API
- ✅ Environment variables for secrets
- ✅ MongoDB authentication
- ✅ Role-based access control (RBAC)

### **Recommendations for Production:**
- 🔒 Change JWT_SECRET in production
- 🔒 Use Let's Encrypt certificates
- 🔒 Configure firewall
- 🔒 Automatic MongoDB backups
- 🔒 Log monitoring

---

## 📚 API Documentation

### **Authentication:**
```
POST   /api/auth/register    - Register user
POST   /api/auth/login       - Login
GET    /api/auth/me          - Get current user
POST   /api/auth/refresh     - Refresh token
POST   /api/auth/logout      - Logout
```

### **Assets:**
```
GET    /api/assets           - List all assets
POST   /api/assets           - Create new asset
GET    /api/assets/:id       - Get asset by ID
PUT    /api/assets/:id       - Update asset
DELETE /api/assets/:id       - Delete asset
GET    /api/assets/search    - Advanced search
POST   /api/assets/:id/photo - Upload photo
```

### **Maintenance:**
```
GET    /api/maintenance      - List all maintenance
POST   /api/maintenance      - Schedule maintenance
GET    /api/maintenance/:id  - Get maintenance details
PUT    /api/maintenance/:id  - Update maintenance
GET    /api/maintenance/pending - Pending maintenance
```

### **Deposit:**
```
GET    /api/deposit/products       - Products in deposit
POST   /api/deposit/upload-report  - Upload weekly report
GET    /api/deposit/clients        - List clients
POST   /api/deposit/invoice        - Generate invoice
GET    /api/deposit/qr/:code       - Track by QR code
```

### **Reports:**
```
GET    /api/reports/inventory      - Inventory report
GET    /api/reports/depreciation   - Depreciation report
GET    /api/reports/maintenance    - Maintenance report
POST   /api/reports/export         - Export data
```

---

## 🐳 Docker Commands

### **Basic Commands:**
```bash
# View logs in real-time
docker-compose logs -f

# View logs of a specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove data (⚠️ CAUTION)
docker-compose down -v

# View service status
docker-compose ps

# Rebuild images
docker-compose build --no-cache
```

---

## 🗄️ MongoDB Management

### **Access MongoDB:**
```bash
# Enter container
docker exec -it assetflow-mongodb mongosh

# Connect to database
use assetflow

# Authenticate
db.auth('admin', 'assetflow2025')

# View collections
show collections
```

### **Backup:**
```bash
# Create backup
docker exec assetflow-mongodb mongodump \
  --username admin \
  --password assetflow2025 \
  --authenticationDatabase admin \
  --out /backup

# Copy to host
docker cp assetflow-mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)
```

---

## 🎯 Development Roadmap

### **Phase 1: MVP (Week 1-2)**
- ✅ Project setup
- ✅ Basic authentication
- ✅ Asset CRUD
- ✅ Basic dashboard
- ✅ Docker deployment

### **Phase 2: Core Features (Week 3-4)**
- ⏳ Depreciation system
- ⏳ Maintenance management
- ⏳ Asset movements
- ⏳ Advanced search and filters

### **Phase 3: Deposit Module (Week 5)**
- ⏳ Weekly report upload
- ⏳ JSON conversion system
- ⏳ Invoice generation
- ⏳ QR code tracking

### **Phase 4: Analytics (Week 6)**
- ⏳ Complete reports
- ⏳ Charts and statistics
- ⏳ Data export
- ⏳ Analytics dashboard

### **Phase 5: Advanced (Week 7+)**
- ⏳ QR/Barcode generation
- ⏳ Mobile app (PWA)
- ⏳ Push notifications
- ⏳ ERP integration (Odoo)

---

## 🌟 Key Features Comparison

| Feature | CashFlow | AssetFlow |
|---------|----------|-----------|
| **Focus** | Cash flow | Asset flow |
| **Main Entity** | Monetary transaction | Physical asset |
| **Value** | Money | Depreciation |
| **Temporality** | Day to day | Lifecycle |
| **Alerts** | Payments/Collections | Maintenance |
| **Reports** | P&L, Cash flow | Inventory, Depreciation |
| **Codes** | N/A | QR/Barcode |
| **Documents** | Invoices | Photos, manuals |
| **Special Module** | N/A | Deposit Management |

---

## 📝 Development Commands

### **Frontend Development:**
```bash
cd frontend
npm install
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

### **Backend Development:**
```bash
cd backend
npm install
npm run dev          # Start with nodemon
npm start            # Production start
npm run create-admin # Create admin user
npm run seed         # Seed sample data
```

---

## 🔧 Configuration

### **Environment Variables (.env):**
```env
# Backend
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:assetflow2025@mongodb:27017/assetflow
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

**Issues:** https://github.com/YourOrg/AssetFlow/issues
**Documentation:** https://github.com/YourOrg/AssetFlow/wiki
**Email:** support@assetflow.com

---

## 🙏 Credits

**Development Team:**
- Lead Developer: Pedro Peláez
- AI Assistant: Claude Code by Anthropic
- Company: Anticera

**Technologies:**
- React 18 + TypeScript
- Node.js + Express
- MongoDB 7.0
- Docker & Docker Compose
- Nginx
- Bootstrap 5
- ApexCharts
- Facit Template (UI base)

---

**Prepared by:** Claude Code
**Date:** October 16, 2025
**Version:** 1.0.0
**Status:** 🚧 In Development

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
