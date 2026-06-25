const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper to get day of week from date string (YYYY-MM-DD)
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getUTCDay()];
};

// 1. Get available slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query; // date in YYYY-MM-DD format
    
    if (!doctorId || !date) {
      return res.status(400).json({ error: 'doctorId and date are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const dayOfWeek = getDayOfWeek(date);
    const dayAvailability = doctor.availability.find(a => a.dayOfWeek === dayOfWeek);

    if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
      return res.json([]); // No slots available for this day
    }

    // Parse the target date to boundary times for querying
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Get booked appointments
    const bookedAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['pending', 'awaiting_payment', 'confirmed'] }
    });

    const bookedTimes = bookedAppointments.map(app => `${app.startTime}-${app.endTime}`);

    // Filter out booked slots
    const availableSlots = dayAvailability.slots.filter(slot => {
      const slotString = `${slot.startTime}-${slot.endTime}`;
      return !bookedTimes.includes(slotString);
    });

    res.json(availableSlots);
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. Patient requests an appointment
exports.requestAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, reasonForVisit } = req.body;
    const patientId = req.user.id; // From auth middleware

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    // Ensure slot is actually available
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existing = await Appointment.findOne({
      doctorId,
      date: { $gte: startOfDay, $lt: endOfDay },
      startTime,
      endTime,
      status: { $in: ['pending', 'awaiting_payment', 'confirmed'] }
    });

    if (existing) {
      return res.status(400).json({ error: 'Slot is already booked or requested' });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      clinicId: doctor.clinicId || undefined,
      date: startOfDay, // Store 00:00:00 of the requested date
      startTime,
      endTime,
      reasonForVisit,
      amount: doctor.consultationFee,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Error requesting appointment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 3. Doctor accepts or rejects an appointment
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'awaiting_payment' or 'cancelled'
    const userId = req.user.id;

    if (!['awaiting_payment', 'cancelled', 'completed', 'no-show'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status update' });
    }

    const appointment = await Appointment.findById(id).populate('doctorId');
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Verify ownership (Doctor or Clinic owner)
    // Simplified: check if logged in user's ID matches doctor's userId
    // Real implementation needs to handle clinic_doctor cases via Clinic ownership
    // For MVP, if it's individual, direct match.
    if (appointment.doctorId.providerType === 'individual' && String(appointment.doctorId.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 4. Generate Stripe Checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const appointment = await Appointment.findOne({ _id: id, patientId, status: 'awaiting_payment' }).populate('doctorId');
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or not ready for payment' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Consultation with ${appointment.doctorId.name}`,
              description: `${appointment.date.toISOString().split('T')[0]} at ${appointment.startTime}`,
            },
            unit_amount: appointment.amount * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout-cancel`,
      client_reference_id: appointment._id.toString()
    });

    appointment.stripeSessionId = session.id;
    await appointment.save();

    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 5. Get doctor appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find doctor profile for this user
    const doctor = await Doctor.findOne({ userId });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'firstName lastName email imageUrl')
      .sort({ date: 1, startTime: 1 });

    const totalRevenue = appointments
      .filter(app => app.paymentStatus === 'paid')
      .reduce((sum, app) => sum + app.amount, 0);

    res.json({ appointments, totalRevenue });
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 7. Verify payment via session ID
exports.verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) return res.status(404).json({ error: 'Stripe session not found' });

    const appointment = await Appointment.findOne({ stripeSessionId: session_id })
      .populate('doctorId', 'name specialities')
      .populate('patientId', 'firstName lastName email');

    if (!appointment) return res.status(404).json({ error: 'Appointment not found for this session' });

    // Update status if paid
    if (session.payment_status === 'paid' && appointment.paymentStatus !== 'paid') {
      appointment.paymentStatus = 'paid';
      appointment.status = 'confirmed';
      await appointment.save();
    }

    res.json(appointment);
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: 'Server error during payment verification' });
  }
};

// 6. Get patient appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialities imageUrl')
      .populate('clinicId', 'name address')
      .sort({ date: -1, startTime: -1 });

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
