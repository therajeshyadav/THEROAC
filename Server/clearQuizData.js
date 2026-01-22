const { User, ProfileQuizSubmission } = require('./src/models');

async function clearQuizData() {
  try {
    console.log('Clearing existing quiz data...');
    
    // Delete all profile quiz submissions
    await ProfileQuizSubmission.destroy({
      where: {},
      truncate: true
    });
    console.log('✅ Deleted all profile quiz submissions');
    
    // Reset user quiz completion status and badges
    const updatedUsers = await User.update({
      profileQuizCompleted: false,
      profileQuizCompletedAt: null,
      badges: []
    }, {
      where: {
        profileQuizCompleted: true
      }
    });
    
    console.log(`✅ Reset quiz status for ${updatedUsers[0]} users`);
    console.log('✅ All existing quiz data cleared successfully!');
    console.log('📝 Users can now take the new RTE assessment with updated calculation.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing quiz data:', error);
    process.exit(1);
  }
}

clearQuizData();