// database/init.js
// Script de inicialización para MongoDB

db = db.getSiblingDB('cashflow');

// Crear usuario de aplicación
db.createUser({
  user: 'cashflow_user',
  pwd: 'cashflow_pass_2025',
  roles: [
    {
      role: 'readWrite',
      db: 'cashflow'
    }
  ]
});

// Crear índices para optimización
db.users.createIndex({ email: 1 }, { unique: true });
db.cashflows.createIndex({ userId: 1, year: 1 });

print('✅ Base de datos inicializada correctamente');
print('📊 Database: cashflow');
print('👤 Usuario: cashflow_user');
print('🔐 Contraseña: cashflow_pass_2025');
