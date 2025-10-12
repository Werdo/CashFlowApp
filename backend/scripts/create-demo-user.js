// Script para crear usuario demo con datos de ejemplo
// CashFlow v4.0 - Demo Data Generator

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Schemas (copiados de server.js)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const cashflowDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  ingresos: { type: Object, default: {} },
  gastos: { type: Object, default: {} },
  recurrentes: [{ type: Object }],
  lastModified: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const CashflowData = mongoose.model('CashflowData', cashflowDataSchema);

// Datos de ejemplo para yatelomiro.com
const demoData = {
  user: {
    email: 'demo@yatelomiro.com',
    password: 'demo2025',
    name: 'Usuario Demo',
    role: 'user'
  },
  cashflow: {
    year: 2025,
    ingresos: {
      enero: {
        fijos: [
          { nombre: 'Salario Neto', valor: 3200, notas: 'Salario mensual después de impuestos' },
          { nombre: 'Ingresos por Alquiler', valor: 850, notas: 'Piso en el centro' }
        ],
        variables: [
          { nombre: 'Freelance Desarrollo Web', valor: 1200, notas: 'Proyecto para startup tecnológica' },
          { nombre: 'Dividendos Inversiones', valor: 180, notas: 'Cartera de acciones' }
        ]
      },
      febrero: {
        fijos: [
          { nombre: 'Salario Neto', valor: 3200, notas: 'Salario mensual después de impuestos' },
          { nombre: 'Ingresos por Alquiler', valor: 850, notas: 'Piso en el centro' }
        ],
        variables: [
          { nombre: 'Freelance Diseño', valor: 800, notas: 'Diseño de identidad corporativa' },
          { nombre: 'Venta Artículos Usados', valor: 320, notas: 'Marketplace online' }
        ]
      },
      marzo: {
        fijos: [
          { nombre: 'Salario Neto', valor: 3200, notas: 'Salario mensual después de impuestos' },
          { nombre: 'Ingresos por Alquiler', valor: 850, notas: 'Piso en el centro' }
        ],
        variables: [
          { nombre: 'Freelance Consultoría', valor: 1500, notas: 'Asesoría transformación digital' },
          { nombre: 'Bonus Trimestral', valor: 600, notas: 'Objetivos Q1 cumplidos' }
        ]
      },
      abril: {
        fijos: [
          { nombre: 'Salario Neto', valor: 3200, notas: 'Salario mensual después de impuestos' },
          { nombre: 'Ingresos por Alquiler', valor: 850, notas: 'Piso en el centro' }
        ],
        variables: [
          { nombre: 'Freelance Desarrollo', valor: 950, notas: 'Mantenimiento web cliente recurrente' }
        ]
      },
      mayo: {
        fijos: [
          { nombre: 'Salario Neto', valor: 3200, notas: 'Salario mensual después de impuestos' },
          { nombre: 'Ingresos por Alquiler', valor: 850, notas: 'Piso en el centro' }
        ],
        variables: [
          { nombre: 'Freelance Marketing Digital', valor: 1100, notas: 'Campaña redes sociales' },
          { nombre: 'Dividendos Inversiones', valor: 190, notas: 'Cartera de acciones' }
        ]
      },
      junio: {
        fijos: [
          { nombre: 'Salario Neto', valor: 3200, notas: 'Salario mensual después de impuestos' },
          { nombre: 'Ingresos por Alquiler', valor: 850, notas: 'Piso en el centro' }
        ],
        variables: [
          { nombre: 'Bonus Semestral', valor: 1800, notas: 'Objetivos H1 cumplidos' },
          { nombre: 'Freelance Formación', valor: 650, notas: 'Curso online desarrollo web' }
        ]
      }
    },
    gastos: {
      enero: {
        fijos: [
          { nombre: 'Hipoteca/Alquiler Vivienda', valor: 950, notas: 'Vivienda principal' },
          { nombre: 'Seguro Hogar', valor: 45, notas: 'Seguro multirriesgo' },
          { nombre: 'Comunidad', valor: 85, notas: 'Gastos comunidad edificio' },
          { nombre: 'Suministros (Luz/Gas)', valor: 120, notas: 'Factura eléctrica y gas' },
          { nombre: 'Agua', valor: 35, notas: 'Consumo trimestral prorrateado' },
          { nombre: 'Internet/Teléfono', valor: 55, notas: 'Fibra 600Mb + móvil' },
          { nombre: 'Seguro Coche', valor: 60, notas: 'A todo riesgo' },
          { nombre: 'Gimnasio', valor: 45, notas: 'Cuota mensual' },
          { nombre: 'Suscripciones Streaming', valor: 35, notas: 'Netflix + Spotify + Prime' }
        ],
        variables: [
          { nombre: 'Supermercado', valor: 380, notas: 'Compra mensual alimentación' },
          { nombre: 'Gasolina', valor: 140, notas: 'Combustible vehículo' },
          { nombre: 'Restaurantes', valor: 220, notas: 'Comidas y cenas fuera' },
          { nombre: 'Ocio/Entretenimiento', valor: 180, notas: 'Cine, conciertos, actividades' },
          { nombre: 'Ropa/Calzado', valor: 150, notas: 'Rebajas enero' },
          { nombre: 'Farmacia/Salud', valor: 65, notas: 'Medicamentos y productos salud' }
        ]
      },
      febrero: {
        fijos: [
          { nombre: 'Hipoteca/Alquiler Vivienda', valor: 950, notas: 'Vivienda principal' },
          { nombre: 'Seguro Hogar', valor: 45, notas: 'Seguro multirriesgo' },
          { nombre: 'Comunidad', valor: 85, notas: 'Gastos comunidad edificio' },
          { nombre: 'Suministros (Luz/Gas)', valor: 135, notas: 'Factura eléctrica y gas (frío)' },
          { nombre: 'Agua', valor: 35, notas: 'Consumo trimestral prorrateado' },
          { nombre: 'Internet/Teléfono', valor: 55, notas: 'Fibra 600Mb + móvil' },
          { nombre: 'Seguro Coche', valor: 60, notas: 'A todo riesgo' },
          { nombre: 'Gimnasio', valor: 45, notas: 'Cuota mensual' },
          { nombre: 'Suscripciones Streaming', valor: 35, notas: 'Netflix + Spotify + Prime' }
        ],
        variables: [
          { nombre: 'Supermercado', valor: 360, notas: 'Compra mensual alimentación' },
          { nombre: 'Gasolina', valor: 125, notas: 'Combustible vehículo' },
          { nombre: 'Restaurantes', valor: 180, notas: 'Comidas y cenas fuera' },
          { nombre: 'Ocio/Entretenimiento', valor: 150, notas: 'Actividades culturales' },
          { nombre: 'Regalos San Valentín', valor: 120, notas: 'Regalos pareja' },
          { nombre: 'Farmacia/Salud', valor: 45, notas: 'Medicamentos y productos salud' }
        ]
      },
      marzo: {
        fijos: [
          { nombre: 'Hipoteca/Alquiler Vivienda', valor: 950, notas: 'Vivienda principal' },
          { nombre: 'Seguro Hogar', valor: 45, notas: 'Seguro multirriesgo' },
          { nombre: 'Comunidad', valor: 85, notas: 'Gastos comunidad edificio' },
          { nombre: 'Suministros (Luz/Gas)', valor: 110, notas: 'Factura eléctrica y gas' },
          { nombre: 'Agua', valor: 35, notas: 'Consumo trimestral prorrateado' },
          { nombre: 'Internet/Teléfono', valor: 55, notas: 'Fibra 600Mb + móvil' },
          { nombre: 'Seguro Coche', valor: 60, notas: 'A todo riesgo' },
          { nombre: 'Gimnasio', valor: 45, notas: 'Cuota mensual' },
          { nombre: 'Suscripciones Streaming', valor: 35, notas: 'Netflix + Spotify + Prime' }
        ],
        variables: [
          { nombre: 'Supermercado', valor: 390, notas: 'Compra mensual alimentación' },
          { nombre: 'Gasolina', valor: 150, notas: 'Combustible vehículo + viaje' },
          { nombre: 'Restaurantes', valor: 240, notas: 'Comidas y cenas fuera' },
          { nombre: 'Ocio/Entretenimiento', valor: 200, notas: 'Buen tiempo, más actividades' },
          { nombre: 'Mantenimiento Coche', valor: 180, notas: 'Revisión anual' },
          { nombre: 'Formación Online', valor: 99, notas: 'Curso Udemy desarrollo' }
        ]
      },
      abril: {
        fijos: [
          { nombre: 'Hipoteca/Alquiler Vivienda', valor: 950, notas: 'Vivienda principal' },
          { nombre: 'Seguro Hogar', valor: 45, notas: 'Seguro multirriesgo' },
          { nombre: 'Comunidad', valor: 85, notas: 'Gastos comunidad edificio' },
          { nombre: 'Suministros (Luz/Gas)', valor: 95, notas: 'Factura eléctrica y gas' },
          { nombre: 'Agua', valor: 35, notas: 'Consumo trimestral prorrateado' },
          { nombre: 'Internet/Teléfono', valor: 55, notas: 'Fibra 600Mb + móvil' },
          { nombre: 'Seguro Coche', valor: 60, notas: 'A todo riesgo' },
          { nombre: 'Gimnasio', valor: 45, notas: 'Cuota mensual' },
          { nombre: 'Suscripciones Streaming', valor: 35, notas: 'Netflix + Spotify + Prime' }
        ],
        variables: [
          { nombre: 'Supermercado', valor: 370, notas: 'Compra mensual alimentación' },
          { nombre: 'Gasolina', valor: 135, notas: 'Combustible vehículo' },
          { nombre: 'Restaurantes', valor: 210, notas: 'Comidas y cenas fuera' },
          { nombre: 'Viaje Semana Santa', valor: 650, notas: 'Escapada 4 días' },
          { nombre: 'Farmacia/Salud', valor: 55, notas: 'Medicamentos y productos salud' }
        ]
      },
      mayo: {
        fijos: [
          { nombre: 'Hipoteca/Alquiler Vivienda', valor: 950, notas: 'Vivienda principal' },
          { nombre: 'Seguro Hogar', valor: 45, notas: 'Seguro multirriesgo' },
          { nombre: 'Comunidad', valor: 85, notas: 'Gastos comunidad edificio' },
          { nombre: 'Suministros (Luz/Gas)', valor: 85, notas: 'Factura eléctrica y gas' },
          { nombre: 'Agua', valor: 35, notas: 'Consumo trimestral prorrateado' },
          { nombre: 'Internet/Teléfono', valor: 55, notas: 'Fibra 600Mb + móvil' },
          { nombre: 'Seguro Coche', valor: 60, notas: 'A todo riesgo' },
          { nombre: 'Gimnasio', valor: 45, notas: 'Cuota mensual' },
          { nombre: 'Suscripciones Streaming', valor: 35, notas: 'Netflix + Spotify + Prime' }
        ],
        variables: [
          { nombre: 'Supermercado', valor: 385, notas: 'Compra mensual alimentación' },
          { nombre: 'Gasolina', valor: 145, notas: 'Combustible vehículo' },
          { nombre: 'Restaurantes', valor: 230, notas: 'Comidas y cenas fuera' },
          { nombre: 'Ocio/Entretenimiento', valor: 190, notas: 'Buen tiempo, terrazas' },
          { nombre: 'Ropa/Calzado', valor: 280, notas: 'Renovación armario primavera' },
          { nombre: 'Regalos Día de la Madre', valor: 85, notas: 'Regalo mamá' }
        ]
      },
      junio: {
        fijos: [
          { nombre: 'Hipoteca/Alquiler Vivienda', valor: 950, notas: 'Vivienda principal' },
          { nombre: 'Seguro Hogar', valor: 45, notas: 'Seguro multirriesgo' },
          { nombre: 'Comunidad', valor: 85, notas: 'Gastos comunidad edificio' },
          { nombre: 'Suministros (Luz/Gas)', valor: 75, notas: 'Factura eléctrica (menos gas)' },
          { nombre: 'Agua', valor: 35, notas: 'Consumo trimestral prorrateado' },
          { nombre: 'Internet/Teléfono', valor: 55, notas: 'Fibra 600Mb + móvil' },
          { nombre: 'Seguro Coche', valor: 60, notas: 'A todo riesgo' },
          { nombre: 'Gimnasio', valor: 45, notas: 'Cuota mensual' },
          { nombre: 'Suscripciones Streaming', valor: 35, notas: 'Netflix + Spotify + Prime' }
        ],
        variables: [
          { nombre: 'Supermercado', valor: 395, notas: 'Compra mensual alimentación' },
          { nombre: 'Gasolina', valor: 155, notas: 'Combustible vehículo + escapadas' },
          { nombre: 'Restaurantes', valor: 260, notas: 'Comidas y cenas fuera (más terrazas)' },
          { nombre: 'Ocio/Entretenimiento', valor: 210, notas: 'Fiestas, conciertos verano' },
          { nombre: 'Regalos Día del Padre', valor: 75, notas: 'Regalo papá' },
          { nombre: 'Aire Acondicionado', valor: 45, notas: 'Revisión y mantenimiento AC' }
        ]
      }
    },
    recurrentes: [
      {
        nombre: 'Salario Neto',
        valor: 3200,
        tipo: 'ingreso',
        categoria: 'Nómina',
        frecuencia: 'mensual',
        diaDelMes: 28,
        activo: true,
        notas: 'Salario mensual neto - Empresa Tech'
      },
      {
        nombre: 'Alquiler Piso Centro',
        valor: 850,
        tipo: 'ingreso',
        categoria: 'Alquileres',
        frecuencia: 'mensual',
        diaDelMes: 5,
        activo: true,
        notas: 'Ingresos por alquiler piso 2 habitaciones'
      },
      {
        nombre: 'Hipoteca Vivienda Principal',
        valor: 950,
        tipo: 'gasto',
        categoria: 'Vivienda',
        frecuencia: 'mensual',
        diaDelMes: 1,
        activo: true,
        notas: 'Cuota hipotecaria - quedan 18 años'
      },
      {
        nombre: 'Internet + Móvil',
        valor: 55,
        tipo: 'gasto',
        categoria: 'Telecomunicaciones',
        frecuencia: 'mensual',
        diaDelMes: 10,
        activo: true,
        notas: 'Fibra 600Mb + móvil ilimitado'
      },
      {
        nombre: 'Gimnasio',
        valor: 45,
        tipo: 'gasto',
        categoria: 'Salud y Deporte',
        frecuencia: 'mensual',
        diaDelMes: 15,
        activo: true,
        notas: 'Cuota mensual gimnasio premium'
      },
      {
        nombre: 'Seguro Coche',
        valor: 60,
        tipo: 'gasto',
        categoria: 'Transporte',
        frecuencia: 'mensual',
        diaDelMes: 20,
        activo: true,
        notas: 'Seguro a todo riesgo'
      },
      {
        nombre: 'Suscripciones Digitales',
        valor: 35,
        tipo: 'gasto',
        categoria: 'Entretenimiento',
        frecuencia: 'mensual',
        diaDelMes: 1,
        activo: true,
        notas: 'Netflix + Spotify Premium + Amazon Prime'
      },
      {
        nombre: 'Comunidad Edificio',
        valor: 85,
        tipo: 'gasto',
        categoria: 'Vivienda',
        frecuencia: 'mensual',
        diaDelMes: 1,
        activo: true,
        notas: 'Gastos comunidad con ascensor y portería'
      },
      {
        nombre: 'Seguro Hogar',
        valor: 45,
        tipo: 'gasto',
        categoria: 'Vivienda',
        frecuencia: 'mensual',
        diaDelMes: 1,
        activo: true,
        notas: 'Seguro multirriesgo hogar'
      },
      {
        nombre: 'Dividendos Cartera',
        valor: 180,
        tipo: 'ingreso',
        categoria: 'Inversiones',
        frecuencia: 'trimestral',
        mesDelTrimestre: 1,
        activo: true,
        notas: 'Dividendos acciones blue chip'
      }
    ]
  }
};

async function createDemoUser() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/cashflow');
    console.log('✅ Conectado a MongoDB');

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: demoData.user.email });
    if (existingUser) {
      console.log('⚠️  Usuario demo ya existe. Eliminando datos antiguos...');
      await CashflowData.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // Crear usuario demo
    console.log('👤 Creando usuario demo...');
    const hashedPassword = await bcrypt.hash(demoData.user.password, 10);
    const user = new User({
      email: demoData.user.email,
      password: hashedPassword,
      name: demoData.user.name,
      role: demoData.user.role
    });
    await user.save();
    console.log('✅ Usuario demo creado');
    console.log(`   Email: ${demoData.user.email}`);
    console.log(`   Password: ${demoData.user.password}`);

    // Crear datos de cashflow
    console.log('💰 Creando datos de cashflow...');
    const cashflowData = new CashflowData({
      userId: user._id,
      year: demoData.cashflow.year,
      ingresos: demoData.cashflow.ingresos,
      gastos: demoData.cashflow.gastos,
      recurrentes: demoData.cashflow.recurrentes
    });
    await cashflowData.save();
    console.log('✅ Datos de cashflow creados');

    // Estadísticas
    const totalIngresos = Object.values(demoData.cashflow.ingresos).reduce((sum, mes) => {
      const fijos = mes.fijos?.reduce((s, i) => s + i.valor, 0) || 0;
      const variables = mes.variables?.reduce((s, i) => s + i.valor, 0) || 0;
      return sum + fijos + variables;
    }, 0);

    const totalGastos = Object.values(demoData.cashflow.gastos).reduce((sum, mes) => {
      const fijos = mes.fijos?.reduce((s, g) => s + g.valor, 0) || 0;
      const variables = mes.variables?.reduce((s, g) => s + g.valor, 0) || 0;
      return sum + fijos + variables;
    }, 0);

    const balance = totalIngresos - totalGastos;

    console.log('\n📊 Resumen de datos creados:');
    console.log(`   Ingresos totales: ${totalIngresos.toLocaleString('es-ES')}€`);
    console.log(`   Gastos totales: ${totalGastos.toLocaleString('es-ES')}€`);
    console.log(`   Balance: ${balance.toLocaleString('es-ES')}€`);
    console.log(`   Recurrentes: ${demoData.cashflow.recurrentes.length} items`);
    console.log('\n🎉 Usuario demo creado exitosamente para yatelomiro.com!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando usuario demo:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createDemoUser();
