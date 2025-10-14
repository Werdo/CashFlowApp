// Script para crear un usuario administrador
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/cashflowdb';

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
  unpaidSince: { type: Date, default: null },
  isReadOnly: { type: Boolean, default: false },
  trialEnd: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// CashFlow Schema
const cashFlowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  months: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Year Schema
const yearSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const CashFlow = mongoose.model('CashFlow', cashFlowSchema);
const Year = mongoose.model('Year', yearSchema);

// Admin user data
const adminData = {
  email: 'ppelaez@yatelomiro.com',
  password: 'Admin2025!', // Contraseña segura para el administrador
  name: 'Pedro Peláez',
  role: 'admin'
};

async function createAdminUser() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.log('⚠️  Usuario administrador ya existe. Actualizando rol...');
      existingUser.role = 'admin';
      existingUser.name = adminData.name;
      await existingUser.save();
      console.log('✅ Usuario actualizado a administrador');
    } else {
      console.log('👤 Creando usuario administrador...');
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      const user = new User({
        email: adminData.email,
        password: hashedPassword,
        name: adminData.name,
        role: adminData.role
      });
      await user.save();
      console.log('✅ Usuario administrador creado');

      // Crear CashFlow inicial
      console.log('📊 Creando cashflow inicial...');
      const initialCashflow = new CashFlow({
        userId: user._id,
        year: 2025,
        months: []
      });
      await initialCashflow.save();
      console.log('✅ Cashflow inicial creado');

      // Crear año inicial
      console.log('📅 Creando año inicial...');
      const initialYear = new Year({
        userId: user._id,
        year: 2025,
        isActive: true
      });
      await initialYear.save();
      console.log('✅ Año inicial creado');

      // Crear suscripción permanente (admin no necesita pagar)
      console.log('💳 Creando suscripción permanente...');
      const subscription = new Subscription({
        userId: user._id,
        status: 'active',
        plan: 'yearly',
        paymentProvider: 'manual',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(2099, 11, 31), // Hasta el año 2099
        isReadOnly: false
      });
      await subscription.save();
      console.log('✅ Suscripción permanente creada');
    }

    console.log('\n🎉 ¡Usuario administrador configurado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ' + adminData.email);
    console.log('🔑 Password: ' + adminData.password);
    console.log('👑 Role:     admin');
    console.log('🌐 URL:      https://91.98.113.188');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Puedes acceder con estas credenciales al panel de administración');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdminUser();
