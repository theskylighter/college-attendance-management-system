const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// 1. Authentication Middleware (Verifies the token)
const authenticate = (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the decoded payload to the request object
    // Now req.user will have { userId, email, role } available in your controllers
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

// 2. Authorization Middleware (Checks user roles)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure the user exists (authenticate middleware must run first)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required before checking roles.' });
    }

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden. Role '${req.user.role}' is not allowed to access this resource.` 
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles
};