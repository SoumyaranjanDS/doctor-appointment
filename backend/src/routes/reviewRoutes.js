const express = require('express');
const router = express.Router();
const { createReview, getDoctorReviews } = require('../controllers/reviewController');
const { requireUser } = require('../middlewares/authMiddleware');

router.post('/', requireUser, createReview);
router.get('/doctor/:doctorId', getDoctorReviews);

module.exports = router;
