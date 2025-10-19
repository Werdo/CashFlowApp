/**
 * Script de Migración: Agregar campos de auditoría a documentos existentes
 *
 * Este script agrega los campos createdBy y updatedBy a todos los documentos
 * existentes en las colecciones que no los tengan.
 *
 * Uso:
 *   node src/scripts/migrate-audit-fields.js
 */

const mongoose = require('mongoose');
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
  Settings
} = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/assetflow';

async function migrateCollection(Model, collectionName, adminUserId) {
  try {
    console.log(`\n📝 Migrando colección: ${collectionName}`);

    // Contar documentos sin campos de auditoría
    const countWithoutAudit = await Model.countDocuments({
      $or: [
        { createdBy: { $exists: false } },
        { updatedBy: { $exists: false } }
      ]
    });

    if (countWithoutAudit === 0) {
      console.log(`   ✅ Todos los documentos ya tienen campos de auditoría`);
      return { migrated: 0, total: 0 };
    }

    console.log(`   📊 Documentos a migrar: ${countWithoutAudit}`);

    // Actualizar documentos
    const result = await Model.updateMany(
      {
        $or: [
          { createdBy: { $exists: false } },
          { updatedBy: { $exists: false } }
        ]
      },
      {
        $set: {
          createdBy: adminUserId,
          updatedBy: adminUserId
        }
      }
    );

    console.log(`   ✅ Migrados: ${result.modifiedCount} documentos`);

    return {
      migrated: result.modifiedCount,
      total: countWithoutAudit
    };
  } catch (error) {
    console.error(`   ❌ Error migrando ${collectionName}:`, error.message);
    return { migrated: 0, total: 0, error: error.message };
  }
}

async function createAdminUserIfNotExists() {
  try {
    let admin = await User.findOne({ role: 'admin' });

    if (!admin) {
      console.log('\n👤 No se encontró usuario administrador. Creando uno...');
      admin = new User({
        email: 'admin@assetflow.com',
        password: 'Admin123!',
        name: 'Administrador del Sistema',
        role: 'admin',
        company: 'AssetFlow',
        active: true
      });
      await admin.save();
      console.log('   ✅ Usuario administrador creado: admin@assetflow.com / Admin123!');
    } else {
      console.log(`\n👤 Usuario administrador encontrado: ${admin.email}`);
    }

    return admin._id;
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    throw error;
  }
}

async function migrate() {
  console.log('========================================');
  console.log('🔄 MIGRACIÓN DE CAMPOS DE AUDITORÍA');
  console.log('========================================');

  try {
    // Conectar a MongoDB
    console.log('\n📡 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');

    // Obtener o crear usuario administrador
    const adminUserId = await createAdminUserIfNotExists();

    // Migrar cada colección
    const collections = [
      { model: User, name: 'Users' },
      { model: Client, name: 'Clients' },
      { model: Article, name: 'Articles' },
      { model: Family, name: 'Families' },
      { model: Lot, name: 'Lots' },
      { model: StockUnit, name: 'StockUnits' },
      { model: DeliveryNote, name: 'DeliveryNotes' },
      { model: Forecast, name: 'Forecasts' },
      { model: Settings, name: 'Settings' }
    ];

    const results = {};
    let totalMigrated = 0;

    for (const { model, name } of collections) {
      const result = await migrateCollection(model, name, adminUserId);
      results[name] = result;
      totalMigrated += result.migrated || 0;
    }

    // Resumen
    console.log('\n========================================');
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('========================================');
    console.log(`Total de documentos migrados: ${totalMigrated}`);
    console.log('\nDetalle por colección:');
    for (const [name, result] of Object.entries(results)) {
      if (result.error) {
        console.log(`  ❌ ${name}: Error - ${result.error}`);
      } else {
        console.log(`  ✅ ${name}: ${result.migrated}/${result.total} documentos`);
      }
    }

    console.log('\n✅ Migración completada exitosamente');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar migración
migrate();
