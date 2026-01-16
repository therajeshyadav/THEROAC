const { sequelize } = require('./src/models');

async function addStagesColumn() {
  try {
    // Add stages column to jobs table
    await sequelize.query(`
      ALTER TABLE jobs 
      ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT NULL;
    `);
    console.log('✅ Added stages column to jobs table');

    // Add stages column to hub_content table
    await sequelize.query(`
      ALTER TABLE hub_content 
      ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT NULL;
    `);
    console.log('✅ Added stages column to hub_content table');

    // Add currentStage and stageSubmissions to job_applications
    await sequelize.query(`
      ALTER TABLE job_applications 
      ADD COLUMN IF NOT EXISTS "currentStage" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "stageSubmissions" JSONB DEFAULT NULL;
    `);
    console.log('✅ Added stage tracking columns to job_applications table');

    // Add currentStage and stageSubmissions to hub_content_applications
    await sequelize.query(`
      ALTER TABLE hub_content_applications 
      ADD COLUMN IF NOT EXISTS "currentStage" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "stageSubmissions" JSONB DEFAULT NULL;
    `);
    console.log('✅ Added stage tracking columns to hub_content_applications table');

    console.log('\n🎉 All columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addStagesColumn();
