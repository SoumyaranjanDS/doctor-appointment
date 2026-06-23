const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dcp.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '123456';

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign(
      { role: 'admin', email: adminEmail },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_dcp_admin_auth',
      { expiresIn: '24h' }
    );
    return res.json({ token, user: { email: adminEmail, role: 'admin' } });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
