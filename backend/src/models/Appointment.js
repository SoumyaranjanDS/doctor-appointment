const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic' // Optional, populated if doctor is a clinic_doctor
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'awaiting_payment', 'confirmed', 'pending_completion', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  reasonForVisit: {
    type: String
  },
  meetingLink: {
    type: String // For virtual appointments
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  stripeSessionId: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Unique index removed because it conflicts with cancelled/completed appointments.
// We handle double-booking validation inside the controller.

module.exports = mongoose.model('Appointment', appointmentSchema);
