const transactionService = require("../services/transaction.service");

exports.create = async (req, res) => {
  try {
    const data = { ...req.body, userId: req.userId };
    const result = await transactionService.addTransaction(data);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    const filters = { startDate, endDate, type, category };
    const data = await transactionService.fetchTransactions(req.userId, filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id, req.userId);
    res.json(transaction);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await transactionService.updateTransaction(req.params.id, req.userId, req.body);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await transactionService.deleteTransaction(req.params.id, req.userId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await transactionService.getTransactionStats(req.userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};