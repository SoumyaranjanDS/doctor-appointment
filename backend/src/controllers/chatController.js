const Message = require('../models/Message');
const Appointment = require('../models/Appointment');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');

exports.getChatHistory = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    // 1. Verify appointment exists and is completed
    const appointment = await Appointment.findById(appointmentId).populate('doctorId');
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    
    // Allow chat if completed. Technically could allow during other states, but requirements say post-consultation 72h.
    if (appointment.status !== 'completed') {
      return res.status(403).json({ error: 'Chat is only available after consultation is completed.' });
    }

    // 2. Check 72 hours window
    const completedAt = appointment.updatedAt; // assuming updatedAt is when it was completed
    const now = new Date();
    const hoursDiff = Math.abs(now - new Date(completedAt)) / 36e5;
    
    // We still return the history even if > 72 hours, but the frontend will lock the input.
    // So we just return the messages.

    // 3. Verify Authorization (Participant or Clinic Admin)
    const isPatient = String(appointment.patientId) === String(userId);
    const isDoctor = String(appointment.doctorId.userId) === String(userId);
    let isClinicAdmin = false;
    
    if (appointment.doctorId.providerType === 'clinic_doctor' && appointment.doctorId.clinicId) {
      const clinic = await Clinic.findById(appointment.doctorId.clinicId);
      if (clinic && String(clinic.ownerId) === String(userId)) {
        isClinicAdmin = true;
      }
    }

    if (!isPatient && !isDoctor && !isClinicAdmin) {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }

    // 4. Fetch messages
    const messages = await Message.find({ appointmentId })
      .populate('senderId', 'firstName lastName profileImageUrl')
      .sort({ createdAt: 1 });

    res.json({
      messages,
      isExpired: hoursDiff > 72
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};
