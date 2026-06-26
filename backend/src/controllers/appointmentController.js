const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendNotification } = require('../utils/notificationService');

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
    const { doctorId, date, startTime, endTime, reasonForVisit, bookedFor } = req.body;
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
      bookedFor: bookedFor || 'Myself',
      amount: doctor.consultationFee,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await appointment.save();

    // Send Notification to Doctor or Clinic Owner
    let targetUserId = doctor.userId;
    if (doctor.providerType === 'clinic_doctor' && doctor.clinicId) {
      const Clinic = require('../models/Clinic');
      const clinic = await Clinic.findById(doctor.clinicId);
      if (clinic) targetUserId = clinic.ownerId;
    }
    
    if (targetUserId) {
      await sendNotification({
        io: req.app.get('io'),
        userId: targetUserId,
        title: 'New Appointment Request',
        message: `You have a new appointment request on ${date.split('T')[0]} at ${startTime}.`,
        type: 'new_appointment',
        relatedId: appointment._id,
        sendEmail: true
      });
    }

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

    if (!['awaiting_payment', 'confirmed', 'cancelled', 'completed', 'no-show', 'pending_completion'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status update' });
    }

    const appointment = await Appointment.findById(id).populate('doctorId');
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Verify ownership
    const isDoctor = String(appointment.doctorId.userId) === String(userId);
    const isPatient = String(appointment.patientId) === String(userId);

    if (status === 'completed' && appointment.status === 'pending_completion') {
      if (!isPatient) return res.status(403).json({ error: 'Only the patient can approve completion' });
    } else {
      if (!isDoctor) return res.status(403).json({ error: 'Only the doctor can change status' });
    }

    // Fund distribution on completion
    if (status === 'completed' && appointment.paymentStatus === 'paid' && appointment.status !== 'completed') {
      const platformFee = appointment.amount * 0.05;
      const providerEarnings = appointment.amount - platformFee;

      const Clinic = require('../models/Clinic');
      const doc = await Doctor.findById(appointment.doctorId);
      
      if (doc) {
        if (doc.providerType === 'clinic_doctor' && doc.clinicId) {
          await Clinic.findByIdAndUpdate(doc.clinicId, {
            $inc: { availableBalance: providerEarnings }
          });
        } else {
          await Doctor.findByIdAndUpdate(doc._id, {
            $inc: { availableBalance: providerEarnings }
          });
        }
      }
    }

    if (status === 'confirmed' && appointment.paymentStatus === 'pending') {
      appointment.paymentStatus = 'paid_at_clinic';
    }

    appointment.status = status;
    await appointment.save();

    // Notification Logic
    let title = 'Appointment Update';
    let message = `Your appointment status has been updated to ${status}.`;
    let sendToPatient = isDoctor;
    
    if (status === 'awaiting_payment') {
      title = 'Appointment Accepted';
      message = `Your appointment has been accepted. Please complete the online payment to confirm.`;
    } else if (status === 'confirmed') {
      title = 'Appointment Confirmed';
      message = `Your appointment has been confirmed.`;
    } else if (status === 'cancelled') {
      title = 'Appointment Cancelled';
      message = `Your appointment was cancelled.`;
    } else if (status === 'pending_completion') {
      title = 'Completion Approval Needed';
      message = `The doctor requested to mark this appointment as completed. Please approve it from your dashboard.`;
    } else if (status === 'completed' && isPatient) {
      title = 'Appointment Completed';
      message = `The patient has approved the completion of the appointment.`;
      sendToPatient = false;
    }

    if (sendToPatient) {
      await sendNotification({
        io: req.app.get('io'),
        userId: appointment.patientId,
        title,
        message,
        type: 'appointment_update',
        relatedId: appointment._id,
        sendEmail: status !== 'pending_completion'
      });
    } else if (isPatient && status === 'completed') {
      let docUserId = appointment.doctorId.userId;
      if (appointment.doctorId.providerType === 'clinic_doctor' && appointment.doctorId.clinicId) {
        const Clinic = require('../models/Clinic');
        const clinic = await Clinic.findById(appointment.doctorId.clinicId);
        if (clinic) docUserId = clinic.ownerId;
      }
      if (docUserId) {
        await sendNotification({
          io: req.app.get('io'),
          userId: docUserId,
          title,
          message,
          type: 'appointment_update',
          relatedId: appointment._id,
          sendEmail: false
        });
      }
    }

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

    const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';

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
      success_url: `${clientUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout-cancel`,
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
      .populate('patientId', 'firstName lastName email imageUrl medicalRecords')
      .sort({ date: 1, startTime: 1 });

    if (doctor.providerType === 'clinic_doctor') {
      return res.json({ appointments, hideRevenue: true, totalRevenue: 0, pendingRevenue: 0, availableBalance: 0, totalWithdrawn: 0 });
    }

    const completedRevenue = appointments
      .filter(app => app.status === 'completed' && app.paymentStatus === 'paid')
      .reduce((sum, app) => sum + app.amount, 0);

    const pendingRevenue = appointments
      .filter(app => app.status !== 'completed' && app.paymentStatus === 'paid')
      .reduce((sum, app) => sum + app.amount, 0);

    res.json({ 
      appointments, 
      hideRevenue: false,
      totalRevenue: completedRevenue, 
      pendingRevenue,
      availableBalance: doctor.availableBalance || 0,
      totalWithdrawn: doctor.totalWithdrawn || 0
    });
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 5b. Get clinic appointments
exports.getClinicAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const Clinic = require('../models/Clinic');
    const clinic = await Clinic.findOne({ ownerId: userId });
    
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic profile not found' });
    }

    const appointments = await Appointment.find({ clinicId: clinic._id })
      .populate('patientId', 'firstName lastName email imageUrl medicalRecords')
      .populate('doctorId', 'name')
      .sort({ date: 1, startTime: 1 });

    // The stats (revenue, etc) are already fetched via /dashboard/stats
    // We just return the appointments array here.
    res.json({ appointments });
  } catch (err) {
    console.error('Error fetching clinic appointments:', err);
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

      const { sendNotification } = require('../utils/notificationService');
      await sendNotification({
        io: req.app.get('io'),
        userId: appointment.patientId._id,
        title: 'Appointment Confirmed & Paid',
        message: `Your payment for the appointment with Dr. ${appointment.doctorId.name} was successful.`,
        type: 'appointment_update',
        relatedId: appointment._id,
        sendEmail: true,
        appointmentDetails: {
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          doctorName: appointment.doctorId.name,
          patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`
        }
      });
    }

    res.json(appointment);
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: 'Server error during payment verification' });
  }
};

// 7. Get single appointment
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId')
      .populate('patientId', 'name email medicalRecords');
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    console.error('Error fetching appointment:', err);
    res.status(500).json({ error: 'Server error' });
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
