const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');

// Get all pending applications
const getApplications = async (req, res) => {
  try {
    const individualDoctors = await Doctor.find({ providerType: 'individual', approvalStatus: 'pending' }).populate('userId', 'firstName lastName email');
    const clinics = await Clinic.find({ approvalStatus: 'pending' }).populate('ownerId', 'firstName lastName email');
    const clinicDoctors = await Doctor.find({ providerType: 'clinic_doctor', approvalStatus: 'pending' }).populate('clinicId', 'name');

    res.json({
      individualDoctors,
      clinics,
      clinicDoctors
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({ error: 'Server error while fetching applications' });
  }
};

// Approve an application
const approveApplication = async (req, res) => {
  try {
    const { type, id } = req.params; // type = 'doctor' | 'clinic'

    if (type === 'clinic') {
      const clinic = await Clinic.findByIdAndUpdate(id, { approvalStatus: 'approved' }, { new: true });
      if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
      return res.json({ message: 'Clinic approved successfully', data: clinic });
    } else if (type === 'doctor') {
      const doctor = await Doctor.findByIdAndUpdate(id, { approvalStatus: 'approved' }, { new: true });
      if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

      // If they are an individual doctor, update their User role to 'doctor'
      if (doctor.providerType === 'individual' && doctor.userId) {
        const User = require('../models/User');
        await User.findByIdAndUpdate(doctor.userId, { role: 'doctor' });
      } else if (doctor.providerType === 'clinic_doctor') {
        const User = require('../models/User');
        const bcrypt = require('bcryptjs');

        // Check if email already exists
        const existingUser = await User.findOne({ email: doctor.email });
        if (existingUser) {
          return res.status(400).json({ error: 'A user with this email already exists' });
        }

        // Generate 6-char alphanumeric password
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let generatedPassword = '';
        for (let i = 0; i < 6; i++) {
          generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        // Create User account
        const newUser = new User({
          email: doctor.email,
          password: hashedPassword,
          firstName: doctor.name,
          role: 'doctor'
        });
        await newUser.save();

        // Update Doctor document
        doctor.approvalStatus = 'approved';
        doctor.userId = newUser._id;
        doctor.generatedPassword = generatedPassword;
        await doctor.save();
      }

      return res.json({ message: 'Doctor approved successfully', data: doctor });
    }

    res.status(400).json({ error: 'Invalid application type' });
  } catch (error) {
    console.error('Approve Application Error:', error);
    res.status(500).json({ error: 'Server error during approval' });
  }
};

// Reject an application
const rejectApplication = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;

    if (type === 'clinic') {
      const clinic = await Clinic.findByIdAndUpdate(id, { approvalStatus: 'rejected', rejectionReason: reason }, { new: true });
      if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
      return res.json({ message: 'Clinic rejected', data: clinic });
    } else if (type === 'doctor') {
      const doctor = await Doctor.findByIdAndUpdate(id, { approvalStatus: 'rejected', rejectionReason: reason }, { new: true });
      if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
      return res.json({ message: 'Doctor rejected', data: doctor });
    }

    res.status(400).json({ error: 'Invalid application type' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all appointments globally and platform revenue
const getAppointments = async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({})
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'name email specialities')
      .sort({ date: -1, startTime: -1 });

    const platformRevenue = appointments
      .filter(app => app.paymentStatus === 'paid')
      .reduce((sum, app) => sum + app.amount, 0);

    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const revenueData = last7Days.map(date => {
      const dayRevenue = appointments
        .filter(app => app.paymentStatus === 'paid' && new Date(app.date).toISOString().split('T')[0] === date)
        .reduce((sum, app) => sum + app.amount, 0);
      return { date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), amount: dayRevenue };
    });

    res.json({ appointments, platformRevenue, revenueData });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getApplications,
  approveApplication,
  rejectApplication,
  getAppointments
};
