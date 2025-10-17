const mongoose = require('mongoose');
const { User } = require('../models');

const ADMIN_USERS = [
  {
    email: 'gvarela@oversunenergy.com',
    password: 'OverSun2025!',
    name: 'Gustavo Varela',
    role: 'admin',
    company: 'Oversun Energy'
  },
  {
    email: 'sjimenez@oversunenergy.com',
    password: 'OverSun2025!',
    name: 'Sara Jiménez',
    role: 'admin',
    company: 'Oversun Energy'
  },
  {
    email: 'mherreros@oversunenergy.com',
    password: 'OverSun2025!',
    name: 'María Herreros',
    role: 'admin',
    company: 'Oversun Energy'
  },
  {
    email: 'ppelaez@oversunenergy.com',
    password: 'OverSun2025!',
    name: 'Pedro Peláez',
    role: 'admin',
    company: 'Oversun Energy'
  },
  {
    email: 'mperez@gestaeasesores.com',
    password: 'Gestae2025!',
    name: 'Manuel Pérez',
    role: 'admin',
    company: 'Gestae Asesores'
  }
];

async function createAdminUsers() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/assetflow';
    await mongoose.connect(mongoUrl);

    console.log('✅ Connected to MongoDB');
    console.log('========================================');
    console.log('Creating Admin Users...');
    console.log('========================================\n');

    let created = 0;
    let skipped = 0;

    for (const userData of ADMIN_USERS) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
          console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
          skipped++;
          continue;
        }

        // Create new user
        const user = new User(userData);
        await user.save();

        console.log(`✅ Created: ${userData.name} (${userData.email})`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${userData.email}:`, error.message);
      }
    }

    console.log('\n========================================');
    console.log('Summary:');
    console.log(`✅ Created: ${created} users`);
    console.log(`⏭️  Skipped: ${skipped} users`);
    console.log('========================================\n');

    console.log('Default passwords:');
    console.log('  • Oversun Energy users: OverSun2025!');
    console.log('  • Gestae Asesores user: Gestae2025!');
    console.log('\n⚠️  IMPORTANT: Change passwords after first login!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUsers();
}

module.exports = createAdminUsers;
