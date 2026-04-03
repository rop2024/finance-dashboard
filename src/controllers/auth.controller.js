const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.userId);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};