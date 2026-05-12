# Deployment Guide - Finance Tracker

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Database Deployment](#database-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Java 17+ JDK
- Maven 3.8+
- Node.js 14+ and npm
- MySQL 8.0+
- Git
- Docker (optional, for containerized deployment)

### Hardware Requirements
- **Minimum**: 2GB RAM, 2 CPU cores, 10GB storage
- **Recommended**: 4GB RAM, 4 CPU cores, 20GB storage

### Accounts/Services Needed
- Cloud provider account (AWS, Azure, DigitalOcean, etc.)
- DNS domain name
- SSL certificate (Let's Encrypt free option available)

---

## Pre-Deployment Checklist

### Backend
- [ ] Update JWT secret to strong 32+ character random string
- [ ] Configure production database credentials
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Update logging levels appropriately
- [ ] Test all API endpoints
- [ ] Review and update security settings
- [ ] Configure backup strategy
- [ ] Set up monitoring/alerting

### Frontend
- [ ] Update API base URL to production endpoint
- [ ] Build optimized production bundle
- [ ] Test all user flows
- [ ] Verify responsive design on target devices
- [ ] Configure analytics (optional)
- [ ] Test error handling
- [ ] Verify dark mode/theme switching

### Database
- [ ] Backup development database
- [ ] Test disaster recovery plan
- [ ] Configure automated backups
- [ ] Set up replication (if applicable)
- [ ] Optimize indexes
- [ ] Document access procedures

---

## Environment Setup

### Option 1: AWS Deployment (Recommended)

#### EC2 Instance Setup

```bash
# 1. Launch EC2 Instance
# - AMI: Ubuntu 22.04 LTS
# - Instance Type: t3.medium (recommended)
# - Storage: 20GB gp3
# - Security Group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL - internal only)

# 2. Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Update system
sudo apt update && sudo apt upgrade -y

# 4. Install dependencies
sudo apt install -y openjdk-17-jdk maven nodejs npm mysql-server

# 5. Install Nginx (reverse proxy)
sudo apt install -y nginx

# 6. Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### RDS Database Setup

```bash
# 1. Create RDS instance
# - Engine: MySQL 8.0
# - Instance class: db.t3.micro
# - Storage: 20GB gp2
# - Multi-AZ: No (can enable later)
# - Public accessible: No

# 2. Security Group: Allow inbound on port 3306 from EC2 security group

# 3. Create database
mysql -h your-rds-endpoint -u admin -p
CREATE DATABASE finance_tracker;
USE finance_tracker;
source /path/to/finance_tracker_schema.sql;
source /path/to/sample_data.sql;
```

### Option 2: Docker Deployment

```dockerfile
# Backend Dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/finance-tracker-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

```dockerfile
# Frontend Dockerfile
FROM node:16 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: finance_tracker
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/finance_tracker_schema.sql:/docker-entrypoint-initdb.d/schema.sql
    
  backend:
    build: ./finance-tracker-backend
    depends_on:
      - mysql
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/finance_tracker
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    
  frontend:
    build: ./finance-tracker-frontend
    environment:
      REACT_APP_API_URL: http://localhost:8080/api
    ports:
      - "80:80"

volumes:
  mysql_data:
```

---

## Database Deployment

### Manual Setup

```bash
# 1. SSH into database server/instance
ssh -i key.pem ubuntu@db-server

# 2. Start MySQL service
sudo service mysql start

# 3. Connect to MySQL
mysql -u root -p

# 4. Create database
CREATE DATABASE finance_tracker;
USE finance_tracker;

# 5. Import schema
source /path/to/finance_tracker_schema.sql;

# 6. Import sample data (optional)
source /path/to/sample_data.sql;

# 7. Create application user (for security)
CREATE USER 'financeapp'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON finance_tracker.* TO 'financeapp'@'localhost';
FLUSH PRIVILEGES;
```

### Automated Backup Setup

```bash
# Create backup script
cat > /usr/local/bin/backup-mysql.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DB_NAME="finance_tracker"
DB_USER="root"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | \
  gzip > $BACKUP_DIR/finance_tracker_$TIMESTAMP.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: finance_tracker_$TIMESTAMP.sql.gz"
EOF

chmod +x /usr/local/bin/backup-mysql.sh

# Add to cron (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-mysql.sh
```

---

## Backend Deployment

### Build for Production

```bash
# 1. Navigate to backend directory
cd finance-tracker-backend

# 2. Build JAR file
mvn clean package -DskipTests -Pproduction

# 3. JAR will be at: target/finance-tracker-1.0.0.jar
```

### Configuration for Production

Create `application-production.properties`:

```properties
# Server
server.port=8080
server.servlet.context-path=/api
server.compression.enabled=true

# Database
spring.datasource.url=jdbc:mysql://${DB_HOST}:3306/finance_tracker
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# Logging
logging.level.root=INFO
logging.level.com.financetracker=INFO
logging.file.name=/var/log/finance-tracker/app.log

# Security
spring.security.filter.order=5
```

### Deployment Options

#### Option A: Systemd Service

```bash
# Create service file
sudo cat > /etc/systemd/system/finance-tracker.service << 'EOF'
[Unit]
Description=Finance Tracker API
After=network.target

[Service]
Type=simple
User=financeapp
WorkingDirectory=/opt/finance-tracker
ExecStart=/usr/bin/java -Xmx1024m -Xms512m \
  -Dspring.config.location=file:/opt/finance-tracker/application-production.properties \
  -jar /opt/finance-tracker/finance-tracker-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable finance-tracker
sudo systemctl start finance-tracker

# Check status
sudo systemctl status finance-tracker
```

#### Option B: Docker Container

```bash
# Build image
docker build -t finance-tracker-backend:1.0.0 .

# Run container
docker run -d \
  --name finance-tracker-api \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/finance_tracker \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=password \
  -e JWT_SECRET=your-strong-secret \
  -p 8080:8080 \
  --restart unless-stopped \
  finance-tracker-backend:1.0.0

# Check logs
docker logs -f finance-tracker-api
```

### Nginx Reverse Proxy Setup

```nginx
# /etc/nginx/sites-available/finance-tracker-api
upstream backend {
    server localhost:8080;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Frontend Deployment

### Build for Production

```bash
# 1. Navigate to frontend directory
cd finance-tracker-frontend

# 2. Update API URL in .env or .env.production
REACT_APP_API_URL=https://api.yourdomain.com/api

# 3. Build optimized bundle
npm run build

# 4. Build output: build/ directory
```

### Deployment Options

#### Option A: AWS S3 + CloudFront

```bash
# Deploy to S3
aws s3 sync build/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### Option B: Nginx Static Server

```bash
# 1. Copy build files
sudo cp -r build/* /var/www/html/

# 2. Configure Nginx
sudo cat > /etc/nginx/sites-available/finance-tracker-frontend << 'EOF'
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
EOF

sudo systemctl restart nginx
```

#### Option C: Docker Container

```bash
# Build frontend image
docker build -t finance-tracker-frontend:1.0.0 .

# Run container
docker run -d \
  --name finance-tracker-web \
  -e REACT_APP_API_URL=https://api.yourdomain.com/api \
  -p 80:80 \
  --restart unless-stopped \
  finance-tracker-frontend:1.0.0
```

---

## SSL/TLS Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Check renewal status
sudo certbot renew --dry-run
```

---

## Monitoring & Maintenance

### Application Monitoring

```bash
# Monitor Java process
top -p $(pgrep -f "finance-tracker")

# Check logs
tail -f /var/log/finance-tracker/app.log

# Monitor disk usage
df -h

# Monitor memory
free -h
```

### Database Monitoring

```bash
# Connect to MySQL
mysql -u root -p

# Check database size
SELECT table_schema, 
       ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb
FROM information_schema.tables
WHERE table_schema = 'finance_tracker'
GROUP BY table_schema;

# Check active connections
SHOW PROCESSLIST;

# Check slow queries
SHOW VARIABLES LIKE 'slow_query%';
```

### Automated Health Checks

```bash
# Create health check script
cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash

# Check backend
curl -s http://localhost:8080/api/auth/health || echo "Backend is down"

# Check database
mysql -u root -p$DB_PASSWORD -e "SELECT 1" finance_tracker || echo "Database is down"

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage is above 80%: $DISK_USAGE%"
fi

# Check memory
MEM_USAGE=$(free | awk 'NR==2{print $3/$2 * 100}')
if [ $(echo "$MEM_USAGE > 80" | bc) -eq 1 ]; then
    echo "Memory usage is above 80%: $MEM_USAGE%"
fi
EOF

chmod +x /usr/local/bin/health-check.sh

# Add to cron (every 5 minutes)
crontab -e
# */5 * * * * /usr/local/bin/health-check.sh
```

### Log Rotation

```bash
# Configure logrotate for application logs
sudo cat > /etc/logrotate.d/finance-tracker << 'EOF'
/var/log/finance-tracker/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 financeapp financeapp
    sharedscripts
    postrotate
        systemctl reload finance-tracker > /dev/null 2>&1 || true
    endscript
}
EOF
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check service status
sudo systemctl status finance-tracker

# View logs
sudo journalctl -u finance-tracker -n 100 -f

# Check port availability
sudo netstat -tlnp | grep 8080

# Test database connection
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "USE finance_tracker;"
```

### High Memory Usage

```bash
# Check Java heap
jps -l
jmap -heap <java_pid>

# Increase heap size in service file
ExecStart=/usr/bin/java -Xmx2048m -Xms1024m ...
```

### Database Connection Issues

```sql
# Check connections
SHOW STATUS LIKE 'Threads%';

# Kill idle connections
SELECT * FROM information_schema.processlist WHERE time > 300;

# Optimize table
OPTIMIZE TABLE expenses;
OPTIMIZE TABLE categories;
```

### SSL Certificate Renewal Issues

```bash
# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -noout -dates

# Manually renew
sudo certbot renew --force-renewal

# Test renewal process
sudo certbot renew --dry-run
```

---

## Performance Optimization

### Database Optimization

```sql
-- Add indexes if not present
ALTER TABLE expenses ADD INDEX idx_user_date (user_id, expenseDate);
ALTER TABLE expenses ADD INDEX idx_category (category_id);
ALTER TABLE budgets ADD INDEX idx_user_month (user_id, month);

-- Optimize tables
OPTIMIZE TABLE expenses;
OPTIMIZE TABLE budgets;
OPTIMIZE TABLE categories;
```

### JVM Optimization

```properties
# In application-production.properties
# Garbage collection
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

# Memory
-Xmx2048m
-Xms1024m
```

### Frontend Optimization

```bash
# Build with compression
npm run build

# Verify bundle size
npx webpack-bundle-analyzer build/static/js/*.js
```

---

## Disaster Recovery Plan

### Backup & Restore

```bash
# Backup everything
backup_dir="/backups/full_backup_$(date +%Y%m%d)"
mkdir -p $backup_dir

# Backup database
mysqldump -u root -p finance_tracker > $backup_dir/database.sql

# Backup application
cp -r /opt/finance-tracker $backup_dir/app

# Restore from backup
mysql -u root -p finance_tracker < $backup_dir/database.sql
cp -r $backup_dir/app/* /opt/finance-tracker/
```

### Recovery Procedures

```bash
# If database corrupted
# 1. Restore from backup
mysql -u root -p finance_tracker < backup/database.sql

# If application crashed
# 2. Restart service
sudo systemctl restart finance-tracker

# If server down
# 3. Launch new instance from AMI
# 4. Restore database from backup
# 5. Deploy latest code
```

---

## Security Hardening

- [ ] Enable SELinux/AppArmor
- [ ] Configure firewall rules
- [ ] Use VPC/Private networking
- [ ] Enable database encryption
- [ ] Implement DDoS protection
- [ ] Enable CloudTrail/Audit logging
- [ ] Regular security patches
- [ ] Penetration testing
- [ ] Security group restrictions
- [ ] API rate limiting

---

## Post-Deployment Verification

- [ ] Test all API endpoints
- [ ] Verify database connectivity
- [ ] Check SSL certificate validity
- [ ] Test user registration flow
- [ ] Verify email functionality (if enabled)
- [ ] Check report generation
- [ ] Test file uploads
- [ ] Verify chart rendering
- [ ] Check responsive design
- [ ] Load testing

---

## Support & Resources

- [Spring Boot Production Deployment](https://spring.io/guides/gs/spring-boot/)
- [React Production Build](https://create-react-app.dev/deployment/)
- [MySQL Best Practices](https://dev.mysql.com/doc/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [AWS Deployment Guide](https://aws.amazon.com/)

---

**Successfully deployed! 🎉**

For questions or issues, refer to the main documentation or contact support.
