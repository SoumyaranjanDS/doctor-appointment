require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Webhook routes (MUST be before express.json() because svix needs raw body)
const webhookRoutes = require('./src/routes/webhookRoutes');
app.use('/api/v1/webhooks', webhookRoutes);

// Middlewares
app.use(cors());
app.use(express.json());

// Apply Clerk middleware to all routes (or specific ones as needed)
// By default, this just makes req.auth available. We'll add requireAuth on specific routes.
app.use(clerkMiddleware());

// Routes
const doctorRoutes = require('./src/routes/doctorRoutes');

app.use('/api/v1/doctors', doctorRoutes);

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Protected route example
// const { requireAuth } = require('@clerk/express');
// app.get('/api/v1/protected', requireAuth(), (req, res) => { ... });

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
});
