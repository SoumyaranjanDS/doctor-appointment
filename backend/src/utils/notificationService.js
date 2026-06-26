const { Resend } = require('resend');
const Notification = require('../models/Notification');
const User = require('../models/User');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Creates a notification in the database, sends it via socket.io, 
 * and optionally sends an email via Resend.
 * 
 * @param {Object} params
 * @param {Object} params.io - Socket.io instance (req.app.get('io'))
 * @param {String} params.userId - Recipient User ID
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {String} params.type - Notification type
 * @param {String} params.relatedId - Optional related entity ID
 * @param {Boolean} params.sendEmail - Whether to send a Resend email
 * @param {Object} params.appointmentDetails - Optional details to generate .ics calendar invite
 */
const sendNotification = async ({ io, userId, title, message, type = 'general', relatedId, sendEmail = false, appointmentDetails = null }) => {
  try {
    // 1. Create DB Notification
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId
    });

    // 2. Emit real-time Socket.io event
    if (io) {
      io.to(`user_${userId}`).emit('new-notification', notification);
    }

    // 3. Send Email if requested
    if (sendEmail && process.env.RESEND_API_KEY) {
      const user = await User.findById(userId);
      if (user && user.email) {
        let attachments = [];
        
        if (appointmentDetails) {
          const { date, startTime, endTime, doctorName, patientName, clinicName } = appointmentDetails;
          
          // Helper to format date for ICS (YYYYMMDDTHHMMSSZ)
          const formatDate = (dateStr, timeStr) => {
            const d = new Date(`${dateStr}T${timeStr}:00`);
            return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          };
          
          const dtStart = formatDate(new Date(date).toISOString().split('T')[0], startTime);
          const dtEnd = formatDate(new Date(date).toISOString().split('T')[0], endTime || startTime); // Fallback to startTime if no endTime
          
          const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//MediBook Health//EN',
            'BEGIN:VEVENT',
            `UID:${relatedId}@medibook.health`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `SUMMARY:Medical Consultation with ${doctorName}`,
            `DESCRIPTION:Appointment for ${patientName} at ${clinicName || 'MediBook Telehealth'}`,
            'END:VEVENT',
            'END:VCALENDAR'
          ].join('\r\n');

          attachments.push({
            filename: 'appointment.ics',
            content: Buffer.from(icsContent).toString('base64')
          });
        }

        await resend.emails.send({
          from: 'MediBook <onboarding@resend.dev>', // Use standard Resend test email format
          to: user.email,
          subject: title,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #005FA3;">${title}</h2>
              <p style="font-size: 16px; line-height: 1.5;">${message}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">This is an automated message from MediBook Health.</p>
            </div>
          `,
          attachments: attachments.length > 0 ? attachments : undefined
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = { sendNotification };
