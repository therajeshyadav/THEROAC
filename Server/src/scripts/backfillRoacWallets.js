require('dotenv').config();
const sequelize = require('../config/database');
const { User, RoacWallet } = require('../models');

async function backfillWallets() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const usersWithoutWallet = await User.findAll({
      attributes: ['id'],
      include: [{
        model: RoacWallet,
        required: false
      }],
      where: {
        '$RoacWallet.id$': null
      }
    });

    console.log(`Found ${usersWithoutWallet.length} users without wallet`);

    for (const user of usersWithoutWallet) {
      await RoacWallet.create({
        userId: user.id
      });
    }

    console.log('ROAC wallet backfill completed');
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
}

backfillWallets();
