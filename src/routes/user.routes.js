const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, requireAdmin } = require("../middlewares/admin.middleware");

// All user management routes require authentication
router.use(authenticate);

// Admin-only routes
router.get("/", requireAdmin, userController.getAllUsers);
router.put("/:id/role", requireAdmin, userController.updateUserRole);
router.delete("/:id", requireAdmin, userController.deleteUser);

// Get user by ID (admin or self)
router.get("/:id", userController.getUserById);

module.exports = router;