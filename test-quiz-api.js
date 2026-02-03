// Test script to check if quiz API endpoints are working
const API_BASE_URL = 'http://localhost:4000/api';

async function testQuizAPI() {
  try {
    console.log('🧠 Testing Quiz API endpoints...\n');
    
    // You'll need to replace these with actual values from your database
    const eventId = 'your-event-id-here'; // Replace with actual event ID
    const stageIndex = 0; // First stage
    
    console.log(`📡 Testing: GET /events/${eventId}/stages/${stageIndex}/quiz/status`);
    
    const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/stages/${stageIndex}/quiz/status`, {
      headers: {
        'Authorization': `Bearer your-token-here` // Replace with actual token
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Quiz status data:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Error response:', error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Uncomment and run this with actual values to test
// testQuizAPI();

console.log('📝 To test the quiz API:');
console.log('1. Replace eventId with actual event ID from database');
console.log('2. Replace token with actual user token');
console.log('3. Uncomment testQuizAPI() call');
console.log('4. Run: node test-quiz-api.js');