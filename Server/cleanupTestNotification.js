const { Notification } = require('./src/models');

async function cleanup() {
  try {
    console.log('Cleaning up test notifications...');
    
    const deleted = await Notification.destroy({
      where: {
        title: 'Test Organization Invitation'
      },
      force: true // Permanently delete
    });
    
    console.log(`✅ Deleted ${deleted} test notification(s)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
