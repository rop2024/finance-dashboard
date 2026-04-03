const dashboardService = require("../services/dashboard.service");

exports.getSummary = async (req, res) => {
  try {
    const { period, year, month } = req.query;
    const summary = await dashboardService.getDashboardSummary(req.userId, { period, year: parseInt(year), month: parseInt(month) });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const { months = 6, category } = req.query;
    const trends = await dashboardService.getSpendingTrends(req.userId, parseInt(months), category);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBudgetAnalysis = async (req, res) => {
  try {
    const { month, year } = req.query;
    const analysis = await dashboardService.getBudgetAnalysis(req.userId, parseInt(month), parseInt(year));
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdvancedMetrics = async (req, res) => {
  try {
    const { period = 'monthly', year, month } = req.query;
    const metrics = await dashboardService.getAdvancedMetrics(req.userId, { period, year: parseInt(year), month: parseInt(month) });
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getForecasting = async (req, res) => {
  try {
    const { months = 3 } = req.query;
    const forecast = await dashboardService.getSpendingForecast(req.userId, parseInt(months));
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryTrends = async (req, res) => {
  try {
    const { months = 6, category } = req.query;
    const trends = await dashboardService.getCategoryTrends(req.userId, parseInt(months), category);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};