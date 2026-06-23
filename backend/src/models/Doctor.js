const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Make optional so Clinics can create doctors without an immediate User account
    required: false,
    index: { unique: true, sparse: true }
  },
  providerType: {
    type: String,
    enum: ['individual', 'clinic_doctor'],
    required: true
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: function() { return this.providerType === 'clinic_doctor'; }
  },
  name: {
    type: String,
    required: true // Store name directly since clinic doctors might not have a userId yet
  },
  email: {
    type: String // Optional email to link later
  },
  specialities: [{
    type: String
  }],
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experienceYears: {
    type: Number,
    default: 0
  },
  bio: {
    type: String
  },
  consultationFee: {
    type: Number,
    required: true
  },
  availability: [{
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
      startTime: String, // e.g., "09:00"
      endTime: String    // e.g., "09:30"
    }]
  }],
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  documentUrl: {
    type: String,
    required: true // Cloudinary URL for verification document
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
