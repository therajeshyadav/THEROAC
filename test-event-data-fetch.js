// Test script to check if event data is being fetched properly
const API_URL = 'http://localhost:4000/api';

async function testEventDataFetch() {
  try {
    // Get token from localStorage (you'll need to replace this with actual token)
    const token = 'YOUR_TOKEN_HERE'; // Replace with actual token
    
    const response = await fetch(`${API_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const events = await response.json();
      console.log('✅ Events fetched successfully');
      
      if (events.length > 0) {
        const firstEvent = events[0];
        console.log('\n📋 First Event Data:');
        console.log('- ID:', firstEvent.id);
        console.log('- Title:', firstEvent.title);
        console.log('- Start Date:', firstEvent.startDate);
        console.log('- End Date:', firstEvent.endDate);
        console.log('- Registration Deadline:', firstEvent.registrationDeadline);
        console.log('- Max Participants:', firstEvent.maxParticipants);
        console.log('- Banner Image:', firstEvent.bannerImage ? 'Present' : 'Missing');
        console.log('- Thumbnail Image:', firstEvent.thumbnailImage ? 'Present' : 'Missing');
        console.log('- Prizes:', firstEvent.prizes ? firstEvent.prizes.length + ' prizes' : 'No prizes');
        console.log('- Eligibility:', firstEvent.eligibility ? 'Present' : 'Missing');
        
        // Test single event fetch
        const singleResponse = await fetch(`${API_URL}/events/${firstEvent.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (singleResponse.ok) {
          const singleEvent = await singleResponse.json();
          console.log('\n✅ Single event fetch successful');
          console.log('- Same data consistency:', JSON.stringify(firstEvent) === JSON.stringify(singleEvent));
        }
      }
    } else {
      console.log('❌ Failed to fetch events:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

console.log('🔍 Testing Event Data Fetch...');
console.log('⚠️  Please replace YOUR_TOKEN_HERE with actual token from browser localStorage');
console.log('📝 To get token: Open browser console -> localStorage.getItem("token")');

// Uncomment to run (after adding token)
// testEventDataFetch();