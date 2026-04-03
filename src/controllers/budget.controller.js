const budgetService = require("../services/budget.service");

exports.create = async (req, res) => {
  try {
    const data = { ...req.body, userId: req.userId };
    const result = await budgetService.setBudget(data);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { month, year } = req.query;
    const budgets = await budgetService.getBudgets(req.userId, parseInt(month), parseInt(year));
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await budgetService.updateBudget(req.params.id, req.userId, req.body);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await budgetService.deleteBudget(req.params.id, req.userId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};