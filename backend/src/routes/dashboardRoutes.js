const express = require('express');
const router = express.Router();
const { requireUser } = require('../middlewares/authMiddleware');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');

router.get('/stats', requireUser, async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    
    let query = {};
    
    // Depending on the role, we search by different IDs in the Appointment model
    if (role === 'patient') {
      query = { patientId: userId };
    } else if (role === 'doctor') {
      const doctor = await Doctor.findOne({ user: userId });
      if (!doctor) {
        return res.json({ upcoming: 0, completed: 0, total: 0 }); // No profile yet
      }
      query = { doctorId: doctor._id };
    } else if (role === 'clinic') {
      const clinic = await Clinic.findOne({ user: userId });
      if (!clinic) {
        return res.json({ upcoming: 0, completed: 0, total: 0 }); // No profile yet
      }
      query = { clinicId: clinic._id };
    } else {
      // admin or unknown
      return res.json({ upcoming: 0, completed: 0, total: 0 });
    }

    // Since we don't have active dates yet, we'll just mock upcoming vs completed based on status
    const allAppointments = await Appointment.find(query);
    
    const upcoming = allAppointments.filter(app => app.status === 'pending' || app.status === 'confirmed').length;
    const completed = allAppointments.filter(app => app.status === 'completed').length;
    
    res.json({
      upcoming,
      completed,
      total: allAppointments.length
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error fetching dashboard stats' });
  }
});

module.exports = router;
