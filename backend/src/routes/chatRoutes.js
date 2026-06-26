const express = require('express');
const router = express.Router();
const { requireUser } = require('../middlewares/authMiddleware');
const { getChatHistory } = require('../controllers/chatController');

router.use(requireUser);

router.get('/:appointmentId', getChatHistory);

module.exports = router;
