# Finance Tracker Frontend

Smart Personal Finance & Expense Tracker with AI Insights - React Frontend

## Features

- User Authentication (Login/Register)
- Dashboard with Real-time Statistics
- Expense Management (Create, Read, Update, Delete)
- Budget Management with Alerts
- AI-Powered Financial Insights
- Financial Health Score
- Monthly Reports (PDF/Excel)
- Responsive Design
- Dark Mode Support (Coming Soon)

## Tech Stack

- React 18+
- React Router v6
- Zustand (State Management)
- Axios (HTTP Client)
- Chart.js (Data Visualization)
- CSS3 (Styling)

## Installation

### Prerequisites

- Node.js v14+ and npm
- Backend API running on `http://localhost:8080`

### Setup Steps

```bash
# Navigate to frontend directory
cd finance-tracker-frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Project Structure

```
finance-tracker-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   └── PrivateRoute.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── DashboardPage.js
│   │   ├── ExpensesPage.js
│   │   ├── BudgetPage.js
│   │   ├── InsightsPage.js
│   │   └── *.css (Styling)
│   ├── services/
│   │   └── api.js (API calls)
│   ├── stores/
│   │   └── authStore.js (Auth state)
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Available Routes

- `/login` - User login page
- `/register` - User registration page
- `/dashboard` - Main dashboard (Protected)
- `/expenses` - Manage expenses (Protected)
- `/budget` - Manage budgets (Protected)
- `/insights` - View insights and reports (Protected)

## API Integration

All API calls are configured in `src/services/api.js` with automatic token management.

### Authentication

JWT tokens are stored in localStorage and automatically attached to API requests.

### Error Handling

- Automatic redirect to login on 401 errors
- User-friendly error messages
- Network error handling

## Styling

- CSS utility classes for common patterns
- Responsive design with mobile-first approach
- Color scheme: Blue (#3498db), Green (#2ecc71), Red (#e74c3c)

## Development

### Run Development Server

```bash
npm start
```

Runs on `http://localhost:3000` by default.

### Build Production Bundle

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Environment Variables

Create a `.env` file if needed:

```
REACT_APP_API_URL=http://localhost:8080/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Errors

Ensure backend CORS configuration allows `http://localhost:3000`.

### API Connection Issues

Check if backend is running on `http://localhost:8080`.

### State Not Persisting

Check localStorage for authToken and user data.

## Contributing

1. Create a new branch for features
2. Follow existing code style
3. Test thoroughly before submitting

## License

MIT License - see LICENSE file for details
