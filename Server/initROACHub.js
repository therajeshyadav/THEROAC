// Script to initialize ROAC Prime Hub entry for testing
const { HubContent, User } = require('./src/models');

async function initROACHub() {
  try {
    // Check if entry already exists
    const existingEntry = await HubContent.findOne({
      where: { 
        title: 'ROAC Talent Prime Hub',
        contentType: 'opportunity'
      }
    });

    if (existingEntry) {
      console.log('ROAC Prime Hub entry already exists:', existingEntry.id);
      console.log('Approval Status:', existingEntry.approvalStatus);
      return;
    }

    // Find an admin user
    const adminUser = await User.findOne({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    console.log('Using admin user:', adminUser.fullName || adminUser.email);

    // Create new entry
    const hubEntry = await HubContent.create({
      title: 'ROAC Talent Prime Hub',
      slug: 'roac-talent-prime-hub',
      description: 'Your central platform to connect, grow, and unlock exclusive Roac experiences.',
      content: 'ROAC Talent Prime Hub is the central platform for connecting talent with opportunities.',
      contentType: 'opportunity',
      category: 'career-tips',
      status: 'published',
      approvalStatus: 'pending',
      createdBy: adminUser.id
    });

    console.log('ROAC Prime Hub entry created successfully:', hubEntry.id);
    console.log('Status: Pending approval');
  } catch (error) {
    console.error('Error initializing ROAC Hub:', error);
  }
}

// Run if called directly
if (require.main === module) {
  initROACHub().then(() => {
    console.log('Script completed');
    process.exit(0);
  }).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { initROACHub };