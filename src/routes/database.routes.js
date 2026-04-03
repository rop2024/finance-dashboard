const express = require("express");
const router = express.Router();
const databaseService = require("../services/database.service");
const { authenticate, requireAdmin } = require("../middlewares/admin.middleware");

// Health check (public)
router.get("/health", async (req, res) => {
  try {
    const health = await databaseService.healthCheck();
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All other routes require authentication
router.use(authenticate);

// Stats (admin only)
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await databaseService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schema info (admin only)
router.get("/schema", requireAdmin, async (req, res) => {
  try {
    const schema = await databaseService.getSchemaInfo();
    res.json(schema);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backup (admin only)
router.post("/backup", requireAdmin, async (req, res) => {
  try {
    const { filepath } = req.body;
    const result = await databaseService.createBackup(filepath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore (admin only)
router.post("/restore", requireAdmin, async (req, res) => {
  try {
    const { filepath } = req.body;
    if (!filepath) {
      return res.status(400).json({ error: "Backup filepath is required" });
    }
    const result = await databaseService.restoreFromBackup(filepath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Maintenance (admin only)
router.post("/maintenance", requireAdmin, async (req, res) => {
  try {
    const result = await databaseService.maintenance();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cleanup (admin only)
router.post("/cleanup", requireAdmin, async (req, res) => {
  try {
    const { daysOld = 365 } = req.body;
    const result = await databaseService.cleanupOldData(daysOld);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;