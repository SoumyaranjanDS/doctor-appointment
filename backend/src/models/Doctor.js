const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
  clinic: {
    name: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
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
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
