require('dotenv').config();
const { sequelize } = require('./src/models');

const removeRatingColumns = async () => {
  try {
    console.log('🔄 Starting to remove rating columns...\n');

    // Remove rating from job_applications table
    console.log('📋 Removing rating column from job_applications table...');
    await sequelize.query(`
      ALTER TABLE job_applications 
      DROP COLUMN IF EXISTS rating;
    `);
    console.log('✅ Rating column removed from job_applications\n');

    // Remove rating from talent_pipeline table
    console.log('📋 Removing rating column from talent_pipeline table...');
    await sequelize.query(`
      ALTER TABLE talent_pipeline 
      DROP COLUMN IF EXISTS rating;
    `);
    console.log('✅ Rating column removed from talent_pipeline\n');

    console.log('✅ All rating columns removed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing rating columns:', error);
    process.exit(1);
  }
};

removeRatingColumns();
