const { sequelize } = require('./src/models');

async function markComplete() {
  try {
    await sequelize.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES ('20260215000000-add-unified-edit-fields.js') 
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Migration marked as completed in SequelizeMeta table');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

markComplete();
