const { Event } = require('./src/models');

async function checkEvents() {
  try {
    console.log('🔍 Checking events in database...\n');
    
    const allEvents = await Event.findAll({
      attributes: ['id', 'title', 'approvalStatus', 'status', 'startDate'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📊 Total events in database: ${allEvents.length}\n`);
    
    if (allEvents.length === 0) {
      console.log('❌ No events found in database!');
      console.log('💡 Try running the seeders first:');
      console.log('   npx sequelize-cli db:seed --seed 20250105000001-five-test-events.js');
      return;
    }
    
    // Group by approval status
    const byApprovalStatus = allEvents.reduce((acc, event) => {
      acc[event.approvalStatus] = (acc[event.approvalStatus] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Events by approval status:');
    Object.entries(byApprovalStatus).forEach(([status, count]) => {
      const emoji = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '❌';
      console.log(`   ${emoji} ${status}: ${count}`);
    });
    
    console.log('\n📋 Event details:');
    allEvents.forEach((event, index) => {
      const statusEmoji = event.approvalStatus === 'approved' ? '✅' : 
                         event.approvalStatus === 'pending' ? '⏳' : '❌';
      console.log(`${index + 1}. ${statusEmoji} ${event.title}`);
      console.log(`   Approval: ${event.approvalStatus} | Status: ${event.status}`);
      console.log(`   Start: ${event.startDate}`);
      console.log('');
    });
    
    // Check specifically approved events
    const approvedEvents = allEvents.filter(e => e.approvalStatus === 'approved');
    console.log(`🎯 Events that SHOULD show on landing page: ${approvedEvents.length}`);
    
    if (approvedEvents.length === 0) {
      console.log('❌ No approved events found!');
      console.log('💡 This is why events are not showing on the landing page.');
      console.log('🔧 Solution: Admin needs to approve events in the admin dashboard.');
    } else {
      console.log('✅ Approved events exist - they should be visible on landing page.');
      console.log('🔍 If they\'re not showing, check the frontend API call.');
    }
    
  } catch (error) {
    console.error('❌ Error checking events:', error);
  } finally {
    process.exit(0);
  }
}

checkEvents();