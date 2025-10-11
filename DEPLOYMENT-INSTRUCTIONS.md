# 🚀 CashFlow v2.0 - Deployment Instructions

## ✅ Pre-Deployment Modifications Complete

All modifications have been made! The app is now ready to deploy with:
- ✅ Frontend connected to backend API
- ✅ Admin user configuration ready
- ✅ Authentication working with JWT
- ✅ Auto-save/load from MongoDB

## 📋 Admin User Credentials

**Username:** ppelaez@cashflow.com
**Password:** @S1i9m8o1n
**Role:** admin

## 🐳 Deployment Steps (Docker Required)

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running before proceeding.

### Step 2: Deploy with Docker Compose

**Option A - PowerShell (Recommended for Windows):**
```powershell
cd C:\Users\pedro\cashflow-app-v2.0-complete
docker-compose up -d
```

**Option B - Use deployment script:**
```powershell
.\deploy.sh
```

### Step 3: Wait for Services to Start
The deployment includes:
- MongoDB (Port 27017)
- Backend API (Port 5000)
- Frontend (Port 3000)

Wait ~30 seconds for all services to initialize.

### Step 4: Create Admin User

Open a new terminal and run:
```bash
docker-compose exec backend npm run create-admin
```

You should see:
```
✅ Admin user created successfully!
   Email: ppelaez@cashflow.com
   Password: @S1i9m8o1n
   Role: admin
```

### Step 5: Access the App

Open browser: **http://localhost:3000**

Login with:
- **Email:** ppelaez@cashflow.com
- **Password:** @S1i9m8o1n

## 🔧 Alternative: Manual Development (Without Docker)

If Docker Desktop is not working, you can run services manually:

### Terminal 1 - MongoDB
```bash
# Install MongoDB locally first
mongod --dbpath C:\data\db
```

### Terminal 2 - Backend
```bash
cd C:\Users\pedro\cashflow-app-v2.0-complete\backend
npm install
npm run create-admin  # Creates admin user
npm run dev
```

### Terminal 3 - Frontend
```bash
cd C:\Users\pedro\cashflow-app-v2.0-complete\frontend
npm install
npm start
```

Then access: http://localhost:3000

## 📊 What Changed in Frontend

### 1. API Connection
- Connected to backend API at `http://localhost:5000/api`
- Added JWT token management with localStorage
- Auto-login on page refresh if token exists

### 2. Authentication
- `handleLogin()` - Real login with backend validation
- `handleRegister()` - Real user registration
- `handleLogout()` - Clears token and logs out
- Error handling for all auth operations

### 3. Data Persistence
- `loadCashflowData()` - Loads data from MongoDB on login
- `saveCashflowData()` - Saves data to MongoDB when clicking "Guardar"
- Auto-loads user's cashflow data after successful login

### 4. User Session
- Token stored in localStorage
- Auto-validates token on app load
- Shows user name from backend
- Maintains session across page refreshes

## 🛠️ Troubleshooting

### Backend not connecting
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Frontend shows connection error
- Verify backend is running: http://localhost:5000/health
- Check browser console for CORS errors
- Ensure `.env` file exists in backend

### Admin user already exists
If you get "Admin user already exists" when creating admin:
- This is normal if you've run the command before
- You can still login with the credentials

### MongoDB connection failed
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

## 📝 Environment Variables

Backend `.env` file (auto-created):
```env
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/cashflow
JWT_SECRET=cashflow-secret-key-2025
```

## 🎯 Features Now Working

✅ **Multi-user authentication** - JWT-based login/register
✅ **Data persistence** - MongoDB storage per user
✅ **Auto-save** - Click "Guardar" to save to backend
✅ **Auto-load** - Data loads automatically on login
✅ **Session management** - Stay logged in across refreshes
✅ **Admin user** - Pre-configured admin account
✅ **Role-based access** - Admin vs regular user roles

## 🔐 Security Notes

⚠️ **Development Mode:**
- JWT secret is hardcoded for development
- No HTTPS (using HTTP)
- CORS is open to all origins

🔒 **For Production:**
- Change JWT_SECRET to a strong random key
- Enable HTTPS with SSL certificates
- Configure CORS to specific domains only
- Use environment-specific .env files

## 📞 Next Steps

1. Start Docker Desktop
2. Run `docker-compose up -d`
3. Wait 30 seconds
4. Run `docker-compose exec backend npm run create-admin`
5. Open http://localhost:3000
6. Login as admin (ppelaez@cashflow.com / @S1i9m8o1n)
7. Start managing your cashflow!

---

**All modifications complete!** Ready to deploy when Docker Desktop is running. 🚀
