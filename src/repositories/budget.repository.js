const prisma = require("../config/db");

exports.createBudget = (data) => {
  return prisma.budget.create({ data });
};

exports.getUserBudgets = (userId, month, year) => {
  return prisma.budget.findMany({
    where: { userId, month, year }
  });
};

exports.updateBudget = (id, userId, data) => {
  return prisma.budget.updateMany({
    where: { id, userId },
    data
  });
};

exports.deleteBudget = (id, userId) => {
  return prisma.budget.deleteMany({
    where: { id, userId }
  });
};