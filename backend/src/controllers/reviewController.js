const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const patientId = req.user.id;

    // Verify appointment belongs to patient and is completed
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== patientId) {
      return res.status(403).json({ message: 'Unauthorized to review this appointment' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed appointments' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted for this appointment' });
    }

    const doctorId = appointment.doctorId;

    const review = new Review({
      patientId,
      doctorId,
      appointmentId,
      rating,
      comment
    });

    await review.save();

    // Mark appointment as reviewed
    appointment.hasReviewed = true;
    await appointment.save();

    // Update doctor's average rating
    const allReviews = await Review.find({ doctorId });
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = (totalRating / allReviews.length).toFixed(1);

    await Doctor.findByIdAndUpdate(doctorId, {
      averageRating,
      totalReviews: allReviews.length
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctorId })
      .populate('patientId', 'firstName lastName imageUrl')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
