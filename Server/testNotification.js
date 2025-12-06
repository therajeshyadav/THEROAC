// Test script to create a sample notification
// Run with: node testNotification.js <userId>

require('dotenv').config();
const { Notification, User, sequelize } = require('./src/models');

async function createTestNotification(userId) {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('❌ User not found with ID:', userId);
      process.exit(1);
    }

    console.log(`📧 Creating test notification for: ${user.fullName || user.name}`);

    // Create test notification
    const notification = await Notification.create({
      userId: userId,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working!',
      data: { test: true },
      actionUrl: '/dashboard',
      priority: 'medium',
      read: false
    });

    console.log('✅ Test notification created successfully!');
    console.log('Notification ID:', notification.id);
    console.log('\nNow check your dashboard - you should see:');
    console.log('1. Badge count increased');
    console.log('2. Notification in the dropdown');
    console.log('3. Green connection indicator');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get userId from command line
const userId = process.argv[2];

if (!userId) {
  console.log('Usage: node testNotification.js <userId>');
  console.log('\nTo find your userId:');
  console.log('1. Login to your app');
  console.log('2. Open browser console');
  console.log('3. Type: localStorage.getItem("token")');
  console.log('4. Decode the JWT token to get your user ID');
  console.log('\nOr run this SQL query:');
  console.log('SELECT id, email, "fullName" FROM users LIMIT 5;');
  process.exit(1);
}

createTestNotification(userId);
