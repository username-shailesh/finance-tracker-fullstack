# Testing Guide - Finance Tracker

Complete testing guide using Postman and manual testing procedures.

## Table of Contents

1. [Setup](#setup)
2. [Postman Collection](#postman-collection)
3. [Manual Test Scenarios](#manual-test-scenarios)
4. [Automated Testing](#automated-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)

---

## Setup

### Import Postman Collection

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create new request or import collection
3. Set base URL: `http://localhost:8080/api`
4. Set environment variable: `token` (will be set after login)

---

## Postman Collection

### 1. Authentication Tests

#### Register New User
```
POST /auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "username": "testuser",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User"
}

Expected Response: 200
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "testuser@example.com",
      "username": "testuser",
      "firstName": "Test",
      "lastName": "User"
    }
  }
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "TestPassword123!"
}

Expected Response: 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "expiresIn": 86400000,
    "user": {
      "id": 1,
      "email": "testuser@example.com",
      "username": "testuser"
    }
  }
}

**IMPORTANT**: Copy the token value and set it as environment variable {{token}}
```

#### Health Check
```
GET /auth/health
No authentication required

Expected Response: 200
{
  "success": true,
  "message": "Application is healthy",
  "status": "UP"
}
```

---

### 2. Category Tests

#### Get All Categories
```
GET /categories
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Food & Dining",
      "description": "Groceries, restaurants, cafes",
      "color": "#FF6B6B",
      "icon": "utensils",
      "isCustom": false
    },
    ...
  ]
}
```

#### Create Category
```
POST /categories
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Personal",
  "description": "Personal care and items",
  "color": "#FF00FF",
  "icon": "user"
}

Expected Response: 201
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 9,
    "name": "Personal",
    "description": "Personal care and items",
    "color": "#FF00FF",
    "icon": "user",
    "isCustom": true
  }
}
```

#### Update Category
```
PUT /categories/9
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Personal Care",
  "description": "Personal care products and services",
  "color": "#FF1493",
  "icon": "spa"
}

Expected Response: 200
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 9,
    "name": "Personal Care",
    ...
  }
}
```

#### Delete Category
```
DELETE /categories/9
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### 3. Expense Tests

#### Create Expense
```
POST /expenses
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "amount": 45.50,
  "categoryId": 1,
  "expenseDate": "2024-05-15",
  "description": "Lunch at restaurant",
  "paymentMethod": "CARD",
  "receiptPath": null
}

Expected Response: 201
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": 1,
    "amount": 45.50,
    "category": {
      "id": 1,
      "name": "Food & Dining"
    },
    "expenseDate": "2024-05-15",
    "description": "Lunch at restaurant",
    "paymentMethod": "CARD",
    "status": "CONFIRMED",
    "createdAt": "2024-05-15T10:30:00"
  }
}

**Variable Setup in Postman**:
Pre-request Script:
var today = new Date();
var date = today.toISOString().split('T')[0];
pm.environment.set("today", date);

Then use: "expenseDate": "{{today}}"
```

#### Get All Expenses
```
GET /expenses
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 45.50,
      "category": {
        "id": 1,
        "name": "Food & Dining"
      },
      "expenseDate": "2024-05-15",
      "description": "Lunch at restaurant"
    },
    ...
  ]
}
```

#### Get Expenses by Date Range
```
GET /expenses/range?startDate=2024-05-01&endDate=2024-05-31
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "data": [
    {...}
  ]
}
```

#### Get Single Expense
```
GET /expenses/1
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "data": {
    "id": 1,
    "amount": 45.50,
    "category": {...},
    ...
  }
}
```

#### Update Expense
```
PUT /expenses/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "amount": 50.00,
  "categoryId": 1,
  "expenseDate": "2024-05-15",
  "description": "Lunch at restaurant (updated)",
  "paymentMethod": "CARD"
}

Expected Response: 200
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "id": 1,
    "amount": 50.00,
    ...
  }
}
```

#### Delete Expense
```
DELETE /expenses/1
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

### 4. Budget Tests

#### Get Current Month Budgets
```
GET /budgets/current
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category": {
        "id": 1,
        "name": "Food & Dining"
      },
      "limitAmount": 500.00,
      "spent": 242.75,
      "month": "2024-05",
      "percentageUsed": 48.55,
      "exceeded": false
    },
    ...
  ]
}
```

#### Set Budget
```
POST /budgets/category/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "limitAmount": 600.00,
  "month": "2024-05",
  "alertThreshold": 80
}

Expected Response: 201
{
  "success": true,
  "message": "Budget set successfully",
  "data": {
    "id": 1,
    "category": {...},
    "limitAmount": 600.00,
    "month": "2024-05",
    "alertThreshold": 80
  }
}
```

#### Check If Budget Exceeded
```
GET /budgets/check/1/2024-05
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "data": {
    "exceeded": false,
    "percentageUsed": 40.45,
    "amount": 242.75,
    "limit": 600.00
  }
}
```

#### Update Budget
```
PUT /budgets/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "limitAmount": 700.00,
  "alertThreshold": 75
}

Expected Response: 200
{
  "success": true,
  "message": "Budget updated successfully"
}
```

#### Delete Budget
```
DELETE /budgets/1
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

---

### 5. Dashboard Tests

#### Get Dashboard Data
```
GET /dashboard
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "data": {
    "totalExpenses": 2500.50,
    "monthlyExpenses": 650.00,
    "yearlyExpenses": 2500.50,
    "averageMonthlyExpense": 416.75,
    "topExpenseCategory": "Food & Dining",
    "topCategoryAmount": 450.00,
    "categorywiseSpending": {
      "Food & Dining": 450.00,
      "Transportation": 320.00,
      "Entertainment": 180.00,
      ...
    },
    "spendingTrend": [
      { "month": "2024-01", "amount": 350.00 },
      { "month": "2024-02", "amount": 420.00 },
      ...
    ],
    "topCategories": [
      { "name": "Food & Dining", "amount": 450.00 },
      { "name": "Transportation", "amount": 320.00 }
    ]
  }
}
```

---

### 6. Insights Tests

#### Get AI Insights
```
GET /insights/ai
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "data": [
    {
      "type": "SPENDING_ANALYSIS",
      "message": "You spent 25% more on Food & Dining this month compared to last month."
    },
    {
      "type": "RECOMMENDATION",
      "message": "Consider reducing Shopping expenses. You can save up to $100 per month."
    },
    {
      "type": "WARNING",
      "message": "Unusual spending detected: $300 on Electronics (50% above your average)"
    }
  ]
}
```

#### Get Financial Health Score
```
GET /insights/health-score
Authorization: Bearer {{token}}

Expected Response: 200
{
  "success": true,
  "data": {
    "overallScore": 72,
    "scoreRating": "GOOD",
    "savingsRatio": 0.45,
    "budgetAdherencePercentage": 85,
    "overspendingFrequency": 2,
    "recommendations": [
      "Maintain your good spending habits",
      "Try to increase your savings ratio to 50%",
      "Watch out for shopping category overspending"
    ]
  }
}
```

---

### 7. Reports Tests

#### Download PDF Report
```
GET /reports/pdf/2024-05
Authorization: Bearer {{token}}

Expected Response: 200 with file
Content-Type: application/pdf
```

#### Download Excel Report
```
GET /reports/excel/2024-05
Authorization: Bearer {{token}}

Expected Response: 200 with file
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

---

## Manual Test Scenarios

### Scenario 1: Complete User Journey

**Duration**: ~15 minutes
**Steps**:

1. **Registration**
   - Register new account with email: testuser@example.com
   - Verify you're redirected to dashboard
   - ✅ Check: User account created

2. **View Dashboard**
   - Dashboard should show empty state initially
   - ✅ Check: No expenses displayed

3. **Create Categories**
   - Go to expense list
   - Verify default categories are available
   - ✅ Check: Food, Transportation, Entertainment, etc.

4. **Add Expenses**
   - Add 5 different expenses across categories
   - Amounts: $25.50, $45.00, $12.50, $78.00, $35.00
   - Dates: Spread across past 15 days
   - ✅ Check: All expenses appear in list

5. **Set Budgets**
   - Set budgets for 3 categories
   - Ensure one budget is nearly exceeded
   - ✅ Check: Budgets appear on budget page

6. **View Insights**
   - Go to Insights page
   - Verify AI recommendations appear
   - Check financial health score
   - ✅ Check: Score and insights display

7. **Download Reports**
   - Download PDF report
   - Download Excel report
   - ✅ Check: Files download successfully

---

### Scenario 2: Expense Management

**Duration**: ~10 minutes
**Steps**:

1. **Add Expense**
   - Click "Add Expense"
   - Fill: $45.50, Food & Dining, Today, "Lunch"
   - Save
   - ✅ Check: Expense appears immediately

2. **Edit Expense**
   - Click edit icon on expense
   - Change amount to $55.00
   - Update
   - ✅ Check: Amount updated in list

3. **Delete Expense**
   - Click delete icon
   - Confirm deletion
   - ✅ Check: Expense removed from list

4. **Filter by Date**
   - Set date range: Last 7 days
   - ✅ Check: Only expenses in range shown

---

### Scenario 3: Budget Tracking

**Duration**: ~10 minutes
**Steps**:

1. **Set Budget**
   - Go to Budget page
   - Set budget: Food $500, Transport $300, Entertainment $200
   - ✅ Check: Budgets saved

2. **Add Expense Exceeding Budget**
   - Add expense: Transportation $350 (exceeds $300 budget)
   - ✅ Check: Budget shows red/exceeded indicator

3. **Check Alerts**
   - Verify notification appears
   - ✅ Check: Budget alert generated

4. **Update Budget**
   - Increase Transport budget to $400
   - ✅ Check: Alert cleared, budget green again

---

### Scenario 4: Error Handling

**Duration**: ~5 minutes
**Steps**:

1. **Invalid Email Registration**
   - Try register with invalid email: "notanemail"
   - ✅ Check: Error message shown

2. **Weak Password**
   - Try register with password: "123"
   - ✅ Check: Password validation error

3. **Duplicate Email**
   - Try register with existing email
   - ✅ Check: "Email already exists" error

4. **Missing Required Fields**
   - Try submit form with empty fields
   - ✅ Check: Validation messages shown

---

## Automated Testing

### Backend Unit Tests

Run backend tests:
```bash
cd finance-tracker-backend
mvn test
```

### Frontend Unit Tests

Run frontend tests:
```bash
cd finance-tracker-frontend
npm test
```

---

## Performance Testing

### Load Testing with Apache JMeter

1. Install JMeter
2. Create test plan for concurrent users
3. Configure threads: 10, 50, 100 users
4. Test endpoints:
   - GET /expenses (list)
   - GET /dashboard
   - POST /expenses (create)

### Expected Performance

- **Response Time**: < 500ms for 90% of requests
- **Throughput**: > 100 requests/second
- **Memory**: < 512MB heap usage
- **Database Queries**: < 200ms average

---

## Security Testing

### 1. Authentication Testing

```bash
# Test without token
curl http://localhost:8080/api/expenses

# Expected: 401 Unauthorized

# Test with invalid token
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8080/api/expenses

# Expected: 401 Unauthorized
```

### 2. Authorization Testing

```bash
# User 1 should not access User 2's data
# Register two users
# Login as User 1, get their token
# Try to access User 2's expenses with User 1's token
# Expected: 403 Forbidden
```

### 3. SQL Injection Testing

```bash
# Try SQL injection in search
POST /expenses
Body: "amount": "'; DROP TABLE expenses; --"

# Expected: 400 Bad Request (not executed)
```

### 4. CORS Testing

```bash
# Test CORS headers
curl -H "Origin: https://untrusted-domain.com" \
  http://localhost:8080/api/expenses

# Expected: 403 (if not whitelisted)
```

---

## Test Results Template

### Test Summary Report

```
Test Date: _____________
Tester: _________________
Version: 1.0.0

Test Cases Run: ___
Passed: ___
Failed: ___
Skipped: ___

Critical Issues: ___
Major Issues: ___
Minor Issues: ___

Recommendations:
- 
-
-
```

---

## Test Checklist

### Functionality
- [ ] User registration
- [ ] User login/logout
- [ ] Add expense
- [ ] Edit expense
- [ ] Delete expense
- [ ] View expenses
- [ ] Filter expenses
- [ ] Set budget
- [ ] View budget
- [ ] Create category
- [ ] View dashboard
- [ ] View insights
- [ ] Download reports

### UI/UX
- [ ] Responsive design
- [ ] Form validation
- [ ] Error messages
- [ ] Loading states
- [ ] Navigation
- [ ] Mobile view

### Performance
- [ ] Page load time < 3s
- [ ] API response < 500ms
- [ ] No memory leaks
- [ ] Proper caching

### Security
- [ ] JWT validation
- [ ] CORS configuration
- [ ] Password encryption
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK
        uses: actions/setup-java@v2
        with:
          java-version: '17'
      - name: Build with Maven
        run: mvn clean install

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
```

---

## Support

For testing issues:
1. Check browser console (F12)
2. Check server logs
3. Review error messages
4. Consult troubleshooting guide

---

**Happy Testing! 🧪**
