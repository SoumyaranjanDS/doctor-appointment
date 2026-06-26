const Appointment = require('../models/Appointment');
const onlineUsers = new Map(); // Maps userId to socket.id

const videoHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);

    // Register user for global notifications
    socket.on('register-user', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(`user_${userId}`);
      console.log(`User ${userId} registered globally with socket ${socket.id} and joined room user_${userId}`);
    });

    // Join a specific appointment room
    socket.on('join-room', async (roomId, userId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
      // Notify others in the room
      socket.to(roomId).emit('user-connected', userId);

      // Notify the peer globally if they are online
      try {
        const appointment = await Appointment.findById(roomId).populate('doctorId');
        if (appointment) {
          const doctorUserId = String(appointment.doctorId.userId);
          const patientUserId = String(appointment.patientId);
          const peerId = String(userId) === doctorUserId ? patientUserId : doctorUserId;

          if (onlineUsers.has(peerId)) {
            io.to(onlineUsers.get(peerId)).emit('peer-joined-room', { roomId, userId });
          }
        }
      } catch (err) {
        console.error("Failed to notify peer:", err);
      }

      socket.on('disconnect', () => {
        console.log(`User ${userId} left room ${roomId}`);
        socket.to(roomId).emit('user-disconnected', userId);
        // Remove from onlineUsers map if necessary (handled by global disconnect)
      });
    });

    socket.on('disconnect', () => {
      // Find and remove user from onlineUsers
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });

    // WebRTC Signaling
    socket.on('offer', (roomId, offer) => {
      socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (roomId, answer) => {
      socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (roomId, candidate) => {
      socket.to(roomId).emit('ice-candidate', candidate);
    });
    
    // Call controls
    socket.on('toggle-media', (roomId, userId, mediaType, isEnabled) => {
      socket.to(roomId).emit('user-toggled-media', userId, mediaType, isEnabled);
    });

    // Chat Events
    socket.on('join-chat', (appointmentId) => {
      socket.join(`chat_${appointmentId}`);
      console.log(`Socket ${socket.id} joined chat room chat_${appointmentId}`);
    });

    socket.on('send-message', async (data) => {
      // data: { appointmentId, senderId, text }
      try {
        const Message = require('../models/Message');
        const newMessage = await Message.create({
          appointmentId: data.appointmentId,
          senderId: data.senderId,
          text: data.text
        });

        // Populate sender info for the client
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('senderId', 'firstName lastName profileImageUrl');

        // Broadcast to everyone in the chat room
        io.to(`chat_${data.appointmentId}`).emit('receive-message', populatedMessage);
      } catch (err) {
        console.error('Error handling send-message:', err);
      }
    });
  });
};

module.exports = videoHandler;
