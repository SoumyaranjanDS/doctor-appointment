const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');

// Get all approved clinics (Public)
exports.getClinics = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Find clinics that are approved
    const clinics = await Clinic.find({ approvalStatus: 'approved' })
      .limit(limit)
      .sort({ createdAt: -1 });
      
    // Optionally fetch doctor count for each clinic
    const clinicsWithDoctorCount = await Promise.all(
      clinics.map(async (clinic) => {
        const doctorCount = await Doctor.countDocuments({ clinicId: clinic._id, providerType: 'clinic_doctor' });
        return {
          ...clinic.toObject(),
          doctorCount
        };
      })
    );

    res.json({ success: true, data: clinicsWithDoctorCount });
  } catch (err) {
    console.error('Error in getClinics:', err);
    res.status(500).json({ success: false, error: 'Internal server error while fetching clinics.' });
  }
};
