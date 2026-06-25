require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/config/db');

// MongoDB connection will be awaited before listening

const app = express();

// Middlewares
app.use(cors());

// Webhook routes must be mounted before express.json() because Stripe needs the raw body
const webhookRoutes = require('./src/routes/webhookRoutes');
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

// Auth routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Routes
const doctorRoutes = require('./src/routes/doctorRoutes');
const onboardingRoutes = require('./src/routes/onboardingRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');

// Routes configuration

app.use('/api/doctors', doctorRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Protected route example
// const { requireAuth } = require('@clerk/express');
// app.get('/api/v1/protected', requireAuth(), (req, res) => { ... });

const PORT = process.env.PORT || 8081;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend access
    methods: ["GET", "POST"]
  }
});

// Initialize socket handlers
const videoHandler = require('./src/socket/videoHandler');
videoHandler(io);

// Connect to MongoDB and then start the server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running in development mode on port ${PORT}`);
    });
});
