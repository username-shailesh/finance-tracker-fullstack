# Personal Finance & Expense Tracker with AI Insights

> A production-ready full-stack web application for intelligent financial management

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Java](https://img.shields.io/badge/Java-17+-orange)
![React](https://img.shields.io/badge/React-18+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Overview

A comprehensive full-stack finance management application that helps users track, analyze, and optimize their spending with advanced analytics, automation, and intelligent AI-driven insights.

### Key Features

✨ **Expense Tracking**
- Add, edit, delete expenses with detailed information
- Multiple payment methods and categories
- Receipt/bill uploads
- Categorized spending analysis

📊 **Budget Management**
- Monthly budget setting per category
- Real-time budget tracking
- Automatic alerts when budget is exceeded
- Progress visualization

🤖 **Insights**
- Spending pattern analysis
- Smart recommendations for cost reduction
- Unusual spending detection
- Category-wise insights

💡 **Advanced Features**
- Recurring expense automation
- Expense prediction based on history
- Financial health score calculation
- Multiple export formats (PDF/Excel)
- Responsive & modern UI

---

## 🏗️ Architecture

### Backend (Spring Boot)
```
Spring Boot 3.2 → REST API
├── Security (JWT)
├── Business Logic (Services)
├── Data Access (JPA/Repositories)
└── MySQL Database
```

### Frontend (React)
```
React 18 → SPA
├── Authentication Flow
├── Responsive Components
├── State Management (Zustand)
└── API Integration (Axios)
```

---

## 📦 Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17+
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Build**: Maven
- **Security**: Spring Security, BCrypt

### Frontend
- **Library**: React 18+
- **Router**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Chart.js
- **Styling**: CSS3

### Database
- **RDBMS**: MySQL 8.0+
- **ORM**: Spring Data JPA/Hibernate
- **Normalization**: 3NF

---

## 🚀 Quick Start

### Prerequisites

- Java 17+ and Maven 3.8+
- Node.js 14+ and npm
- MySQL 8.0+

### Backend Setup

```bash
# Navigate to backend
cd finance-tracker-backend

# Install dependencies
mvn clean install

# Configure database (src/main/resources/application.properties)
spring.datasource.url=jdbc:mysql://localhost:3306/finance_tracker
spring.datasource.username=root
spring.datasource.password=root

# Run application
mvn spring-boot:run
```

**API will be available at**: `http://localhost:8080/api`

### Frontend Setup

```bash
# Navigate to frontend
cd finance-tracker-frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Application will open at**: `http://localhost:3000`

### Database Setup

```bash
# Create and configure database
mysql -u root -p < database/finance_tracker_schema.sql
```

---

## 📁 Project Structure

```
finance-tracker/
├── finance-tracker-backend/          # Spring Boot REST API
│   ├── src/main/java/com/financetracker/
│   │   ├── controller/               # REST endpoints
│   │   ├── service/                  # Business logic
│   │   ├── entity/                   # JPA entities
│   │   ├── repository/               # Data access
│   │   ├── dto/                      # Data transfer objects
│   │   ├── security/                 # JWT & authentication
│   │   ├── config/                   # Configuration
│   │   └── exception/                # Exception handling
│   ├── src/main/resources/
│   │   └── application.properties    # Configuration
│   └── pom.xml
│
├── finance-tracker-frontend/         # React SPA
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API services
│   │   ├── stores/                   # State management
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   └── package.json
│
├── database/
│   └── finance_tracker_schema.sql    # Database schema
│
├── API_DOCUMENTATION.md               # Complete API docs
└── README.md                          # This file
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /auth/register          Register new user
POST   /auth/login             Login user
GET    /auth/health            Health check
```

### Expenses
```
GET    /expenses               Get all expenses
GET    /expenses/range         Get expenses by date range
POST   /expenses               Create new expense
PUT    /expenses/{id}          Update expense
DELETE /expenses/{id}          Delete expense
```

### Categories
```
GET    /categories             Get all categories
POST   /categories             Create category
PUT    /categories/{id}        Update category
DELETE /categories/{id}        Delete category
```

### Budgets
```
GET    /budgets/current        Get current month budgets
GET    /budgets/{month}        Get budgets by month
POST   /budgets/category/{id}  Set/Update budget
GET    /budgets/check/{id}     Check if exceeded
```

### Insights & Reports
```
GET    /insights/ai            Get AI insights
GET    /insights/health-score  Get financial health score
GET    /reports/pdf/{month}    Download PDF report
GET    /reports/excel/{month}  Download Excel report
```

### Dashboard
```
GET    /dashboard              Get dashboard data
```

---

## 🎨 Features in Detail

### 1. Insights
- Rule-based spending pattern analysis
- Spending comparison with previous months
- Unusual spending detection
- Category-wise recommendations
- Savings opportunity identification

### 2. Recurring Expenses
- Automated expense creation
- Support for daily/weekly/monthly/quarterly/yearly recurrence
- Scheduled batch processing
- Easy management and editing

### 3. Financial Health Score
- Calculated based on:
  - Savings ratio
  - Budget adherence
  - Overspending frequency
- Scoring: 0-100 with ratings (Excellent, Good, Fair, Poor)
- Personalized recommendations

### 4. Budget Alerts
- Real-time notifications
- Threshold-based alerts (default 80%)
- Budget exceeding warnings
- Multi-category tracking

### 5. Reports & Export
- Monthly PDF reports with charts
- Excel spreadsheets with formatted data
- Detailed expense breakdowns
- Summary statistics

---

## 🔒 Security Features

- **JWT-based Authentication**: Stateless token-based auth
- **Password Security**: BCrypt encryption (10+ rounds)
- **CORS Configuration**: Restricted to allowed origins
- **Input Validation**: Request validation with annotations
- **Exception Handling**: Global exception handler
- **SQL Injection Prevention**: Parameterized queries via JPA
- **Role-Based Access**: USER and ADMIN roles

---

## 📊 Database Schema

### Core Tables
- **users**: User accounts and profiles
- **categories**: Expense categories
- **expenses**: Transaction records
- **budgets**: Monthly budget limits
- **recurring_expenses**: Automated expenses
- **notifications**: User alerts and messages

### Relationships
```
Users (1) ──→ (Many) Expenses
Users (1) ──→ (Many) Categories
Categories (1) ──→ (Many) Expenses
Users (1) ──→ (Many) Budgets
```

---

## 🧪 Testing

### Postman Testing
- Import API collection from `API_DOCUMENTATION.md`
- Set Bearer token in Authorization header
- Test all endpoints

### Unit Tests
```bash
mvn test
```

### Manual Testing
1. Register new user
2. Create categories
3. Add expenses
4. Set budgets
5. View insights
6. Download reports

---

## 🚀 Deployment

### Production Checklist
- [ ] Change JWT secret to strong random value
- [ ] Configure production database
- [ ] Enable HTTPS/SSL
- [ ] Set appropriate CORS origins
- [ ] Configure logging levels
- [ ] Set JPA ddl-auto to 'validate'
- [ ] Test all API endpoints
- [ ] Configure backups

### Deployment Options
- AWS EC2 + RDS
- Docker containers + Kubernetes
- Heroku
- DigitalOcean
- Azure App Service

---

## 🐛 Troubleshooting

### Backend Issues
| Issue | Solution |
|-------|----------|
| MySQL connection fails | Verify MySQL running, check credentials |
| Port 8080 in use | Change port in application.properties |
| JWT token invalid | Check secret key, token expiration |
| CORS errors | Update CORS configuration in SecurityConfig |

### Frontend Issues
| Issue | Solution |
|-------|----------|
| API not responding | Ensure backend is running on 8080 |
| Login not working | Check JWT token storage in localStorage |
| Blank dashboard | Check browser console for errors |
| Styles not loading | Clear browser cache, rebuild project |

---

## 📚 Documentation

- [Backend Setup Guide](finance-tracker-backend/README.md)
- [Frontend Setup Guide](finance-tracker-frontend/README.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Database Schema](database/finance_tracker_schema.sql)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Follow code style conventions
4. Write unit tests
5. Submit pull request

---

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 🎓 Educational Value

Perfect for:
- Learning full-stack development
- Understanding Spring Boot architecture
- React.js best practices
- JWT authentication
- REST API design
- MySQL database design
- Responsive UI/UX

---

## 🔗 Project Links

- **GitHub**: [Finance Tracker](https://github.com/your-username/finance-tracker)
- **Documentation**: [Full Docs](./API_DOCUMENTATION.md)
- **Issues**: Report bugs via GitHub Issues

---

## 💬 Support

- 📧 Email: support@financetracker.com
- 💻 GitHub Issues: [Report here](https://github.com/issues)
- 📖 Wiki: [Documentation](https://github.com/wiki)

---

## 🎉 Future Enhancements

- [ ] Mobile app (React Native/Flutter)
- [ ] Dark mode support
- [ ] Multi-currency support
- [ ] Bank account integration
- [ ] Email alerts
- [ ] Advanced analytics dashboard
- [ ] Goal tracking
- [ ] Social features (split expenses)
- [ ] Machine learning for better predictions
- [ ] Voice command support

---

## 📊 Statistics

- **Backend Files**: 30+ Java classes
- **Frontend Components**: 10+ React components
- **Database Tables**: 6 main tables
- **API Endpoints**: 25+ endpoints
- **Lines of Code**: 3000+ (backend) + 2000+ (frontend)
- **Test Coverage**: 70%+

---

## ⭐ Credits

Developed as a comprehensive full-stack finance management solution.

**Technologies Used**: Spring Boot, React, MySQL, JWT, REST API, Chart.js

---

<div align="center">

### Made with 💙 for financial independence

**Last Updated**: May 2024  
**Version**: 1.0.0

[⬆ Back to Top](#-smart-personal-finance--expense-tracker-with-ai-insights)

</div>
