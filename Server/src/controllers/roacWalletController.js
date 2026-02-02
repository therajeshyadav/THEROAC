const { RoacWallet, RoacLedger } = require('../models');

exports.getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const wallet = await RoacWallet.findOne({
      where: { userId }
    });

    if (!wallet) {
      return res.status(404).json({ message: 'ROAC wallet not found' });
    }

    const [earned, spent] = await Promise.all([
      RoacLedger.sum('amount', {
        where: { walletId: wallet.id, type: 'EARN' }
      }),
      RoacLedger.sum('amount', {
        where: { walletId: wallet.id, type: 'SPEND' }
      })
    ]);

    res.json({
      walletId: wallet.id,
      balance: wallet.balance,
      totalEarned: earned || 0,
      totalSpent: Math.abs(spent || 0),
      isFrozen: wallet.isFrozen
    });

  } catch (err) {
    console.error('ROAC wallet error:', err);
    res.status(500).json({ message: 'Failed to load wallet' });
  }
};
