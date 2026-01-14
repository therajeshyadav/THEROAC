// Test the updated API call with perPage parameter
const API_BASE_URL = 'http://localhost:4000/api';

async function testEventsWithPagination() {
  try {
    console.log('🔍 Testing events API with pagination...\n');
    
    // Test default (should still be 20)
    console.log('📡 Testing default pagination:');
    const defaultResponse = await fetch(`${API_BASE_URL}/events`);
    const defaultData = await defaultResponse.json();
    console.log(`   Default: ${defaultData.length} events\n`);
    
    // Test with perPage=50
    console.log('📡 Testing with perPage=50:');
    const paginatedResponse = await fetch(`${API_BASE_URL}/events?perPage=50`);
    const paginatedData = await paginatedResponse.json();
    console.log(`   With perPage=50: ${paginatedData.length} events\n`);
    
    // Test with perPage=100 (should get all)
    console.log('📡 Testing with perPage=100:');
    const allResponse = await fetch(`${API_BASE_URL}/events?perPage=100`);
    const allData = await allResponse.json();
    console.log(`   With perPage=100: ${allData.length} events\n`);
    
    if (allData.length > 20) {
      console.log('✅ Fix working! Now getting more than 20 events.');
      console.log(`🎯 Total approved events available: ${allData.length}`);
    } else {
      console.log('❌ Still limited to 20 events. Check the backend pagination.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testEventsWithPagination();