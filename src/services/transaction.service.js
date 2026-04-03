const transactionRepo = require("../repositories/transaction.repository");

exports.addTransaction = async (data) => {
  // Validation
  if (!data.amount || data.amount <= 0) {
    throw new Error("Amount must be positive");
  }
  
  if (!data.type || !['income', 'expense'].includes(data.type)) {
    throw new Error("Type must be 'income' or 'expense'");
  }
  
  if (!data.category) {
    throw new Error("Category is required");
  }
  
  if (!data.userId) {
    throw new Error("User ID is required");
  }
  
  // Business logic: Add transaction
  const transaction = await transactionRepo.createTransaction({
    amount: data.amount,
    type: data.type,
    category: data.category,
    description: data.description,
    userId: data.userId,
    date: data.date ? new Date(data.date) : undefined
  });
  
  return transaction;
};

exports.fetchTransactions = async (userId, filters) => {
  return transactionRepo.getUserTransactions(userId, filters);
};

exports.getTransactionById = async (id, userId) => {
  const transaction = await transactionRepo.getTransactionById(id, userId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }
  return transaction;
};

exports.updateTransaction = async (id, userId, data) => {
  const result = await transactionRepo.updateTransaction(id, userId, data);
  if (result.count === 0) {
    throw new Error("Transaction not found");
  }
  return { message: "Transaction updated successfully" };
};

exports.deleteTransaction = async (id, userId) => {
  const result = await transactionRepo.deleteTransaction(id, userId);
  if (result.count === 0) {
    throw new Error("Transaction not found");
  }
  return { message: "Transaction deleted successfully" };
};

exports.getTransactionStats = async (userId) => {
  return transactionRepo.getTransactionStats(userId);
};