const { User } = require('./src/models');

async function checkUserBadges() {
  try {
    const users = await User.findAll({
      where: { profileQuizCompleted: true },
      attributes: ['id', 'fullName', 'profileQuizCompleted', 'badges']
    });
    
    console.log('Users who completed quiz:');
    users.forEach(user => {
      console.log(`- ${user.fullName} (ID: ${user.id})`);
      console.log(`  Quiz completed: ${user.profileQuizCompleted}`);
      console.log(`  Badges: ${JSON.stringify(user.badges)}`);
      console.log('---');
    });
    
    if (users.length === 0) {
      console.log('No users found who completed the quiz');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUserBadges();