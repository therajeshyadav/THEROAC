const { OrganizationMember, User } = require('./src/models');

async function cleanup() {
  try {
    console.log('Cleaning up removed/soft-deleted members...');
    
    // Find all soft-deleted members
    const softDeleted = await OrganizationMember.findAll({
      paranoid: false,
      where: { deletedAt: { [require('sequelize').Op.ne]: null } },
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }]
    });
    
    console.log(`Found ${softDeleted.length} soft-deleted members`);
    
    // Permanently delete them
    for (const member of softDeleted) {
      await member.destroy({ force: true });
      console.log(`  ✅ Permanently deleted: ${member.user?.email || 'Unknown'}`);
    }
    
    // Find all removed members (status = 'removed')
    const removedMembers = await OrganizationMember.findAll({
      where: { status: 'removed' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['email']
      }]
    });
    
    console.log(`\nFound ${removedMembers.length} removed members`);
    
    // Permanently delete them
    for (const member of removedMembers) {
      await member.destroy({ force: true });
      console.log(`  ✅ Permanently deleted: ${member.user?.email || 'Unknown'}`);
    }
    
    console.log('\n✅ Cleanup complete! You can now re-invite these users.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
