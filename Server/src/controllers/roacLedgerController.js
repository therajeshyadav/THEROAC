const { RoacWallet, RoacLedger } = require('../models');

exports.getMyLedger = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const wallet = await RoacWallet.findOne({
      where: { userId }
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const ledger = await RoacLedger.findAll({
      where: { walletId: wallet.id },
      order: [['createdAt', 'DESC']],
      limit
    });

    res.json({
      items: ledger.map(l => ({
        id: l.id,
        type: l.type,
        amount: l.amount,
        reason: l.reasonCode,
        quarter: l.quarter,
        createdAt: l.createdAt
      }))
    });

  } catch (err) {
    console.error('ROAC ledger error:', err);
    res.status(500).json({ message: 'Failed to load ledger' });
  }
};
