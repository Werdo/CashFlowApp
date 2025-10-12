// Script para añadir datos demo al usuario demo@yatelomiro.com
// Usa el API para añadir datos reales al cashflow

const API_URL = 'http://localhost:5000/api';

async function loginAndAddData() {
  try {
    console.log('🔐 Logging in as demo user...');

    // Login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@yatelomiro.com',
        password: 'demo2025'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const { token, user } = await loginResponse.json();
    console.log('✅ Logged in successfully');
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Get cashflow for 2025
    console.log('\n📊 Fetching cashflow data...');
    const cashflowResponse = await fetch(`${API_URL}/cashflow/2025`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!cashflowResponse.ok) {
      throw new Error('Failed to fetch cashflow');
    }

    const cashflow = await cashflowResponse.json();
    console.log('✅ Cashflow fetched');
    console.log(`   Year: ${cashflow.year}`);
    console.log(`   Months: ${cashflow.months?.length || 0}`);

    console.log('\n✅ Demo user ready for manual data entry!');
    console.log('\nNOTE: Use the web interface to add demo data interactively.');
    console.log(`Login at: http://91.98.113.188`);
    console.log(`Email: demo@yatelomiro.com`);
    console.log(`Password: demo2025`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if using Node 18+ with fetch support
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with native fetch support');
  console.log('Alternative: Use curl commands or Postman to add data via API');
  process.exit(1);
}

loginAndAddData();
