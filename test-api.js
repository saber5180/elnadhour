const axios = require('axios');

async function testAPI() {
  console.log('🔍 Testing El Nadhour API...\n');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.data.message);
    
    // Test categories endpoint
    console.log('\nTesting categories endpoint...');
    const categoriesResponse = await axios.get('http://localhost:5000/api/categories');
    console.log('✅ Categories found:', categoriesResponse.data.length);
    
    if (categoriesResponse.data.length > 0) {
      console.log('📋 Categories list:');
      categoriesResponse.data.forEach(cat => {
        console.log(`   - ${cat.name} (ID: ${cat.id})`);
      });
    } else {
      console.log('⚠️  No categories found in database');
    }
    
    // Test menu items endpoint
    console.log('\nTesting menu items endpoint...');
    const menuResponse = await axios.get('http://localhost:5000/api/menu-items');
    console.log('✅ Menu items found:', menuResponse.data.length);
    
    if (menuResponse.data.length > 0) {
      console.log('🍽️  Sample menu items:');
      menuResponse.data.slice(0, 3).forEach(item => {
        console.log(`   - ${item.name} (${item.price}€)`);
      });
    } else {
      console.log('⚠️  No menu items found in database');
    }
    
    console.log('\n🎉 API is working correctly!');
    console.log('🌐 You can now access:');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Admin: http://localhost:3000/admin');
    console.log('   - Login: admin@elnadhour.com / admin123');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure backend server is running on port 5000');
      console.log('   Run: cd backend && npm run dev');
    }
  }
}

testAPI();