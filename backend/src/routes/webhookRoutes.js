const express = require('express');
const router = express.Router();
const { clerkWebhook } = require('../controllers/webhookController');

// The webhook endpoint must use raw body parser
router.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhook);

module.exports = router;
