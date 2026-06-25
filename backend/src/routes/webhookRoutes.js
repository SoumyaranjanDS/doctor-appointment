const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Appointment = require('../models/Appointment');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Fulfill the purchase...
    try {
      const appointment = await Appointment.findOne({ stripeSessionId: session.id });
      if (appointment) {
        appointment.paymentStatus = 'paid';
        appointment.status = 'confirmed';
        await appointment.save();
        console.log(`Payment confirmed for appointment: ${appointment._id}`);
      }
    } catch (err) {
      console.error('Error updating appointment after successful payment:', err);
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

module.exports = router;
