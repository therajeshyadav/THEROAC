const { sequelize } = require('./src/models');

async function addFields() {
  try {
    console.log('Adding companyName and companyLogo fields...');
    
    await sequelize.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS "companyName" VARCHAR(255)
    `);
    console.log('✅ Added companyName');
    
    await sequelize.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS "companyLogo" TEXT
    `);
    console.log('✅ Added companyLogo');
    
    console.log('✅ All fields added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addFields();
