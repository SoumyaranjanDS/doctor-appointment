const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_dcp_admin_auth';

// Middleware to ensure the user is authenticated via local JWT
const requireUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Middleware to ensure the user is an admin via custom JWT
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Handle both our user JWT schema { user: { role: 'admin', id: ... } }
    // and the adminAuthRoutes schema { role: 'admin', email: ... }
    const role = decoded.user?.role || decoded.role;
    
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    // If it's the hardcoded admin token, bypass MongoDB check
    if (decoded.role === 'admin' && !decoded.user) {
      req.user = { role: 'admin', email: decoded.email };
      return next();
    }

    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Admin Auth Middleware Error:', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { requireUser, requireAdmin };
