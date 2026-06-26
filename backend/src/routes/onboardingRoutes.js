const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { requireUser } = require('../middlewares/authMiddleware');
const {
  registerIndividualDoctor,
  registerClinic,
  registerClinicDoctor
} = require('../controllers/onboardingController');

// All onboarding routes require the user to be authenticated locally via Clerk integration
router.use(requireUser);

// Apply as Individual Doctor
router.post('/doctor', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'licenseCertificate', maxCount: 1 },
  { name: 'medicalCertificate', maxCount: 1 },
  { name: 'proofId', maxCount: 1 }
]), registerIndividualDoctor);

// Apply as Clinic
router.post('/clinic', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'clinicLicense', maxCount: 1 },
  { name: 'adminIdProof', maxCount: 1 }
]), registerClinic);

// Clinic Owner onboarding a Doctor
router.post('/clinic/:clinicId/doctor', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'licenseCertificate', maxCount: 1 },
  { name: 'medicalCertificate', maxCount: 1 },
  { name: 'proofId', maxCount: 1 }
]), registerClinicDoctor);

module.exports = router;
