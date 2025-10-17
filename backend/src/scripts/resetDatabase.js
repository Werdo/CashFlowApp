const mongoose = require('mongoose');
const readline = require('readline');
const models = require('../models');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetDatabase() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/assetflow';
    await mongoose.connect(mongoUrl);

    console.log('✅ Connected to MongoDB');
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA from the database!');
    console.log('========================================\n');

    const answer = await question('Are you sure you want to continue? (yes/no): ');

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }

    console.log('\n========================================');
    console.log('Resetting Database...');
    console.log('========================================\n');

    const collections = Object.keys(models);
    let deleted = 0;

    for (const modelName of collections) {
      try {
        const Model = models[modelName];
        const result = await Model.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} documents from ${modelName}`);
        deleted += result.deletedCount;
      } catch (error) {
        console.error(`❌ Error deleting from ${modelName}:`, error.message);
      }
    }

    console.log('\n========================================');
    console.log(`✅ Database reset complete`);
    console.log(`Total documents deleted: ${deleted}`);
    console.log('========================================\n');

    // Ask if user wants to create admin users
    const createAdmins = await question('Create admin users now? (yes/no): ');

    if (createAdmins.toLowerCase() === 'yes') {
      const createAdminUsers = require('./createAdminUsers');
      rl.close();
      await createAdminUsers();
    } else {
      console.log('\n✅ Done! Database is now empty.');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;
