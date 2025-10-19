/**
 * Script de Limpieza: Eliminar todos los datos de prueba
 *
 * Este script elimina TODOS los datos de todas las colecciones excepto usuarios.
 * Usar con precaución solo en desarrollo.
 *
 * Uso:
 *   node src/scripts/clean-database.js
 *
 * ADVERTENCIA: Este script es DESTRUCTIVO. Solo usar en desarrollo.
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const {
  User,
  Client,
  Article,
  Family,
  Lot,
  StockUnit,
  DeliveryNote,
  Forecast,
  Settings,
  AuditLog
} = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/assetflow';

// Crear interfaz de readline para confirmación
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function cleanCollection(Model, collectionName, keepUsers = false) {
  try {
    console.log(`\n🗑️  Limpiando colección: ${collectionName}`);

    const countBefore = await Model.countDocuments();
    console.log(`   📊 Documentos antes: ${countBefore}`);

    let result;
    if (keepUsers) {
      // No eliminar usuarios admin
      result = await Model.deleteMany({ role: { $ne: 'admin' } });
      console.log(`   ⚠️  Usuarios eliminados: ${result.deletedCount} (admin preservado)`);
    } else {
      result = await Model.deleteMany({});
      console.log(`   ✅ Documentos eliminados: ${result.deletedCount}`);
    }

    const countAfter = await Model.countDocuments();
    console.log(`   📊 Documentos después: ${countAfter}`);

    return result.deletedCount;
  } catch (error) {
    console.error(`   ❌ Error limpiando ${collectionName}:`, error.message);
    return 0;
  }
}

async function cleanDatabase() {
  console.log('========================================');
  console.log('🗑️  LIMPIEZA DE BASE DE DATOS');
  console.log('========================================');

  try {
    // Conectar a MongoDB
    console.log('\n📡 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');
    console.log(`📊 Base de datos: ${MONGODB_URI}`);

    // Confirmación
    console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos excepto usuarios admin.');
    console.log('⚠️  Esta acción NO se puede deshacer.\n');

    const answer = await askQuestion('¿Desea continuar? (escriba "SI" para confirmar): ');

    if (answer.toUpperCase() !== 'SI') {
      console.log('\n❌ Operación cancelada por el usuario');
      rl.close();
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('\n🔄 Iniciando limpieza...');

    // Colecciones a limpiar
    const collections = [
      { model: Settings, name: 'Settings', keepUsers: false },
      { model: AuditLog, name: 'AuditLog', keepUsers: false },
      { model: Forecast, name: 'Forecasts', keepUsers: false },
      { model: DeliveryNote, name: 'DeliveryNotes', keepUsers: false },
      { model: StockUnit, name: 'StockUnits', keepUsers: false },
      { model: Lot, name: 'Lots', keepUsers: false },
      { model: Article, name: 'Articles', keepUsers: false },
      { model: Family, name: 'Families', keepUsers: false },
      { model: Client, name: 'Clients', keepUsers: false },
      { model: User, name: 'Users', keepUsers: true }
    ];

    let totalDeleted = 0;

    for (const { model, name, keepUsers } of collections) {
      const deleted = await cleanCollection(model, name, keepUsers);
      totalDeleted += deleted;
    }

    // Resumen
    console.log('\n========================================');
    console.log('📊 RESUMEN DE LIMPIEZA');
    console.log('========================================');
    console.log(`Total de documentos eliminados: ${totalDeleted}`);
    console.log('\n✅ Limpieza completada exitosamente');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n📡 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar limpieza
cleanDatabase();
