const Withdrawal = require('../models/Withdrawal');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');

// 1. Request Withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, paymentDetails } = req.body;
    const userId = req.user.id;
    const role = req.user.role; // 'doctor' or 'clinic'

    if (amount < 100) return res.status(400).json({ error: 'Minimum withdrawal amount is ₹100' });
    if (!paymentDetails) return res.status(400).json({ error: 'Payment details are required' });

    let providerType = role === 'clinic' ? 'clinic' : 'doctor';
    let entityId = null;
    let providerDoc = null;

    if (role === 'clinic') {
      providerDoc = await Clinic.findOne({ ownerId: userId });
    } else if (role === 'doctor') {
      providerDoc = await Doctor.findOne({ userId: userId, providerType: 'individual' });
    }

    if (!providerDoc) {
      return res.status(404).json({ error: 'Provider profile not found or ineligible for withdrawal' });
    }
    
    entityId = providerDoc._id;

    if (providerDoc.availableBalance < amount) {
      return res.status(400).json({ error: 'Insufficient available balance' });
    }

    // Deduct from available balance immediately to prevent double spending
    if (role === 'clinic') {
      await Clinic.findByIdAndUpdate(entityId, { $inc: { availableBalance: -amount } });
    } else {
      await Doctor.findByIdAndUpdate(entityId, { $inc: { availableBalance: -amount } });
    }

    const withdrawal = new Withdrawal({
      userId,
      providerType,
      entityId,
      amount,
      paymentDetails,
      status: 'pending'
    });

    await withdrawal.save();

    res.status(201).json({ message: 'Withdrawal request submitted successfully', withdrawal });
  } catch (err) {
    console.error('Withdrawal Request Error:', err);
    res.status(500).json({ error: 'Server error during withdrawal request' });
  }
};

// 2. Get Withdrawal History
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('Fetch Withdrawals Error:', err);
    res.status(500).json({ error: 'Server error fetching withdrawals' });
  }
};

// 3. Admin Get All Pending Withdrawals
exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' }).populate('userId', 'email firstName lastName').sort({ createdAt: 1 });
    res.json(withdrawals);
  } catch (err) {
    console.error('Admin Fetch Withdrawals Error:', err);
    res.status(500).json({ error: 'Server error fetching withdrawals' });
  }
};

// 4. Admin Process Withdrawal
exports.processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // 'processed' or 'rejected'

    if (!['processed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(404).json({ error: 'Withdrawal request not found or already processed' });
    }

    withdrawal.status = status;
    withdrawal.processedAt = new Date();
    
    if (status === 'rejected') {
      withdrawal.rejectionReason = rejectionReason;
      // Refund the balance
      if (withdrawal.providerType === 'clinic') {
        await Clinic.findByIdAndUpdate(withdrawal.entityId, { $inc: { availableBalance: withdrawal.amount } });
      } else {
        await Doctor.findByIdAndUpdate(withdrawal.entityId, { $inc: { availableBalance: withdrawal.amount } });
      }
    } else if (status === 'processed') {
      // Add to total withdrawn
      if (withdrawal.providerType === 'clinic') {
        await Clinic.findByIdAndUpdate(withdrawal.entityId, { $inc: { totalWithdrawn: withdrawal.amount } });
      } else {
        await Doctor.findByIdAndUpdate(withdrawal.entityId, { $inc: { totalWithdrawn: withdrawal.amount } });
      }
    }

    await withdrawal.save();
    res.json({ message: `Withdrawal marked as ${status}`, withdrawal });
  } catch (err) {
    console.error('Admin Process Withdrawal Error:', err);
    res.status(500).json({ error: 'Server error processing withdrawal' });
  }
};
