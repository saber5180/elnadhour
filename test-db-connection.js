const { Client } = require('pg');

// Test different common PostgreSQL configurations
const testConfigs = [
  {
    name: 'Default (no password)',
    config: { host: 'localhost', port: 5432, user: 'postgres', password: '', database: 'postgres' }
  },
  {
    name: 'Password: postgres',
    config: { host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'postgres' }
  },
  {
    name: 'Password: admin',
    config: { host: 'localhost', port: 5432, user: 'postgres', password: 'admin', database: 'postgres' }
  },
  {
    name: 'Password: password',
    config: { host: 'localhost', port: 5432, user: 'postgres', password: 'password', database: 'postgres' }
  }
];

async function testConnection(name, config) {
  const client = new Client(config);
  try {
    console.log(`Testing: ${name}...`);
    await client.connect();
    console.log(`✅ ${name} - SUCCESS!`);
    await client.end();
    return { success: true, config, name };
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}`);
    return { success: false, error: error.message, name };
  }
}

async function findWorkingConnection() {
  console.log('🔍 Testing PostgreSQL connections...\n');
  
  for (const test of testConfigs) {
    const result = await testConnection(test.name, test.config);
    if (result.success) {
      console.log('\n🎉 Found working connection!');
      console.log(`Configuration: ${result.name}`);
      console.log('Update your backend/.env file with:');
      console.log(`DB_USER=${result.config.user}`);
      console.log(`DB_PASSWORD=${result.config.password}`);
      console.log(`DB_HOST=${result.config.host}`);
      console.log(`DB_PORT=${result.config.port}`);
      
      console.log('\nAnd update setup-database.js with:');
      console.log(`user: '${result.config.user}',`);
      console.log(`password: '${result.config.password}',`);
      return result.config;
    }
  }
  
  console.log('\n❌ No working connection found.');
  console.log('\n💡 Solutions:');
  console.log('1. Make sure PostgreSQL is installed and running');
  console.log('2. Set a password for postgres user:');
  console.log('   psql -U postgres');
  console.log('   ALTER USER postgres PASSWORD \'newpassword\';');
  console.log('3. Or create a new user:');
  console.log('   CREATE USER elnadhour WITH PASSWORD \'elnadhour123\';');
  console.log('   ALTER USER elnadhour CREATEDB;');
  return null;
}

findWorkingConnection().catch(console.error);