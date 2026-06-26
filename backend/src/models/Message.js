const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderModel: {
    type: String,
    enum: ['User', 'Clinic'], // Clinic owners might send messages as the clinic
    default: 'User'
  },
  text: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

messageSchema.index({ appointmentId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
