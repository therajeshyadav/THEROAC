const { sequelize } = require('./src/models');

async function checkUser() {
  try {
    const [results] = await sequelize.query(
      `SELECT id, "fullName", headline, location, about, skills, experiences, education 
       FROM users 
       WHERE email = 'ry8036739@gmail.com'`
    );
    console.log('User data from database:');
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkUser();
