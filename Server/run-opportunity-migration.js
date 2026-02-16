const { sequelize } = require('./src/models');

async function runMigration() {
  try {
    console.log('Running opportunity fields migration...');
    
    // Add opportunityType
    await sequelize.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS "opportunityType" VARCHAR(255)
    `);
    console.log('✅ Added opportunityType');
    
    // Add opportunitySubType
    await sequelize.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS "opportunitySubType" VARCHAR(255)
    `);
    console.log('✅ Added opportunitySubType');
    
    // Add organizationName
    await sequelize.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS "organizationName" VARCHAR(255)
    `);
    console.log('✅ Added organizationName');
    
    // Add participationType
    await sequelize.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS "participationType" VARCHAR(255) DEFAULT 'individual'
    `);
    console.log('✅ Added participationType');
    
    // Add mode
    await sequelize.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS "mode" VARCHAR(255) DEFAULT 'online'
    `);
    console.log('✅ Added mode');
    
    // Mark migration as complete
    await sequelize.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES ('20260215000001-add-opportunity-type-fields.js') 
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Migration marked as completed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

runMigration();
