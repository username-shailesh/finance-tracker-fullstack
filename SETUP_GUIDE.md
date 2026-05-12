# Step-by-Step Setup Guide - Finance Tracker

This comprehensive guide will walk you through setting up the entire Finance Tracker application from scratch.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Step 1: Environment Setup](#step-1-environment-setup)
3. [Step 2: Database Setup](#step-2-database-setup)
4. [Step 3: Backend Setup](#step-3-backend-setup)
5. [Step 4: Frontend Setup](#step-4-frontend-setup)
6. [Step 5: Verification & Testing](#step-5-verification--testing)
7. [Step 6: Running the Application](#step-6-running-the-application)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 4GB
- **Disk Space**: 5GB
- **Java**: JDK 17 or later
- **Node.js**: 14.0 or later

### Software to Install
1. **Java Development Kit (JDK)**
2. **Maven** (for backend build)
3. **Node.js & npm** (for frontend)
4. **MySQL Server** (version 8.0+)
5. **Git** (for version control)
6. **A code editor** (VS Code recommended)

---

## Step 1: Environment Setup

### 1.1 Install Java

**Windows:**
```bash
# Download from https://www.oracle.com/java/technologies/downloads/
# Run installer and follow instructions
# Verify installation
java -version
javac -version
```

**macOS:**
```bash
brew install openjdk@17
java -version
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
java -version
```

### 1.2 Install Maven

**Windows:**
- Download from https://maven.apache.org/download.cgi
- Extract to `C:\Program Files\maven`
- Add to PATH environment variable

**macOS:**
```bash
brew install maven
mvn -version
```

**Linux:**
```bash
sudo apt install maven
mvn -version
```

### 1.3 Install Node.js & npm

**All Platforms:**
- Download from https://nodejs.org (LTS version)
- Run installer and follow instructions

**Verify:**
```bash
node -version
npm -version
```

### 1.4 Install MySQL

**Windows:**
- Download from https://dev.mysql.com/downloads/mysql/
- Run installer, choose "Developer Default" setup
- Configure as MySQL Server
- Set root password to remember

**macOS:**
```bash
brew install mysql
mysql.server start
# Set root password
mysql_secure_installation
```

**Linux (Ubuntu):**
```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 1.5 Create Environment Variables (Optional but Recommended)

**Windows (PowerShell):**
```powershell
# Set JAVA_HOME
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "User")

# Set MAVEN_HOME
[Environment]::SetEnvironmentVariable("MAVEN_HOME", "C:\Program Files\maven", "User")

# Verify
$env:JAVA_HOME
$env:MAVEN_HOME
```

---

## Step 2: Database Setup

### 2.1 Start MySQL Service

**Windows:**
```bash
# MySQL usually starts automatically
# To start manually:
net start MySQL80
```

**macOS:**
```bash
mysql.server start
```

**Linux:**
```bash
sudo service mysql start
# Or
sudo systemctl start mysql
```

### 2.2 Create Database

```bash
# Connect to MySQL (will prompt for password)
mysql -u root -p

# In MySQL shell, run:
CREATE DATABASE finance_tracker;
USE finance_tracker;
EXIT;
```

### 2.3 Import Database Schema

```bash
# Navigate to project directory
cd "s:\Java Project"

# Import schema
mysql -u root -p finance_tracker < database/finance_tracker_schema.sql

# Verify tables created
mysql -u root -p finance_tracker -e "SHOW TABLES;"
```

### 2.4 Import Sample Data (Optional)

```bash
# Load sample data for testing
mysql -u root -p finance_tracker < database/sample_data.sql

# Verify data
mysql -u root -p finance_tracker -e "SELECT COUNT(*) FROM users;"
mysql -u root -p finance_tracker -e "SELECT COUNT(*) FROM expenses;"
```

---

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

```bash
cd "s:\Java Project\finance-tracker-backend"
```

### 3.2 Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Find these lines and update with your MySQL password:

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/finance_tracker
spring.datasource.username=root
spring.datasource.password=your_mysql_root_password

# JWT Configuration (keep as is for development)
jwt.secret=finance-tracker-secret-key-for-development-change-in-production
jwt.expiration=86400000

# Server Configuration
server.port=8080
server.servlet.context-path=/api
```

### 3.3 Build Backend

```bash
# Clean and build
mvn clean install

# This will:
# - Download all dependencies
# - Compile the code
# - Run tests (if any)
# - Create JAR file

# Expected output at end:
# BUILD SUCCESS
```

**Troubleshooting Build Issues:**

```bash
# If build fails, try:

# Clear Maven cache
mvn clean

# Force update dependencies
mvn dependency:purge-local-repository

# Rebuild
mvn clean install

# For specific errors, check the logs above BUILD FAILURE
```

### 3.4 Run Backend

**Option A: Using Maven (Recommended for development)**
```bash
mvn spring-boot:run
```

**Option B: Using Java JAR**
```bash
java -jar target/finance-tracker-1.0.0.jar
```

**Expected Output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

Tomcat started on port(s): 8080 (http)
Finance Tracker Application has started successfully.
```

**✅ Backend is running!**

---

## Step 4: Frontend Setup

### 4.1 Open New Terminal/Command Prompt

Keep backend running in first terminal, open new one for frontend

### 4.2 Navigate to Frontend Directory

```bash
cd "s:\Java Project\finance-tracker-frontend"
```

### 4.3 Install Dependencies

```bash
npm install

# This installs all packages from package.json
# May take 2-5 minutes on first installation
```

### 4.4 Configure API URL (Optional)

Create `.env.local` file:

```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

### 4.5 Start Frontend

```bash
npm start

# This will:
# - Build the React app
# - Start development server on port 3000
# - Open browser automatically
```

**Expected Output:**
```
Compiled successfully!

You can now view finance-tracker in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**✅ Frontend is running!**

---

## Step 5: Verification & Testing

### 5.1 Test Backend Connectivity

```bash
# In browser or Postman, test:
curl http://localhost:8080/api/auth/health

# Expected response:
# { "status": "OK" }
```

### 5.2 Test Frontend Access

- Open browser: `http://localhost:3000`
- You should see the login page
- ✅ Frontend is working!

### 5.3 Test User Registration

**Using Frontend:**
1. Click "Sign Up"
2. Fill in:
   - Email: `testuser@example.com`
   - Password: `password123`
   - Full Name: `Test User`
3. Click "Register"
4. Should redirect to dashboard
5. ✅ Registration works!

**OR using Postman:**
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "password123",
  "fullName": "Test User",
  "username": "testuser"
}
```

### 5.4 Test User Login

**Using Frontend:**
1. Click "Log In"
2. Fill in:
   - Email: `testuser@example.com`
   - Password: `password123`
3. Click "Login"
4. Should redirect to dashboard
5. ✅ Login works!

### 5.5 Test Sample User Login

If you imported sample data:

**Credentials:**
- Username: `john_doe`
- Password: `password123`

---

## Step 6: Running the Application

### Daily Startup Procedure

**Terminal 1 - Start Backend:**
```bash
cd "s:\Java Project\finance-tracker-backend"
mvn spring-boot:run
# Wait for "Finance Tracker Application has started successfully"
```

**Terminal 2 - Start Frontend:**
```bash
cd "s:\Java Project\finance-tracker-frontend"
npm start
# Wait for "Compiled successfully!"
```

**Access Application:**
- Open browser: `http://localhost:3000`
- Login with your credentials
- Use the application!

### Stopping the Application

**Backend (Terminal 1):**
```bash
# Press Ctrl+C
```

**Frontend (Terminal 2):**
```bash
# Press Ctrl+C
```

---

## Testing Scenarios

### 1. Complete User Flow

```
1. Register new account
2. Create expense categories (if needed)
3. Add sample expenses
4. Set monthly budgets
5. View dashboard
6. Check insights
7. Download report
```

### 2. Expense Management

```
1. Click "Add Expense" button
2. Fill in:
   - Date: Today
   - Category: Food & Dining
   - Amount: 25.50
   - Description: Lunch
   - Payment Method: Card
3. Click "Save"
4. Expense appears in list
5. Edit expense (click edit icon)
6. Change amount to 30.00
7. Click "Update"
8. Delete expense (click delete icon)
9. Confirm deletion
```

### 3. Budget Management

```
1. Go to Budget page
2. Click "Set Budget"
3. Select category: Food & Dining
4. Set limit: 500
5. Click "Save"
6. Budget appears on page
7. Add expense > 400 in that category
8. Check if warning appears
```

### 4. Dashboard Insights

```
1. Go to Dashboard
2. Verify charts display correctly
3. Check "Total Spent" shows correct amount
4. Check "Top Categories" list
5. Review spending trend chart
6. Go to Insights page
7. Check AI recommendations
8. Check financial health score
```

---

## Project File Structure Overview

```
s:\Java Project\
├── README.md                           # Main project documentation
├── API_DOCUMENTATION.md                # Complete API documentation
├── DEPLOYMENT.md                       # Production deployment guide
├── SETUP_GUIDE.md                      # This file
│
├── database/
│   ├── finance_tracker_schema.sql      # Database schema
│   └── sample_data.sql                 # Sample data for testing
│
├── finance-tracker-backend/
│   ├── src/main/java/com/financetracker/
│   │   ├── controller/                 # REST endpoints
│   │   ├── service/                    # Business logic
│   │   ├── entity/                     # Database entities
│   │   ├── repository/                 # Data access
│   │   ├── dto/                        # Data transfer objects
│   │   ├── security/                   # JWT & auth
│   │   ├── config/                     # Spring config
│   │   └── exception/                  # Exception handling
│   ├── src/main/resources/
│   │   └── application.properties      # Config file
│   ├── pom.xml                         # Maven config
│   └── README.md                       # Backend guide
│
└── finance-tracker-frontend/
    ├── src/
    │   ├── components/                 # Reusable components
    │   ├── pages/                      # Page components
    │   ├── services/                   # API services
    │   ├── stores/                     # State management
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── public/
    │   └── index.html
    ├── package.json                    # npm dependencies
    └── README.md                       # Frontend guide
```

---

## Troubleshooting

### "Port 8080 already in use"

**Windows:**
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in application.properties
server.port=8081
```

**Linux/Mac:**
```bash
lsof -i :8080
kill -9 <PID>
```

### "Cannot connect to database"

Check:
1. MySQL is running: `mysql -u root -p`
2. Database exists: `USE finance_tracker;`
3. Credentials in `application.properties` match
4. No spaces in password or surround with quotes

### "npm install fails"

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### "Frontend shows blank page"

```bash
# Check browser console (F12) for errors
# Common causes:
# 1. Backend not running
# 2. CORS issues (check browser console)
# 3. Wrong API URL in .env

# Solutions:
# 1. Start backend: mvn spring-boot:run
# 2. Check API_URL in frontend
# 3. Clear browser cache: Ctrl+Shift+Del
# 4. Restart frontend: npm start
```

### "Build fails with 'unknown'symbols"

```bash
# Java version mismatch
java -version  # Should be 17 or higher

# Update pom.xml if needed:
# Change <java.version>17</java.version> to match your JDK
```

---

## Next Steps

After successful setup:

1. **Explore the Application**
   - Test all features
   - Create sample data
   - Review insights

2. **Read Documentation**
   - [API Documentation](API_DOCUMENTATION.md)
   - [Backend Guide](finance-tracker-backend/README.md)
   - [Frontend Guide](finance-tracker-frontend/README.md)

3. **For Development**
   - Install IDE: VS Code, IntelliJ IDEA, or Eclipse
   - Set up debugging
   - Explore code structure

4. **For Deployment**
   - Read [Deployment Guide](DEPLOYMENT.md)
   - Prepare production environment
   - Configure SSL certificate

5. **For Testing**
   - Use [Testing Guide](TESTING.md)
   - Create Postman collection
   - Write unit tests

---

## Getting Help

### Documentation
- Check relevant README files
- Review API documentation
- Check inline code comments

### Common Issues
- Check Troubleshooting section above
- Review application logs
- Check browser console (F12)

### Development Tips
- Use VS Code extension: REST Client
- Use Postman for API testing
- Use browser DevTools for frontend debugging
- Check application logs: `spring.log`

---

## System Architecture Overview

```
User Browser (http://localhost:3000)
    ↓
React Frontend (npm start)
    ↓
Axios API Calls (http://localhost:8080/api)
    ↓
Spring Boot Backend (mvn spring-boot:run)
    ↓
JWT Authentication & Authorization
    ↓
Business Logic Services
    ↓
Spring Data JPA
    ↓
MySQL Database (localhost:3306)
```

---

## Database Connection Test

```bash
# Test MySQL connection
mysql -h localhost -u root -p finance_tracker -e "SELECT VERSION();"

# Should output MySQL version if successful
```

---

## Performance Tips

1. **Use Chrome DevTools** for frontend debugging
2. **Use Postman** for API testing
3. **Monitor logs** while testing
4. **Close unused terminals** to free memory
5. **Restart services** if performance degrades

---

## Congratulations! 🎉

Your Finance Tracker application is now fully set up and running!

- ✅ Backend: http://localhost:8080/api
- ✅ Frontend: http://localhost:3000
- ✅ Database: localhost:3306

**Happy tracking! 💰**

---

**Last Updated**: May 2024  
**Version**: 1.0.0

For questions or issues, refer to the documentation or contact support.
