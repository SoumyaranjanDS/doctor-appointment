const express = require('express');
const router = express.Router();
const { requireUser } = require('../middlewares/authMiddleware');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const User = require('../models/User');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/profile', requireUser, async (req, res) => {
  try {
    let isProfileCompleted = false;
    let approvalStatus = 'approved';

    if (req.user.role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const doctor = await Doctor.findOne({ userId: req.user._id });
      isProfileCompleted = !!doctor;
      if (doctor) approvalStatus = doctor.approvalStatus;
    } else if (req.user.role === 'clinic') {
      const Clinic = require('../models/Clinic');
      const clinic = await Clinic.findOne({ ownerId: req.user._id });
      isProfileCompleted = !!clinic;
      if (clinic) approvalStatus = clinic.approvalStatus;
    } else {
      isProfileCompleted = true; // patient is inherently complete
    }

    res.json({
      _id: req.user._id,
      clerkId: req.user.clerkId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      profileImageUrl: req.user.profileImageUrl,
      isProfileCompleted,
      approvalStatus
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Upload Medical Record
router.post('/medical-records', requireUser, upload.single('record'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Record title is required' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'doctor-appointments/medical-records');
    
    const user = await User.findById(req.user._id);
    const newRecord = {
      title,
      fileUrl: result.secure_url
    };
    
    user.medicalRecords.push(newRecord);
    await user.save();

    res.json({ message: 'Medical record uploaded successfully', record: user.medicalRecords[user.medicalRecords.length - 1] });
  } catch (error) {
    console.error('Error uploading medical record:', error);
    res.status(500).json({ error: 'Server error uploading record' });
  }
});

// Delete Medical Record
router.delete('/medical-records/:recordId', requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.medicalRecords = user.medicalRecords.filter(r => r._id.toString() !== req.params.recordId);
    await user.save();
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ error: 'Server error deleting record' });
  }
});

// Get Medical Records
router.get('/medical-records', requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.medicalRecords || []);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ error: 'Server error fetching records' });
  }
});

module.exports = router;
