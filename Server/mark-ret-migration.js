const { sequelize } = require('./src/models');

async function markComplete() {
  try {
    await sequelize.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES ('20260208000000-create-ret-submissions') 
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ RET Migration marked as completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

markComplete();
