const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getAvailableSlots,
  requestAppointment,
  updateAppointmentStatus,
  createCheckoutSession,
  getDoctorAppointments,
  getPatientAppointments,
  getClinicAppointments,
  verifyPayment,
  getAppointmentById
} = require('../controllers/appointmentController');
const { uploadPrescription, createDigitalPrescription } = require('../controllers/prescriptionController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Public/Open route (to see available slots before logging in)
router.get('/available-slots', getAvailableSlots);

// Protected routes
router.use(authMiddleware.requireUser);

router.post('/request', requestAppointment);
router.post('/:id/checkout', createCheckoutSession);
router.get('/verify-payment', verifyPayment);
router.get('/patient', getPatientAppointments);

// Doctor only routes
// In a full app we'd use a role middleware, here we verify ownership in the controller
router.get('/doctor', getDoctorAppointments);
router.put('/:id/status', updateAppointmentStatus);

// Clinic only routes
router.get('/clinic', getClinicAppointments);

// Put wildcard /:id at the very bottom
router.get('/:id', getAppointmentById);
router.post('/:id/prescription/upload', upload.single('prescription'), uploadPrescription);
router.post('/:id/prescription/digital', createDigitalPrescription);

module.exports = router;
