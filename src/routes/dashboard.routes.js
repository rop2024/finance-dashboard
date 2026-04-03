const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware); // All dashboard routes require authentication

router.get("/summary", dashboardController.getSummary);
router.get("/trends", dashboardController.getTrends);
router.get("/budget-analysis", dashboardController.getBudgetAnalysis);
router.get("/metrics", dashboardController.getAdvancedMetrics);
router.get("/forecast", dashboardController.getForecasting);
router.get("/category-trends", dashboardController.getCategoryTrends);

module.exports = router;