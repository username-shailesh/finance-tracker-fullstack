import MockAdapter from 'axios-mock-adapter';

export const setupDemoMock = (apiInstance) => {
  const mock = new MockAdapter(apiInstance, { delayResponse: 500 });

  // Initial Demo State
  const demoUser = {
    id: 999,
    username: 'demo_user',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'Account',
    role: 'USER',
    currency: 'USD'
  };

  const categories = [
    { id: 1, name: 'Housing', color: '#4F46E5', icon: 'home' },
    { id: 2, name: 'Food', color: '#10B981', icon: 'restaurant' },
    { id: 3, name: 'Transportation', color: '#F59E0B', icon: 'directions_car' },
    { id: 4, name: 'Entertainment', color: '#EC4899', icon: 'movie' },
    { id: 5, name: 'Utilities', color: '#8B5CF6', icon: 'bolt' }
  ];

  let expenses = [
    { id: 1, amount: 1200, category: categories[0], description: 'Rent', expenseDate: new Date().toISOString().split('T')[0], paymentMethod: 'BANK_TRANSFER' },
    { id: 2, amount: 45, category: categories[1], description: 'Groceries', expenseDate: new Date().toISOString().split('T')[0], paymentMethod: 'CREDIT_CARD' },
    { id: 3, amount: 30, category: categories[2], description: 'Gas', expenseDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], paymentMethod: 'CREDIT_CARD' }
  ];

  let nextExpenseId = 4;

  const budgets = [
    { id: 1, categoryName: categories[0].name, limitAmount: 1500, spent: 1200, usagePercentage: (1200/1500)*100, month: new Date().toISOString().slice(0, 7) },
    { id: 2, categoryName: categories[1].name, limitAmount: 400, spent: 45, usagePercentage: (45/400)*100, month: new Date().toISOString().slice(0, 7) },
    { id: 3, categoryName: categories[2].name, limitAmount: 150, spent: 30, usagePercentage: (30/150)*100, month: new Date().toISOString().slice(0, 7) },
    { id: 4, categoryName: categories[3].name, limitAmount: 200, spent: 0, usagePercentage: 0, month: new Date().toISOString().slice(0, 7) }
  ];

  const recurring = [
    { id: 1, amount: 12.99, category: categories[4], description: 'Netflix', frequency: 'MONTHLY', nextDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], active: true }
  ];

  // Auth
  mock.onPost('/auth/login').reply(200, {
    success: true,
    message: 'Login successful',
    token: 'fake-demo-jwt-token',
    user: demoUser
  });

  // Categories
  mock.onGet('/categories').reply(() => [200, categories]);
  
  mock.onPost('/categories').reply((config) => {
    const data = JSON.parse(config.data);
    const newCategory = {
      id: categories.length + 1,
      name: data.name,
      color: data.color || '#808080',
      icon: data.icon || 'folder'
    };
    categories.push(newCategory);
    return [200, newCategory];
  });

  // Expenses
  mock.onGet('/expenses').reply(() => [200, expenses]);
  
  mock.onPost('/expenses').reply((config) => {
    const data = JSON.parse(config.data);
    const category = categories.find(c => c.id === data.categoryId) || categories[1];
    const newExpense = {
      id: nextExpenseId++,
      amount: parseFloat(data.amount),
      description: data.description,
      expenseDate: data.expenseDate,
      paymentMethod: data.paymentMethod,
      category: category
    };
    expenses.unshift(newExpense); // Add to beginning
    return [200, newExpense];
  });

  mock.onDelete(/\/expenses\/\d+/).reply((config) => {
    const id = parseInt(config.url.split('/').pop());
    console.log('Demo Mock: Deleting expense with ID:', id);
    expenses = expenses.filter(e => e.id !== id);
    return [200, { success: true }];
  });

  // Budgets
  mock.onGet('/budgets/current').reply(200, budgets);
  mock.onGet(/\/budgets\/\d{4}-\d{2}/).reply(200, budgets); // match /budgets/YYYY-MM

  // Recurring
  mock.onGet('/recurring').reply(200, recurring);

  // Dashboard Summary
  mock.onGet('/dashboard').reply(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetTotal = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
    
    // Group by category for charts
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category.name] = (acc[exp.category.name] || 0) + exp.amount;
      return acc;
    }, {});

    const chartData = {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(name => categories.find(c => c.name === name)?.color || '#999')
      }]
    };

    return [200, {
      totalExpenses: totalSpent,
      totalIncome: budgetTotal + 1000,
      balance: (budgetTotal + 1000) - totalSpent,
      recentExpenses: expenses.slice(0, 5),
      expensesByCategory: chartData
    }];
  });

  // AI Insights
  mock.onGet('/insights/ai').reply(200, [
    { type: 'WARNING', category: 'Housing', insight: 'Your Housing expenses take up 80% of your current spending.', recommendation: 'Consider ways to optimize.' },
    { type: 'SUCCESS', category: 'Entertainment', insight: 'Great job! You are well under your budget for Entertainment this month.', recommendation: 'Keep it up!' },
    { type: 'INFO', category: 'Food', insight: "Based on your recent grocery spending, you might exceed your $400 Food budget if you don't slow down.", recommendation: 'Plan your meals for the rest of the week.' }
  ]);
  
  mock.onGet('/insights/health-score').reply(200, {
    overallScore: 85,
    scoreRating: 'Excellent',
    savingsRatio: 0.25,
    budgetAdherencePercentage: 92,
    overspendingFrequency: 1,
    recommendation: 'Your financial health is excellent. Continue saving and investing for the long term.'
  });
  mock.onGet('/insights/prediction').reply(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    return [200, totalSpent + 350.50]; // Predicted
  });

  // Notifications
  mock.onGet('/notifications').reply(200, []);
  mock.onGet('/notifications/unread').reply(200, []);

  // Pass-through anything else just in case (though it will fail without backend)
  mock.onAny().passThrough();

  console.log("Demo mock adapter successfully initialized!");
};
