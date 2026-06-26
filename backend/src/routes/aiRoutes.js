const express = require('express');
const router = express.Router();
const { recommendSpecialist } = require('../controllers/aiController');

// Define route for AI specialist recommendation
router.post('/recommend-specialist', recommendSpecialist);

module.exports = router;
