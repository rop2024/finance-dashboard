const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/user.repository");

// Middleware to check if user is authenticated
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Middleware to check if user has specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.userRole !== role) {
      return res.status(403).json({ error: `${role} access required` });
    }
    next();
  };
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.params.id;

  if (req.userRole === "admin" || req.userId === resourceUserId) {
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
};

module.exports = {
  authenticate,
  requireAdmin,
  requireRole,
  requireOwnershipOrAdmin
};