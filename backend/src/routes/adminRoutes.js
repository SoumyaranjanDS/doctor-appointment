const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middlewares/authMiddleware');
const {
  getApplications,
  approveApplication,
  rejectApplication
} = require('../controllers/adminController');

// All admin routes are protected
router.use(requireAdmin);

// Fetch all applications
router.get('/applications', getApplications);

// Approve application (type is 'doctor' or 'clinic')
router.put('/applications/:type/:id/approve', approveApplication);

// Reject application
router.put('/applications/:type/:id/reject', rejectApplication);

module.exports = router;
