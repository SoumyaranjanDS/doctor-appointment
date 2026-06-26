const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerType: {
    type: String,
    enum: ['clinic', 'doctor'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // References Clinic or Doctor depending on providerType
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'rejected'],
    default: 'pending'
  },
  paymentDetails: {
    type: String,
    required: true
  },
  rejectionReason: {
    type: String
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
