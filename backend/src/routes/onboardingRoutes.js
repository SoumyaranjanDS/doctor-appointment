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
router.post('/doctor', upload.single('document'), registerIndividualDoctor);

// Apply as Clinic
router.post('/clinic', upload.single('document'), registerClinic);

// Clinic Owner onboarding a Doctor
router.post('/clinic/:clinicId/doctor', upload.single('document'), registerClinicDoctor);

module.exports = router;
