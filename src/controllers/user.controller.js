const userService = require("../services/user.service");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    // Check if user is admin or requesting their own data
    if (req.userRole !== "admin" && req.userId !== req.params.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'user' or 'admin'" });
    }

    const user = await userService.updateUserRole(req.params.id, role);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const result = await userService.deleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};