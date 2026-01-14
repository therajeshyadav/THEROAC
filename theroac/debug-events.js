// Simple test to check if the frontend can fetch events
const API_BASE_URL = 'http://localhost:4000/api';

async function testEventsFetch() {
  try {
    console.log('🔍 Testing frontend events fetch...\n');
    
    const response = await fetch(`${API_BASE_URL}/events`);
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (!response.ok) {
      console.log('❌ Response not ok');
      return;
    }
    
    const data = await response.json();
    console.log('📊 Events received:', data.length);
    
    if (data.length === 0) {
      console.log('❌ No events in response');
    } else {
      console.log('✅ Events found! First 3:');
      data.slice(0, 3).forEach((event, index) => {
        console.log(`${index + 1}. ${event.title}`);
        console.log(`   Approval: ${event.approvalStatus}`);
        console.log(`   Start: ${event.startDate}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

testEventsFetch();