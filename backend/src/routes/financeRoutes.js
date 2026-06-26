const express = require('express');
const router = express.Router();
const { requireUser, requireAdmin } = require('../middlewares/authMiddleware');
const {
  requestWithdrawal,
  getWithdrawalHistory,
  getPendingWithdrawals,
  processWithdrawal
} = require('../controllers/financeController');

// User routes
router.post('/withdraw', requireUser, requestWithdrawal);
router.get('/withdrawals', requireUser, getWithdrawalHistory);

// Admin routes
router.get('/admin/withdrawals', requireAdmin, getPendingWithdrawals);
router.put('/admin/withdrawals/:id/process', requireAdmin, processWithdrawal);

module.exports = router;
