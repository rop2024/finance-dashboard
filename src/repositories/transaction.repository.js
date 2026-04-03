const prisma = require("../config/db");

exports.createTransaction = (data) => {
  return prisma.transaction.create({ data });
};

exports.getUserTransactions = (userId, filters = {}) => {
  const { startDate, endDate, type, category } = filters;
  
  const where = { userId };
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }
  
  if (type) where.type = type;
  if (category) where.category = category;
  
  return prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' }
  });
};

exports.getTransactionById = (id, userId) => {
  return prisma.transaction.findFirst({
    where: { id, userId }
  });
};

exports.updateTransaction = (id, userId, data) => {
  return prisma.transaction.updateMany({
    where: { id, userId },
    data
  });
};

exports.deleteTransaction = (id, userId) => {
  return prisma.transaction.deleteMany({
    where: { id, userId }
  });
};

exports.getTransactionStats = async (userId) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId }
  });
  
  const stats = {
    totalIncome: 0,
    totalExpense: 0,
    byCategory: {}
  };
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      stats.totalIncome += transaction.amount;
    } else {
      stats.totalExpense += transaction.amount;
    }
    
    if (!stats.byCategory[transaction.category]) {
      stats.byCategory[transaction.category] = 0;
    }
    stats.byCategory[transaction.category] += transaction.amount;
  });
  
  stats.balance = stats.totalIncome - stats.totalExpense;
  
  return stats;
};