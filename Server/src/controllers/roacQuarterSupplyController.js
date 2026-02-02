const { RoacQuarterSupply } = require('../models');

function getCurrentQuarterMeta() {
  const year = new Date().getFullYear();
  const q = Math.ceil((new Date().getMonth() + 1) / 3);
  return { year, quarter: `Q${q}` };
}

exports.getCurrentQuarter = async (req, res) => {
  const { year, quarter } = getCurrentQuarterMeta();

  const supply = await RoacQuarterSupply.findOne({
    where: { year, quarter }
  });

  res.json(supply || { year, quarter, active: false });
};

exports.initQuarter = async (req, res) => {
  const { baseCap } = req.body;
  const { year, quarter } = getCurrentQuarterMeta();

  if (!baseCap || baseCap <= 0) {
    return res.status(400).json({ message: 'Invalid base cap' });
  }

  const [supply, created] = await RoacQuarterSupply.findOrCreate({
    where: { year, quarter },
    defaults: {
      baseCap,
      bonusCap: 0,
      distributed: 0,
      isActive: true
    }
  });

  res.json({
    created,
    supply
  });
};

exports.addBonusSupply = async (req, res) => {
  const { amount } = req.body;
  const { year, quarter } = getCurrentQuarterMeta();

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid bonus amount' });
  }

  const supply = await RoacQuarterSupply.findOne({
    where: { year, quarter }
  });

  if (!supply) {
    return res.status(404).json({ message: 'Quarter not initialized' });
  }

  await supply.increment({ bonusCap: amount });

  res.json({
    message: 'Bonus supply added',
    totalCap: supply.baseCap + supply.bonusCap
  });
};
