const budgetRepo = require("../repositories/budget.repository");

exports.setBudget = async (data) => {
  if (!data.amount || data.amount <= 0) {
    throw new Error("Budget amount must be positive");
  }
  
  if (!data.category) {
    throw new Error("Category is required");
  }
  
  if (!data.month || data.month < 1 || data.month > 12) {
    throw new Error("Valid month (1-12) is required");
  }
  
  if (!data.year || data.year < 2000 || data.year > 2100) {
    throw new Error("Valid year is required");
  }
  
  return budgetRepo.createBudget(data);
};

exports.getBudgets = async (userId, month, year) => {
  return budgetRepo.getUserBudgets(userId, month, year);
};

exports.updateBudget = async (id, userId, data) => {
  const result = await budgetRepo.updateBudget(id, userId, data);
  if (result.count === 0) {
    throw new Error("Budget not found");
  }
  return { message: "Budget updated successfully" };
};

exports.deleteBudget = async (id, userId) => {
  const result = await budgetRepo.deleteBudget(id, userId);
  if (result.count === 0) {
    throw new Error("Budget not found");
  }
  return { message: "Budget deleted successfully" };
};