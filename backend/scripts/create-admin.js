// Create Admin User Script
// Usage: node create-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema (same as in server.js)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cashflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'ppelaez@cashflow.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Email: ppelaez@cashflow.com');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('@S1i9m8o1n', 10);

    // Create admin user
    const admin = new User({
      email: 'ppelaez@cashflow.com',
      password: hashedPassword,
      name: 'Pedro Peláez',
      role: 'admin'
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('   Email: ppelaez@cashflow.com');
    console.log('   Password: @S1i9m8o1n');
    console.log('   Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
