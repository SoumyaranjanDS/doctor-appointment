const express = require('express');
const router = express.Router();
const { getClinics } = require('../controllers/clinicController');

// Define route for fetching clinics
router.get('/', getClinics);

module.exports = router;
