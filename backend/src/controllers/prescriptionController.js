const Appointment = require('../models/Appointment');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// Upload a prescription file
exports.uploadPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Verify ownership/authorization (only doctor or clinic can upload)
    if (req.user.role === 'patient') {
        return res.status(403).json({ message: 'Patients cannot upload prescriptions' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'doctor-appointments/prescriptions');

    appointment.prescription = {
      type: 'upload',
      fileUrl: result.secure_url
    };

    await appointment.save();

    res.json({ message: 'Prescription uploaded successfully', prescription: appointment.prescription });
  } catch (error) {
    console.error('Error uploading prescription:', error);
    res.status(500).json({ message: 'Server error uploading prescription' });
  }
};

// Create a digital prescription
exports.createDigitalPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, doctorName, doctorDetails, patientName, patientDetails, medicines, notes } = req.body;
    
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership/authorization (only doctor or clinic can create)
    if (req.user.role === 'patient') {
        return res.status(403).json({ message: 'Patients cannot create prescriptions' });
    }

    appointment.prescription = {
      type: 'digital',
      digitalData: {
        date,
        time,
        doctorName,
        doctorDetails,
        patientName,
        patientDetails,
        medicines,
        notes
      }
    };

    await appointment.save();

    res.json({ message: 'Digital prescription created successfully', prescription: appointment.prescription });
  } catch (error) {
    console.error('Error creating digital prescription:', error);
    res.status(500).json({ message: 'Server error creating digital prescription' });
  }
};
