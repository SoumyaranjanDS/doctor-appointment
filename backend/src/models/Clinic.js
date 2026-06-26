const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pinCode: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true // Cloudinary URL for verification document
  },
  clinicLicense: {
    type: String,
    required: true // Cloudinary URL for clinic license
  },
  adminIdProof: {
    type: String,
    required: true // Cloudinary URL for admin ID proof
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Clinic', clinicSchema);
