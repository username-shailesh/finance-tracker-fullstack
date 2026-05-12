# Finance Tracker - Backend API Documentation

## Base URL

```
http://localhost:8080/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses are in JSON format:

```json
{
  "success": boolean,
  "message": "string",
  "data": object or array
}
```

## Error Handling

Error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE"
}
```

---

## Endpoints

### Authentication

#### Register User
- **POST** `/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response**: User object + JWT token

#### Login
- **POST** `/auth/login`
- **Body**:
  ```json
  {
    "username": "username",
    "password": "password"
  }
  ```
- **Response**: User object + JWT token

---

### Expenses

#### Get All Expenses
- **GET** `/expenses`
- **Auth**: Required
- **Response**: Array of expense objects

#### Get Expenses by Date Range
- **GET** `/expenses/range`
- **Auth**: Required
- **Query Parameters**:
  - `startDate`: YYYY-MM-DD
  - `endDate`: YYYY-MM-DD
- **Response**: Array of expense objects

#### Create Expense
- **POST** `/expenses`
- **Auth**: Required
- **Body**:
  ```json
  {
    "amount": 25.50,
    "categoryId": 1,
    "expenseDate": "2024-05-15",
    "description": "Lunch",
    "paymentMethod": "CARD"
  }
  ```
- **Response**: Created expense object

#### Update Expense
- **PUT** `/expenses/{id}`
- **Auth**: Required
- **Body**: Same as create
- **Response**: Updated expense object

#### Delete Expense
- **DELETE** `/expenses/{id}`
- **Auth**: Required
- **Response**: Success message

---

### Categories

#### Get All Categories
- **GET** `/categories`
- **Auth**: Required
- **Response**: Array of category objects

#### Create Category
- **POST** `/categories`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "Food",
    "description": "Food and dining",
    "color": "#FF6B6B",
    "icon": "food"
  }
  ```
- **Response**: Created category object

#### Update Category
- **PUT** `/categories/{id}`
- **Auth**: Required
- **Body**: Same as create
- **Response**: Updated category object

#### Delete Category
- **DELETE** `/categories/{id}`
- **Auth**: Required
- **Response**: Success message

---

### Budgets

#### Get Current Month Budgets
- **GET** `/budgets/current`
- **Auth**: Required
- **Response**: Array of budget objects with spent amount

#### Get Budgets by Month
- **GET** `/budgets/{month}`
- **Auth**: Required
- **Params**: month in format YYYY-MM
- **Response**: Array of budget objects

#### Set/Update Budget
- **POST** `/budgets/category/{categoryId}`
- **Auth**: Required
- **Body**:
  ```json
  {
    "limitAmount": 500,
    "month": "2024-05",
    "alertThreshold": 80
  }
  ```
- **Response**: Created/updated budget object

#### Check Budget Exceeded
- **GET** `/budgets/check/{categoryId}/{month}`
- **Auth**: Required
- **Response**: `{ "exceeded": boolean }`

---

### Dashboard

#### Get Dashboard Data
- **GET** `/dashboard`
- **Auth**: Required
- **Response**:
  ```json
  {
    "totalExpenses": 5000,
    "monthlyExpenses": 1200,
    "topExpenseCategory": "Food",
    "topCategoryAmount": 350
  }
  ```

---

### Insights

#### Get AI Insights
- **GET** `/insights/ai`
- **Auth**: Required
- **Response**: Array of insight objects with recommendations

#### Get Financial Health Score
- **GET** `/insights/health-score`
- **Auth**: Required
- **Response**:
  ```json
  {
    "overallScore": 75,
    "savingsRatio": 0.45,
    "budgetAdherencePercentage": 85,
    "overspendingFrequency": 2,
    "scoreRating": "GOOD",
    "recommendation": "..."
  }
  ```

---

### Reports

#### Download Monthly PDF Report
- **GET** `/reports/pdf/{month}`
- **Auth**: Required
- **Params**: month in format YYYY-MM
- **Response**: PDF file

#### Download Monthly Excel Report
- **GET** `/reports/excel/{month}`
- **Auth**: Required
- **Params**: month in format YYYY-MM
- **Response**: Excel file

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Example Requests

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "john_doe",
    "password": "secure_password",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password"
  }'
```

### Get Expenses
```bash
curl -X GET http://localhost:8080/api/expenses \
  -H "Authorization: Bearer your_jwt_token"
```

### Create Expense
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.50,
    "categoryId": 1,
    "expenseDate": "2024-05-15",
    "description": "Lunch at restaurant"
  }'
```

---

## Rate Limiting

Currently no rate limiting implemented. Production deployment should add rate limiting.

## Pagination

Not implemented in current version. Should be added for large datasets.

## Versioning

API version: v1.0.0

---

## Contact & Support

For issues or questions, refer to the main README.md file.
