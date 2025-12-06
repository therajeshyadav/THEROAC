const { Notification, User, Organization } = require('./src/models');

async function testNotification() {
  try {
    console.log('Testing notification creation...');
    
    // Find a test user (you can replace with actual email)
    const testUser = await User.findOne({ where: { email: '22be0033@sipnaengg.ac.in' } });
    
    if (!testUser) {
      console.log('❌ Test user not found. Please use an actual user email.');
      process.exit(1);
    }
    
    console.log('✅ Found user:', testUser.fullName || testUser.email);
    
    // Create a test notification
    const notification = await Notification.create({
      userId: testUser.id,
      type: 'organization_invite',
      title: 'Test Organization Invitation',
      message: 'This is a test invitation notification',
      data: { 
        organizationId: 'test-org-id', 
        organizationName: 'Test Organization',
        inviterName: 'Test Inviter',
        memberId: 'test-member-id'
      },
      actionUrl: '/notifications',
      read: false
    });
    
    console.log('✅ Notification created:', notification.id);
    
    // Fetch user's notifications
    const userNotifications = await Notification.findAll({
      where: { userId: testUser.id },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    console.log(`\n📬 User has ${userNotifications.length} notifications:`);
    userNotifications.forEach(n => {
      console.log(`  - ${n.title} (${n.read ? 'read' : 'unread'})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testNotification();
