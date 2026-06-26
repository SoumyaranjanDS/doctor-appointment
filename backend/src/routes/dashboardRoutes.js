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
      const doctor = await Doctor.findOne({ userId: userId });
      if (!doctor) {
        return res.json({ upcoming: 0, completed: 0, total: 0 }); // No profile yet
      }
      query = { doctorId: doctor._id };
    } else if (role === 'clinic') {
      const clinic = await Clinic.findOne({ ownerId: userId });
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
    
    let extraStats = {};
    if (role === 'clinic') {
      const clinic = await Clinic.findOne({ ownerId: userId });
      
      const completedRevenue = allAppointments
        .filter(app => app.status === 'completed' && app.paymentStatus === 'paid')
        .reduce((sum, app) => sum + app.amount, 0);

      const pendingRevenue = allAppointments
        .filter(app => app.status !== 'completed' && app.paymentStatus === 'paid')
        .reduce((sum, app) => sum + app.amount, 0);
        
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const revenueData = last7Days.map(date => {
        const dayRevenue = allAppointments
          .filter(app => app.status === 'completed' && app.paymentStatus === 'paid' && new Date(app.date).toISOString().split('T')[0] === date)
          .reduce((sum, app) => sum + app.amount, 0);
        return { date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), amount: dayRevenue };
      });

      extraStats = {
        totalRevenue: completedRevenue,
        pendingRevenue: pendingRevenue,
        availableBalance: clinic.availableBalance || 0,
        totalWithdrawn: clinic.totalWithdrawn || 0,
        hideRevenue: false,
        revenueData
      };
    } else if (role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: userId });
      if (doctor && doctor.providerType !== 'clinic_doctor') {
        const completedRevenue = allAppointments
          .filter(app => app.status === 'completed' && app.paymentStatus === 'paid')
          .reduce((sum, app) => sum + app.amount, 0);

        const pendingRevenue = allAppointments
          .filter(app => app.status !== 'completed' && app.paymentStatus === 'paid')
          .reduce((sum, app) => sum + app.amount, 0);

        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const revenueData = last7Days.map(date => {
          const dayRevenue = allAppointments
            .filter(app => app.status === 'completed' && app.paymentStatus === 'paid' && new Date(app.date).toISOString().split('T')[0] === date)
            .reduce((sum, app) => sum + app.amount, 0);
          return { date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), amount: dayRevenue };
        });

        extraStats = {
          totalRevenue: completedRevenue,
          pendingRevenue: pendingRevenue,
          availableBalance: doctor.availableBalance || 0,
          totalWithdrawn: doctor.totalWithdrawn || 0,
          hideRevenue: false,
          revenueData
        };
      }
    }

    res.json({
      upcoming,
      completed,
      total: allAppointments.length,
      ...extraStats
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error fetching dashboard stats' });
  }
});

router.get('/clinic-doctors', requireUser, async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    if (role !== 'clinic') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const clinic = await Clinic.findOne({ ownerId: userId });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const doctors = await Doctor.find({ clinicId: clinic._id, providerType: 'clinic_doctor' }).sort({ createdAt: -1 });
    res.json({ doctors, clinicId: clinic._id });
  } catch (error) {
    console.error('Error fetching clinic doctors:', error);
    res.status(500).json({ error: 'Server error fetching clinic doctors' });
  }
});

router.get('/clinic-doctors/:doctorId/financials', requireUser, async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    if (role !== 'clinic') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const clinic = await Clinic.findOne({ ownerId: userId });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const doctorId = req.params.doctorId;
    
    // Verify doctor belongs to clinic
    const doctor = await Doctor.findOne({ _id: doctorId, clinicId: clinic._id, providerType: 'clinic_doctor' });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found in your clinic' });
    }

    // Get completed and paid appointments for this doctor
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      status: 'completed',
      paymentStatus: 'paid'
    }).populate('patientId', 'firstName lastName email').sort({ date: -1 });

    const totalRevenue = appointments.reduce((sum, app) => sum + app.amount, 0);

    res.json({
      doctorName: doctor.name,
      totalRevenue,
      patientPayments: appointments.map(app => ({
        id: app._id,
        patientName: `${app.patientId?.firstName} ${app.patientId?.lastName}`,
        amount: app.amount,
        date: app.date
      }))
    });
  } catch (error) {
    console.error('Error fetching doctor financials:', error);
    res.status(500).json({ error: 'Server error fetching doctor financials' });
  }
});

module.exports = router;
