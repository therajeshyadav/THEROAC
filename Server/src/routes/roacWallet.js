const express = require('express');
const router = express.Router();

const walletController = require('../controllers/roacWalletController');
const ledgerController = require('../controllers/roacLedgerController');
const supplyController = require('../controllers/roacQuarterSupplyController');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/wallet', walletController.getWallet);
router.get('/ledger', ledgerController.getMyLedger);
router.get('/supply/current', requireAdmin, supplyController.getCurrentQuarter);
router.post('/supply/init', requireAdmin, supplyController.initQuarter);
router.post('/supply/bonus', requireAdmin, supplyController.addBonusSupply);

module.exports = router;
