# Finance Tracker - Backend Setup Guide

## Project Overview

Spring Boot REST API for Personal Finance and Expense Tracker with AI insights.

**Version**: 1.0.0  
**Java Version**: 17+  
**Database**: MySQL 8.0+  
**Build Tool**: Maven

## Prerequisites

- Java Development Kit (JDK) 17 or higher
- Maven 3.8+
- MySQL Server 8.0+
- Git (optional)

## Installation Steps

### 1. Database Setup

#### Install MySQL

**Windows**:
```bash
# Using Chocolatey
choco install mysql

# Or download from https://dev.mysql.com/downloads/mysql/
```

**macOS**:
```bash
brew install mysql
```

**Linux**:
```bash
sudo apt-get install mysql-server
```

#### Create Database

```bash
# Start MySQL
mysql -u root -p

# Create database
CREATE DATABASE finance_tracker;
USE finance_tracker;

# Run schema
source path/to/database/finance_tracker_schema.sql;

# Verify
SHOW TABLES;
```

### 2. Backend Project Setup

```bash
# Navigate to backend directory
cd finance-tracker-backend

# Build with Maven
mvn clean install

# Download dependencies (if not automatic)
mvn dependency:resolve
```

### 3. Configuration

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/finance_tracker
spring.datasource.username=root
spring.datasource.password=your_mysql_password

# JWT Secret (change for production!)
jwt.secret=your-secret-key-change-this-in-production-minimum-32-characters-required
jwt.expiration=86400000

# Server Port
server.port=8080
```

### 4. Run the Application

```bash
# Using Maven
mvn spring-boot:run

# Or using Java
mvn clean package
java -jar target/finance-tracker-1.0.0.jar
```

**Expected Output**:
```
================================================
Finance Tracker Application Started Successfully
API Base URL: http://localhost:8080/api
================================================
```

## Project Structure

```
finance-tracker-backend/
├── src/
│   ├── main/
│   │   ├── java/com/financetracker/
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── service/         # Business Logic
│   │   │   ├── entity/          # JPA Entities
│   │   │   ├── repository/      # Data Access
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── security/        # Security & JWT
│   │   │   ├── exception/       # Exception Handling
│   │   │   ├── config/          # Configuration Classes
│   │   │   └── FinanceTrackerApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/
├── pom.xml
└── README.md
```

## Key Dependencies

- **Spring Boot 3.2.0**: Web framework
- **Spring Data JPA**: Database ORM
- **Spring Security**: Authentication & Authorization
- **JWT (jjwt)**: Token-based authentication
- **MySQL Connector**: Database driver
- **Lombok**: Reduce boilerplate code
- **iText PDF**: PDF generation
- **Apache POI**: Excel generation

## Database Schema

### Users Table
```sql
- id (Primary Key)
- email (Unique)
- username (Unique)
- password (Encrypted)
- firstName, lastName
- role (USER/ADMIN)
- enabled
- currency
- createdAt, updatedAt
```

### Expenses Table
```sql
- id (Primary Key)
- user_id (Foreign Key)
- category_id (Foreign Key)
- amount
- expenseDate
- description
- paymentMethod
- status (PENDING/CONFIRMED/ARCHIVED)
- createdAt, updatedAt
```

### Budgets Table
```sql
- id (Primary Key)
- user_id (Foreign Key)
- category_id (Foreign Key)
- limitAmount
- month (YYYY-MM)
- alertEnabled
- alertThreshold
```

### Categories Table
```sql
- id (Primary Key)
- user_id (Foreign Key)
- name
- description
- color
- icon
- isCustom
```

### RecurringExpenses Table
```sql
- id (Primary Key)
- user_id (Foreign Key)
- category_id (Foreign Key)
- amount
- recurrenceType (DAILY/WEEKLY/MONTHLY/YEARLY)
- startDate, endDate
- isActive
- dayOfMonth
```

### Notifications Table
```sql
- id (Primary Key)
- user_id (Foreign Key)
- title, message
- type (BUDGET_ALERT/UNUSUAL_SPENDING/etc)
- isRead
- createdAt
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/health` - Health check

### Expenses
- `GET /expenses` - Get all expenses
- `GET /expenses/range` - Get by date range
- `POST /expenses` - Create expense
- `PUT /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Delete expense

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Budgets
- `GET /budgets/current` - Get current month budgets
- `GET /budgets/{month}` - Get budgets by month
- `POST /budgets/category/{categoryId}` - Set/Update budget
- `GET /budgets/check/{categoryId}/{month}` - Check if exceeded

### Insights
- `GET /insights/ai` - Get AI insights
- `GET /insights/health-score` - Get financial health score

### Reports
- `GET /reports/pdf/{month}` - Download PDF report
- `GET /reports/excel/{month}` - Download Excel report

### Dashboard
- `GET /dashboard` - Get dashboard data

## Security Features

- **JWT Authentication**: Token-based stateless auth
- **Password Encryption**: BCrypt hashing
- **CORS Configuration**: Allows frontend origins
- **Role-Based Access**: USER and ADMIN roles
- **Input Validation**: Request validation with annotations
- **Exception Handling**: Global exception handler

## Testing

### Using Postman

1. Import API collection from `API_DOCUMENTATION.md`
2. Set Authorization header: `Bearer <your_jwt_token>`
3. Test endpoints

### Unit Tests

```bash
# Run tests
mvn test

# Run specific test
mvn test -Dtest=ExpenseServiceTest
```

## Troubleshooting

### MySQL Connection Error

```
com.mysql.cj.jdbc.exceptions.CommunicationsException
```

**Solution**:
- Ensure MySQL is running
- Check credentials in `application.properties`
- Verify database exists

### JWT Token Invalid

**Solution**:
- Check token expiration
- Verify JWT secret matches
- Ensure Authorization header format: `Bearer <token>`

### Port Already in Use

```
Address already in use: bind
```

**Solution**:
```bash
# Change port in application.properties
server.port=8081

# Or kill process on port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :8080
kill -9 <PID>
```

### Build Fails

```bash
# Clean and rebuild
mvn clean compile

# Force download dependencies
mvn dependency:purge-local-repository
mvn clean install
```

## Production Deployment

### Before Deployment

1. Change JWT secret to strong random value
2. Set database credentials in environment variables
3. Enable HTTPS/SSL
4. Configure CORS for production domain
5. Set `spring.jpa.hibernate.ddl-auto=validate`
6. Enable logging appropriately

### Environment Variables

```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://prod-db:3306/finance_tracker
export SPRING_DATASOURCE_USERNAME=db_user
export SPRING_DATASOURCE_PASSWORD=secure_password
export JWT_SECRET=production_secret_key_min_32_chars
```

### Running with JAR

```bash
java -jar target/finance-tracker-1.0.0.jar \
  --server.port=8080 \
  --spring.datasource.url=jdbc:mysql://localhost:3306/finance_tracker
```

## Performance Tuning

### Database Optimization
- Added indexes on frequently queried columns
- Use pagination for large datasets
- Cache frequently accessed data

### Application Optimization
- Configure connection pooling
- Use lazy loading for relationships
- Implement caching layer

## Logging

Configure logging in `application.properties`:

```properties
logging.level.root=INFO
logging.level.com.financetracker=DEBUG
logging.level.org.springframework.web=DEBUG
```

## Monitoring

### Health Check

```bash
curl http://localhost:8080/api/auth/health
```

### Actuator Endpoints (if enabled)

```bash
# Add to pom.xml:
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

# Access:
http://localhost:8080/actuator
http://localhost:8080/actuator/health
http://localhost:8080/actuator/metrics
```

## Contributing

1. Follow existing code style
2. Add proper Javadoc comments
3. Write unit tests for new features
4. Test manually before committing

## License

MIT License - See LICENSE file

## Support

For issues:
1. Check logs: `spring.log`
2. Review error messages
3. Consult API_DOCUMENTATION.md
4. Check GitHub issues

---

**Happy coding! 💰**
