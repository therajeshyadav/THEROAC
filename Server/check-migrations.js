const { sequelize } = require('./src/models');

async function check() {
  try {
    const [results] = await sequelize.query('SELECT * FROM "SequelizeMeta" ORDER BY name DESC LIMIT 10');
    console.log('Recent migrations:');
    results.forEach(r => console.log('  -', r.name));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
