// Debug script to check team size data from backend
const API_URL = 'http://localhost:4000/api';

async function debugEventTeamSize() {
  try {
    // Replace with actual token from localStorage
    const token = 'YOUR_TOKEN_HERE';
    
    console.log('🔍 Fetching events to check team size data...\n');
    
    const response = await fetch(`${API_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const events = await response.json();
      
      if (events.length > 0) {
        console.log('📋 Event Team Size Data:');
        console.log('========================\n');
        
        events.slice(0, 3).forEach((event, index) => {
          console.log(`Event ${index + 1}: ${event.title}`);
          console.log(`- ID: ${event.id}`);
          console.log(`- Min Team Size: ${event.minTeamSize} (type: ${typeof event.minTeamSize})`);
          console.log(`- Max Team Size: ${event.maxTeamSize} (type: ${typeof event.maxTeamSize})`);
          console.log(`- Event Type: ${event.categories?.[0] || 'N/A'}`);
          console.log('---');
        });
        
        // Test single event fetch
        const firstEvent = events[0];
        console.log(`\n🔍 Testing single event fetch for: ${firstEvent.title}`);
        
        const singleResponse = await fetch(`${API_URL}/events/${firstEvent.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (singleResponse.ok) {
          const singleEvent = await singleResponse.json();
          console.log('Single Event Data:');
          console.log(`- Min Team Size: ${singleEvent.minTeamSize} (type: ${typeof singleEvent.minTeamSize})`);
          console.log(`- Max Team Size: ${singleEvent.maxTeamSize} (type: ${typeof singleEvent.maxTeamSize})`);
          
          // Check if data is consistent
          const isConsistent = (
            firstEvent.minTeamSize === singleEvent.minTeamSize &&
            firstEvent.maxTeamSize === singleEvent.maxTeamSize
          );
          
          console.log(`\n✅ Data Consistency: ${isConsistent ? 'GOOD' : 'ISSUE FOUND'}`);
          
          if (!isConsistent) {
            console.log('❌ List vs Single fetch mismatch detected!');
          }
        }
        
      } else {
        console.log('❌ No events found');
      }
    } else {
      console.log('❌ Failed to fetch events:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

console.log('🚀 Event Team Size Debug Tool');
console.log('==============================');
console.log('⚠️  Replace YOUR_TOKEN_HERE with actual token');
console.log('📝 Get token: localStorage.getItem("token") in browser console\n');

// Uncomment to run
// debugEventTeamSize();