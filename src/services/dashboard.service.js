const prisma = require("../config/db");

exports.getDashboardSummary = async (userId, filters = {}) => {
  const { period = 'monthly', year, month } = filters;

  let dateFilter = {};
  const now = new Date();

  if (period === 'monthly' && year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    dateFilter = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
  } else if (period === 'yearly' && year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    dateFilter = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...dateFilter
    }
  });

  const summary = {
    period,
    year: year || now.getFullYear(),
    month: month || (period === 'monthly' ? now.getMonth() + 1 : null),
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: transactions.length,
    categories: {},
    dailyBreakdown: {}
  };

  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      summary.totalIncome += transaction.amount;
    } else {
      summary.totalExpense += transaction.amount;
    }

    // Category breakdown
    if (!summary.categories[transaction.category]) {
      summary.categories[transaction.category] = { income: 0, expense: 0, count: 0 };
    }
    summary.categories[transaction.category][transaction.type] += transaction.amount;
    summary.categories[transaction.category].count += 1;

    // Daily breakdown
    const dateKey = transaction.date.toISOString().split('T')[0];
    if (!summary.dailyBreakdown[dateKey]) {
      summary.dailyBreakdown[dateKey] = { income: 0, expense: 0, count: 0 };
    }
    summary.dailyBreakdown[dateKey][transaction.type] += transaction.amount;
    summary.dailyBreakdown[dateKey].count += 1;
  });

  summary.balance = summary.totalIncome - summary.totalExpense;

  return summary;
};

exports.getSpendingTrends = async (userId, months = 6, category = null) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  let whereClause = {
    userId,
    date: {
      gte: startDate,
      lte: endDate
    }
  };

  if (category) {
    whereClause.category = category;
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { date: 'asc' }
  });

  const trends = {};
  const monthlyData = {};

  transactions.forEach(transaction => {
    const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        income: 0,
        expense: 0,
        count: 0,
        categories: {}
      };
    }

    monthlyData[monthKey][transaction.type] += transaction.amount;
    monthlyData[monthKey].count += 1;

    if (!monthlyData[monthKey].categories[transaction.category]) {
      monthlyData[monthKey].categories[transaction.category] = { income: 0, expense: 0 };
    }
    monthlyData[monthKey].categories[transaction.category][transaction.type] += transaction.amount;
  });

  // Calculate trends
  const monthsArray = Object.values(monthlyData);
  monthsArray.forEach((month, index) => {
    month.balance = month.income - month.expense;

    if (index > 0) {
      const prevMonth = monthsArray[index - 1];
      month.incomeChange = ((month.income - prevMonth.income) / prevMonth.income) * 100;
      month.expenseChange = ((month.expense - prevMonth.expense) / prevMonth.expense) * 100;
      month.balanceChange = month.balance - prevMonth.balance;
    } else {
      month.incomeChange = 0;
      month.expenseChange = 0;
      month.balanceChange = 0;
    }
  });

  return {
    period: `${months} months`,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    category: category || 'all',
    trends: monthsArray
  };
};

exports.getBudgetAnalysis = async (userId, month, year) => {
  // Get budgets for the specified month/year
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month,
      year
    }
  });

  // Get actual spending for the same period
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'expense',
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Group actual spending by category
  const actualSpending = {};
  transactions.forEach(transaction => {
    if (!actualSpending[transaction.category]) {
      actualSpending[transaction.category] = 0;
    }
    actualSpending[transaction.category] += transaction.amount;
  });

  // Compare budget vs actual
  const analysis = budgets.map(budget => {
    const actual = actualSpending[budget.category] || 0;
    const variance = actual - budget.amount;
    const variancePercent = budget.amount > 0 ? (variance / budget.amount) * 100 : 0;

    return {
      category: budget.category,
      budgeted: budget.amount,
      actual: actual,
      variance: variance,
      variancePercent: Math.round(variancePercent * 100) / 100,
      status: variance > 0 ? 'over_budget' : variance === 0 ? 'on_budget' : 'under_budget'
    };
  });

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalActual = Object.values(actualSpending).reduce((sum, amount) => sum + amount, 0);

  return {
    period: `${year}-${String(month).padStart(2, '0')}`,
    summary: {
      totalBudgeted,
      totalActual,
      totalVariance: totalActual - totalBudgeted,
      totalVariancePercent: totalBudgeted > 0 ? ((totalActual - totalBudgeted) / totalBudgeted) * 100 : 0
    },
    categories: analysis
  };
};

exports.getAdvancedMetrics = async (userId, filters = {}) => {
  const { period = 'monthly', year, month } = filters;

  let dateFilter = {};
  const now = new Date();

  if (period === 'monthly' && year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    dateFilter = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...dateFilter
    },
    orderBy: { date: 'asc' }
  });

  if (transactions.length === 0) {
    return {
      period,
      metrics: {
        averageTransaction: 0,
        medianTransaction: 0,
        largestTransaction: 0,
        smallestTransaction: 0,
        transactionFrequency: 0,
        spendingVelocity: 0,
        topCategories: [],
        transactionDistribution: {}
      }
    };
  }

  // Calculate basic metrics
  const amounts = transactions.map(t => t.amount);
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  const averageTransaction = totalAmount / transactions.length;

  // Calculate median
  const sortedAmounts = [...amounts].sort((a, b) => a - b);
  const medianTransaction = sortedAmounts.length % 2 === 0
    ? (sortedAmounts[sortedAmounts.length / 2 - 1] + sortedAmounts[sortedAmounts.length / 2]) / 2
    : sortedAmounts[Math.floor(sortedAmounts.length / 2)];

  // Category analysis
  const categoryTotals = {};
  transactions.forEach(transaction => {
    if (!categoryTotals[transaction.category]) {
      categoryTotals[transaction.category] = 0;
    }
    categoryTotals[transaction.category] += transaction.amount;
  });

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  // Transaction distribution by amount ranges
  const distribution = {
    '0-50': 0,
    '51-100': 0,
    '101-500': 0,
    '501-1000': 0,
    '1000+': 0
  };

  transactions.forEach(transaction => {
    if (transaction.amount <= 50) distribution['0-50']++;
    else if (transaction.amount <= 100) distribution['51-100']++;
    else if (transaction.amount <= 500) distribution['101-500']++;
    else if (transaction.amount <= 1000) distribution['501-1000']++;
    else distribution['1000+']++;
  });

  // Calculate spending velocity (transactions per day)
  const dateRange = Math.max(1, Math.ceil((transactions[transactions.length - 1].date - transactions[0].date) / (1000 * 60 * 60 * 24)));
  const spendingVelocity = transactions.length / dateRange;

  return {
    period,
    year: year || now.getFullYear(),
    month: month || (period === 'monthly' ? now.getMonth() + 1 : null),
    metrics: {
      transactionCount: transactions.length,
      averageTransaction: Math.round(averageTransaction * 100) / 100,
      medianTransaction: Math.round(medianTransaction * 100) / 100,
      largestTransaction: Math.max(...amounts),
      smallestTransaction: Math.min(...amounts),
      spendingVelocity: Math.round(spendingVelocity * 100) / 100,
      topCategories,
      transactionDistribution: distribution
    }
  };
};

exports.getSpendingForecast = async (userId, months = 3) => {
  // Get historical data for the last 6 months
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  });

  // Group by month
  const monthlyData = {};
  transactions.forEach(transaction => {
    const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0, count: 0 };
    }

    monthlyData[monthKey][transaction.type] += transaction.amount;
    monthlyData[monthKey].count += 1;
  });

  const monthsArray = Object.values(monthlyData);
  if (monthsArray.length < 2) {
    return {
      forecast: [],
      note: "Need at least 2 months of data for forecasting"
    };
  }

  // Simple linear regression for forecasting
  const forecast = [];
  const lastMonth = monthsArray[monthsArray.length - 1];
  const secondLastMonth = monthsArray[monthsArray.length - 2];

  const incomeGrowth = monthsArray.length >= 2 ?
    (lastMonth.income - secondLastMonth.income) / secondLastMonth.income : 0;
  const expenseGrowth = monthsArray.length >= 2 ?
    (lastMonth.expense - secondLastMonth.expense) / secondLastMonth.expense : 0;

  for (let i = 1; i <= months; i++) {
    const forecastDate = new Date(endDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);

    const monthKey = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;

    forecast.push({
      month: monthKey,
      predictedIncome: Math.max(0, lastMonth.income * Math.pow(1 + incomeGrowth, i)),
      predictedExpense: Math.max(0, lastMonth.expense * Math.pow(1 + expenseGrowth, i)),
      predictedBalance: 0, // Will be calculated below
      confidence: Math.max(0, Math.min(100, 100 - (i * 10))) // Confidence decreases over time
    });
  }

  // Calculate predicted balance
  forecast.forEach(item => {
    item.predictedBalance = item.predictedIncome - item.predictedExpense;
  });

  return {
    basedOnMonths: monthsArray.length,
    forecastPeriod: months,
    historicalAverage: {
      income: monthsArray.reduce((sum, m) => sum + m.income, 0) / monthsArray.length,
      expense: monthsArray.reduce((sum, m) => sum + m.expense, 0) / monthsArray.length
    },
    forecast
  };
};

exports.getCategoryTrends = async (userId, months = 6, specificCategory = null) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  });

  const categoryTrends = {};
  const monthlyData = {};

  transactions.forEach(transaction => {
    const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {};
    }

    if (!monthlyData[monthKey][transaction.category]) {
      monthlyData[monthKey][transaction.category] = { income: 0, expense: 0, count: 0 };
    }

    monthlyData[monthKey][transaction.category][transaction.type] += transaction.amount;
    monthlyData[monthKey][transaction.category].count += 1;

    // Overall category totals
    if (!categoryTrends[transaction.category]) {
      categoryTrends[transaction.category] = {
        totalIncome: 0,
        totalExpense: 0,
        monthlyBreakdown: [],
        growthRate: 0
      };
    }

    categoryTrends[transaction.category].totalIncome += transaction.type === 'income' ? transaction.amount : 0;
    categoryTrends[transaction.category].totalExpense += transaction.type === 'expense' ? transaction.amount : 0;
  });

  // Process monthly breakdown for each category
  Object.keys(categoryTrends).forEach(category => {
    const monthlyAmounts = [];

    Object.keys(monthlyData).forEach(month => {
      const categoryData = monthlyData[month][category];
      if (categoryData) {
        monthlyAmounts.push({
          month,
          income: categoryData.income,
          expense: categoryData.expense,
          total: categoryData.income + categoryData.expense
        });
      } else {
        monthlyAmounts.push({
          month,
          income: 0,
          expense: 0,
          total: 0
        });
      }
    });

    categoryTrends[category].monthlyBreakdown = monthlyAmounts;

    // Calculate growth rate (comparing first and last month)
    if (monthlyAmounts.length >= 2) {
      const firstMonth = monthlyAmounts[0].total;
      const lastMonth = monthlyAmounts[monthlyAmounts.length - 1].total;
      categoryTrends[category].growthRate = firstMonth > 0 ?
        ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
    }
  });

  // Filter for specific category if requested
  if (specificCategory) {
    return {
      category: specificCategory,
      trend: categoryTrends[specificCategory] || {
        totalIncome: 0,
        totalExpense: 0,
        monthlyBreakdown: [],
        growthRate: 0
      }
    };
  }

  return {
    period: `${months} months`,
    categories: categoryTrends
  };
};