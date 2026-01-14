// Script to create mock event teams for testing evaluation tab
const { EventTeam, EventTeamMember, Event, User } = require('./Server/src/models');

async function createMockTeams() {
  try {
    console.log('🔍 Creating mock event teams...');
    
    // Find an existing event (replace with actual event ID)
    const event = await Event.findOne({
      where: { title: { [require('sequelize').Op.iLike]: '%hackathon%' } }
    });
    
    if (!event) {
      console.log('❌ No hackathon event found. Please create an event first.');
      return;
    }
    
    console.log(`✅ Found event: ${event.title} (${event.id})`);
    
    // Find some users (replace with actual user IDs)
    const users = await User.findAll({ limit: 6 });
    
    if (users.length < 3) {
      console.log('❌ Need at least 3 users to create teams.');
      return;
    }
    
    // Create Team 1
    const team1 = await EventTeam.create({
      eventId: event.id,
      teamName: 'Code Warriors',
      leaderId: users[0].id,
      maxMembers: 4
    });
    
    // Add members to Team 1
    await EventTeamMember.bulkCreate([
      { teamId: team1.id, eventId: event.id, userId: users[0].id, role: 'Leader' },
      { teamId: team1.id, eventId: event.id, userId: users[1].id, role: 'Developer' },
      { teamId: team1.id, eventId: event.id, userId: users[2].id, role: 'Designer' }
    ]);
    
    // Create Team 2
    const team2 = await EventTeam.create({
      eventId: event.id,
      teamName: 'Tech Innovators',
      leaderId: users[3].id,
      maxMembers: 4
    });
    
    // Add members to Team 2
    await EventTeamMember.bulkCreate([
      { teamId: team2.id, eventId: event.id, userId: users[3].id, role: 'Leader' },
      { teamId: team2.id, eventId: event.id, userId: users[4].id, role: 'Full Stack Developer' }
    ]);
    
    // Create Team 3 (if enough users)
    if (users.length >= 6) {
      const team3 = await EventTeam.create({
        eventId: event.id,
        teamName: 'Digital Pioneers',
        leaderId: users[5].id,
        maxMembers: 3
      });
      
      await EventTeamMember.create({
        teamId: team3.id, 
        eventId: event.id, 
        userId: users[5].id, 
        role: 'Solo Developer'
      });
    }
    
    console.log('✅ Mock teams created successfully!');
    console.log('📋 Teams created:');
    console.log('   - Code Warriors (3 members)');
    console.log('   - Tech Innovators (2 members)');
    console.log('   - Digital Pioneers (1 member)');
    
  } catch (error) {
    console.error('❌ Error creating mock teams:', error);
  }
}

// Run the script
createMockTeams().then(() => {
  console.log('🏁 Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});