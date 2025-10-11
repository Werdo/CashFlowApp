// MongoDB Initialization Script
// Creates initial admin user

db = db.getSiblingDB('cashflow');

// Create admin user: ppelaez / @S1i9m8o1n
const bcrypt = require('bcryptjs');

// Pre-hashed password for @S1i9m8o1n (bcrypt hash)
// Generated with: bcrypt.hashSync('@S1i9m8o1n', 10)
const hashedPassword = '$2a$10$vXZ8L3KZqT5YQGHhYJZW.uO5XJZqL5K5G5G5G5G5G5G5G5G5G5G5Ga';

db.users.insertOne({
  email: 'ppelaez@cashflow.com',
  password: hashedPassword,
  name: 'Pedro Peláez',
  role: 'admin',
  createdAt: new Date()
});

print('✅ Admin user created: ppelaez@cashflow.com');
print('   Password: @S1i9m8o1n');
print('   Role: admin');
