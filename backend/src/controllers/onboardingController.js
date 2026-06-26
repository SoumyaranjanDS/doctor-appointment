const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// Register Individual Doctor
const registerIndividualDoctor = async (req, res) => {
  try {
    const {
      name,
      specialities,
      qualifications,
      experienceYears,
      consultationFee,
      availability,
      bio
    } = req.body;

    if (!req.files || !req.files.document || !req.files.licenseCertificate || !req.files.medicalCertificate || !req.files.proofId) {
      return res.status(400).json({ error: 'All verification documents are required' });
    }

    // Check if user already has an application pending or approved
    const existingDoctor = await Doctor.findOne({ userId: req.user._id });
    if (existingDoctor) {
      return res.status(400).json({ error: 'You have already submitted a doctor application' });
    }

    // Upload documents to Cloudinary
    const docUpload = await uploadToCloudinary(req.files.document[0].buffer, 'doctor-appointments/doctors');
    const licenseUpload = await uploadToCloudinary(req.files.licenseCertificate[0].buffer, 'doctor-appointments/doctors');
    const medCertUpload = await uploadToCloudinary(req.files.medicalCertificate[0].buffer, 'doctor-appointments/doctors');
    const proofIdUpload = await uploadToCloudinary(req.files.proofId[0].buffer, 'doctor-appointments/doctors');

    // Parse JSON fields from formData if necessary
    const parsedSpecialities = typeof specialities === 'string' ? JSON.parse(specialities) : specialities;
    const parsedQualifications = typeof qualifications === 'string' ? JSON.parse(qualifications) : qualifications;
    const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;

    const newDoctor = new Doctor({
      userId: req.user._id,
      name,
      email: req.user.email,
      providerType: 'individual',
      specialities: parsedSpecialities,
      qualifications: parsedQualifications,
      experienceYears: Number(experienceYears),
      consultationFee: Number(consultationFee),
      availability: parsedAvailability,
      bio,
      documentUrl: docUpload.secure_url,
      licenseCertificate: licenseUpload.secure_url,
      medicalCertificate: medCertUpload.secure_url,
      proofId: proofIdUpload.secure_url,
      approvalStatus: 'pending'
    });

    await newDoctor.save();

    res.status(201).json({ message: 'Doctor application submitted successfully', doctor: newDoctor });
  } catch (error) {
    console.error('Register Individual Doctor Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Register Clinic
const registerClinic = async (req, res) => {
  try {
    const { name, address, city, state, pinCode, phone, lat, lng } = req.body;

    if (!req.files || !req.files.document || !req.files.clinicLicense || !req.files.adminIdProof) {
      return res.status(400).json({ error: 'All verification documents are required' });
    }

    // Check if user already owns a clinic application
    const existingClinic = await Clinic.findOne({ ownerId: req.user._id });
    if (existingClinic) {
      return res.status(400).json({ error: 'You have already submitted a clinic application' });
    }

    const docUpload = await uploadToCloudinary(req.files.document[0].buffer, 'doctor-appointments/clinics');
    const clinicLicenseUpload = await uploadToCloudinary(req.files.clinicLicense[0].buffer, 'doctor-appointments/clinics');
    const adminIdProofUpload = await uploadToCloudinary(req.files.adminIdProof[0].buffer, 'doctor-appointments/clinics');

    const newClinic = new Clinic({
      ownerId: req.user._id,
      name,
      address,
      city,
      state,
      pinCode,
      phone,
      location: {
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined
      },
      documentUrl: docUpload.secure_url,
      clinicLicense: clinicLicenseUpload.secure_url,
      adminIdProof: adminIdProofUpload.secure_url,
      approvalStatus: 'pending'
    });

    await newClinic.save();

    res.status(201).json({ message: 'Clinic application submitted successfully', clinic: newClinic });
  } catch (error) {
    console.error('Register Clinic Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Register Clinic Doctor (Done by the clinic owner)
const registerClinicDoctor = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const {
      name,
      email,
      specialities,
      qualifications,
      experienceYears,
      consultationFee,
      availability,
      bio
    } = req.body;

    // Verify the caller owns the clinic and the clinic is approved
    const clinic = await Clinic.findOne({ _id: clinicId, ownerId: req.user._id });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found or you do not have permission' });
    }
    if (clinic.approvalStatus !== 'approved') {
      return res.status(403).json({ error: 'Clinic must be approved before onboarding doctors' });
    }

    if (!req.files || !req.files.document || !req.files.licenseCertificate || !req.files.medicalCertificate || !req.files.proofId) {
      return res.status(400).json({ error: 'All doctor verification documents are required' });
    }

    // Upload document to Cloudinary
    const docUpload = await uploadToCloudinary(req.files.document[0].buffer, 'doctor-appointments/clinic_doctors');
    const licenseUpload = await uploadToCloudinary(req.files.licenseCertificate[0].buffer, 'doctor-appointments/clinic_doctors');
    const medCertUpload = await uploadToCloudinary(req.files.medicalCertificate[0].buffer, 'doctor-appointments/clinic_doctors');
    const proofIdUpload = await uploadToCloudinary(req.files.proofId[0].buffer, 'doctor-appointments/clinic_doctors');

    const parsedSpecialities = typeof specialities === 'string' ? JSON.parse(specialities) : specialities;
    const parsedQualifications = typeof qualifications === 'string' ? JSON.parse(qualifications) : qualifications;
    const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;

    const newDoctor = new Doctor({
      // We don't set userId yet, as the doctor might not have an account. We set the email.
      providerType: 'clinic_doctor',
      clinicId: clinic._id,
      name,
      email,
      specialities: parsedSpecialities,
      qualifications: parsedQualifications,
      experienceYears: Number(experienceYears),
      consultationFee: Number(consultationFee),
      availability: parsedAvailability, // Mandated by the clinic
      bio,
      documentUrl: docUpload.secure_url,
      licenseCertificate: licenseUpload.secure_url,
      medicalCertificate: medCertUpload.secure_url,
      proofId: proofIdUpload.secure_url,
      approvalStatus: 'pending' // Still requires admin approval
    });

    await newDoctor.save();

    res.status(201).json({ message: 'Clinic doctor onboarded successfully and is pending admin approval', doctor: newDoctor });
  } catch (error) {
    console.error('Register Clinic Doctor Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

module.exports = {
  registerIndividualDoctor,
  registerClinic,
  registerClinicDoctor
};
