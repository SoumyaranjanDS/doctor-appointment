const express = require('express');
const router = express.Router();
const { requireUser } = require('../middlewares/authMiddleware');

router.get('/profile', requireUser, async (req, res) => {
  try {
    let isProfileCompleted = false;
    if (req.user.role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const doctor = await Doctor.findOne({ user: req.user._id });
      isProfileCompleted = !!doctor;
    } else if (req.user.role === 'clinic') {
      const Clinic = require('../models/Clinic');
      const clinic = await Clinic.findOne({ user: req.user._id });
      isProfileCompleted = !!clinic;
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
      isProfileCompleted
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

module.exports = router;
