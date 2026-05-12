const axios = require('axios');

async function testApi() {
  try {
    console.log('Registering user...');
    const regRes = await axios.post('http://localhost:8080/api/auth/register', {
      username: 'testuser4',
      email: 'testuser4@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    console.log('Register response:', regRes.data);

    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'testuser4',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Logged in successfully. Token:', token.substring(0, 20) + '...');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('Creating a category...');
    const catRes = await axios.post('http://localhost:8080/api/categories', {
      name: 'Food',
      color: '#ff0000',
      icon: 'food-icon'
    }, { headers });
    const categoryId = catRes.data.id;
    console.log('Category created with ID:', categoryId);

    console.log('Adding expense...');
    const expRes = await axios.post('http://localhost:8080/api/expenses', {
      amount: 15.50,
      categoryId: categoryId,
      description: 'Lunch',
      expenseDate: '2024-05-06',
      paymentMethod: 'CASH'
    }, { headers });
    const expenseId = expRes.data.id;
    console.log('Expense added successfully:', expRes.data);

    console.log(`Deleting expense ${expenseId}...`);
    const delRes = await axios.delete(`http://localhost:8080/api/expenses/${expenseId}`, { headers });
    console.log('Delete response:', delRes.status, delRes.data);

  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

testApi();
