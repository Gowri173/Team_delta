const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Captain = require('../models/Captain');

const protect = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'captain') {
        req.user = await Captain.findById(decoded.id).select('-password');
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      req.user.role = decoded.role; // Attach role for authorize middleware
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
