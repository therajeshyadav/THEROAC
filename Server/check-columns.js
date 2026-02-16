const { sequelize } = require('./src/models');

async function checkColumns() {
  try {
    const [jobsColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'jobs' 
      AND column_name IN ('workingDays', 'jobSchedule', 'applicationSettings', 'hideOpenings')
    `);
    
    const [eventsColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('prizesList', 'paymentSettings', 'registrationSettings')
    `);
    
    console.log('\n✅ Jobs table columns:', jobsColumns.map(r => r.column_name));
    console.log('✅ Events table columns:', eventsColumns.map(r => r.column_name));
    
    if (jobsColumns.length > 0 || eventsColumns.length > 0) {
      console.log('\n✅ Migration already applied! Columns exist in database.');
    } else {
      console.log('\n❌ Migration not applied yet. Run: npx sequelize-cli db:migrate');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkColumns();
