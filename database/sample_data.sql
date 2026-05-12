-- Finance Tracker - Sample/Seed Data
-- Execute this after creating the schema

-- ==============================================================
-- Sample Users
-- ==============================================================
INSERT INTO users (email, username, password, firstName, lastName, role, enabled, currency, createdAt, updatedAt) VALUES
('john@example.com', 'john_doe', '$2a$10$slYQmyNdGzin7olVN3nunOvJUoI8cZH9sKZWxQTLiRt59r9Xq.L6S', 'John', 'Doe', 'USER', 1, 'USD', NOW(), NOW()),
('sarah@example.com', 'sarah_smith', '$2a$10$slYQmyNdGzin7olVN3nunOvJUoI8cZH9sKZWxQTLiRt59r9Xq.L6S', 'Sarah', 'Smith', 'USER', 1, 'USD', NOW(), NOW()),
('admin@example.com', 'admin_user', '$2a$10$slYQmyNdGzin7olVN3nunOvJUoI8cZH9sKZWxQTLiRt59r9Xq.L6S', 'Admin', 'User', 'ADMIN', 1, 'USD', NOW(), NOW());

-- Password: "password123" (BCrypt encoded)

-- ==============================================================
-- Default Categories
-- ==============================================================
INSERT INTO categories (user_id, name, description, color, icon, isCustom, createdAt) VALUES
(1, 'Food & Dining', 'Groceries, restaurants, cafes', '#FF6B6B', 'utensils', 0, NOW()),
(1, 'Transportation', 'Gas, public transit, taxi, car maintenance', '#4ECDC4', 'car', 0, NOW()),
(1, 'Entertainment', 'Movies, games, hobbies, concerts', '#95E1D3', 'film', 0, NOW()),
(1, 'Shopping', 'Clothes, electronics, household items', '#FFE66D', 'shopping-bag', 0, NOW()),
(1, 'Healthcare', 'Medical, fitness, pharmacy', '#A8E6CF', 'heart', 0, NOW()),
(1, 'Bills & Utilities', 'Electricity, water, internet, phone', '#C7CEEA', 'file-invoice', 0, NOW()),
(1, 'Education', 'Books, courses, training', '#FFB3BA', 'book', 0, NOW()),
(1, 'Travel', 'Vacation, hotels, flights', '#FFFFBA', 'plane', 0, NOW()),
(2, 'Food & Dining', 'Groceries, restaurants, cafes', '#FF6B6B', 'utensils', 0, NOW()),
(2, 'Transportation', 'Gas, public transit, taxi, car maintenance', '#4ECDC4', 'car', 0, NOW()),
(2, 'Entertainment', 'Movies, games, hobbies, concerts', '#95E1D3', 'film', 0, NOW()),
(2, 'Shopping', 'Clothes, electronics, household items', '#FFE66D', 'shopping-bag', 0, NOW());

-- ==============================================================
-- Sample Budgets for Current Month (May 2024)
-- ==============================================================
INSERT INTO budgets (user_id, category_id, limitAmount, month, alertEnabled, alertThreshold, createdAt, updatedAt) VALUES
(1, 1, 500.00, '2024-05', 1, 80, NOW(), NOW()),
(1, 2, 300.00, '2024-05', 1, 80, NOW(), NOW()),
(1, 3, 200.00, '2024-05', 1, 80, NOW(), NOW()),
(1, 4, 400.00, '2024-05', 1, 80, NOW(), NOW()),
(1, 5, 150.00, '2024-05', 1, 80, NOW(), NOW()),
(1, 6, 250.00, '2024-05', 1, 80, NOW(), NOW()),
(2, 9, 450.00, '2024-05', 1, 80, NOW(), NOW()),
(2, 10, 280.00, '2024-05', 1, 80, NOW(), NOW());

-- ==============================================================
-- Sample Expenses for User 1 (John Doe)
-- ==============================================================
INSERT INTO expenses (user_id, category_id, amount, expenseDate, description, paymentMethod, status, createdAt, updatedAt) VALUES
-- Food & Dining (Category 1)
(1, 1, 45.50, '2024-05-15', 'Lunch at Pizza Place', 'CARD', 'CONFIRMED', NOW(), NOW()),
(1, 1, 32.00, '2024-05-14', 'Grocery shopping', 'CARD', 'CONFIRMED', NOW(), NOW()),
(1, 1, 18.75, '2024-05-13', 'Coffee and breakfast', 'CASH', 'CONFIRMED', NOW(), NOW()),
(1, 1, 62.30, '2024-05-12', 'Dinner with friends', 'CARD', 'CONFIRMED', NOW(), NOW()),
(1, 1, 28.50, '2024-05-11', 'Grocery shopping', 'CARD', 'CONFIRMED', NOW(), NOW()),
(1, 1, 55.00, '2024-05-10', 'Restaurant dinner', 'CARD', 'CONFIRMED', NOW(), NOW()),
-- Transportation (Category 2)
(1, 2, 50.00, '2024-05-15', 'Gas for car', 'CARD', 'CONFIRMED', NOW(), NOW()),
(1, 2, 15.00, '2024-05-14', 'Taxi to airport', 'CARD', 'CONFIRMED', NOW(), NOW()),
(1, 2, 60.00, '2024-05-13', 'Car maintenance', 'CARD', 'CONFIRMED', NOW(), NOW()),
-- Entertainment (Category 3)
(1, 3, 25.00, '2024-05-15', 'Movie ticket', 'CARD', 'CONFIRMED', NOW(), NOW()),
(1, 3, 15.00, '2024-05-12', 'Gaming subscription', 'CARD', 'CONFIRMED', NOW(), NOW()),
-- Shopping (Category 4)
(1, 4, 120.00, '2024-05-14', 'T-shirts and jeans', 'CARD', 'CONFIRMED', NOW(), NOW()),
(1, 4, 85.00, '2024-05-10', 'Phone case and charger', 'CARD', 'CONFIRMED', NOW(), NOW()),
-- Healthcare (Category 5)
(1, 5, 45.00, '2024-05-13', 'Pharmacy - vitamins', 'CARD', 'CONFIRMED', NOW(), NOW()),
(1, 5, 75.00, '2024-05-10', 'Gym membership', 'CARD', 'CONFIRMED', NOW(), NOW()),
-- Bills & Utilities (Category 6)
(1, 6, 120.00, '2024-05-01', 'Electricity bill', 'TRANSFER', 'CONFIRMED', NOW(), NOW()),
(1, 6, 50.00, '2024-05-01', 'Internet bill', 'TRANSFER', 'CONFIRMED', NOW(), NOW()),
(1, 6, 35.00, '2024-05-01', 'Phone bill', 'TRANSFER', 'CONFIRMED', NOW(), NOW());

-- ==============================================================
-- Sample Expenses for User 2 (Sarah Smith)
-- ==============================================================
INSERT INTO expenses (user_id, category_id, amount, expenseDate, description, paymentMethod, status, createdAt, updatedAt) VALUES
-- Food & Dining (Category 9)
(2, 9, 38.00, '2024-05-15', 'Lunch delivery', 'CARD', 'CONFIRMED', NOW(), NOW()),
(2, 9, 55.00, '2024-05-14', 'Dinner at upscale restaurant', 'CARD', 'CONFIRMED', NOW(), NOW()),
(2, 9, 28.50, '2024-05-12', 'Coffee shop', 'CASH', 'CONFIRMED', NOW(), NOW()),
-- Transportation (Category 10)
(2, 10, 45.00, '2024-05-15', 'Gas for car', 'CARD', 'CONFIRMED', NOW(), NOW()),
(2, 10, 12.00, '2024-05-13', 'Public transit pass', 'CARD', 'CONFIRMED', NOW(), NOW()),
-- Entertainment (Category 11)
(2, 11, 30.00, '2024-05-14', 'Concert ticket', 'CARD', 'CONFIRMED', NOW(), NOW()),
-- Shopping (Category 12)
(2, 12, 95.00, '2024-05-13', 'New dress', 'CARD', 'CONFIRMED', NOW(), NOW());

-- ==============================================================
-- Sample Recurring Expenses
-- ==============================================================
INSERT INTO recurring_expenses (user_id, category_id, amount, recurrenceType, startDate, endDate, isActive, dayOfMonth, createdAt, updatedAt) VALUES
(1, 6, 120.00, 'MONTHLY', '2024-01-01', NULL, 1, 1, NOW(), NOW()),
(1, 6, 50.00, 'MONTHLY', '2024-01-05', NULL, 1, 5, NOW(), NOW()),
(1, 3, 15.00, 'MONTHLY', '2024-02-01', NULL, 1, 1, NOW(), NOW()),
(2, 9, 30.00, 'MONTHLY', '2024-01-15', NULL, 1, 15, NOW(), NOW()),
(2, 10, 80.00, 'MONTHLY', '2024-01-01', NULL, 1, 1, NOW(), NOW());

-- ==============================================================
-- Sample Notifications
-- ==============================================================
INSERT INTO notifications (user_id, title, message, type, isRead, createdAt) VALUES
(1, 'Budget Alert', 'Your Food & Dining budget is at 75% usage', 'BUDGET_ALERT', 0, NOW()),
(1, 'Budget Alert', 'Your Shopping budget exceeded by $5.00', 'BUDGET_ALERT', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'Unusual Spending', 'Detected unusual spending of $120 on Shopping', 'UNUSUAL_SPENDING', 0, NOW()),
(1, 'Recurring Expense', 'Monthly electricity bill of $120.00 processed', 'RECURRING_EXPENSE', 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'Budget Alert', 'Your Food & Dining budget is at 60% usage', 'BUDGET_ALERT', 0, NOW()),
(2, 'Recurring Expense', 'Monthly grocery subscription of $30.00 processed', 'RECURRING_EXPENSE', 1, DATE_SUB(NOW(), INTERVAL 3 DAY));

-- ==============================================================
-- Verify Data Insertion
-- ==============================================================
SELECT 'Users Created' as message, COUNT(*) as count FROM users;
SELECT 'Categories Created' as message, COUNT(*) as count FROM categories;
SELECT 'Expenses Created' as message, COUNT(*) as count FROM expenses;
SELECT 'Budgets Created' as message, COUNT(*) as count FROM budgets;
SELECT 'Recurring Expenses Created' as message, COUNT(*) as count FROM recurring_expenses;
SELECT 'Notifications Created' as message, COUNT(*) as count FROM notifications;

-- ==============================================================
-- Test Credentials
-- ==============================================================
-- User 1: john_doe / password123
-- User 2: sarah_smith / password123
-- Admin: admin_user / password123
-- ==============================================================

-- All passwords are BCrypt hashed: $2a$10$slYQmyNdGzin7olVN3nunOvJUoI8cZH9sKZWxQTLiRt59r9Xq.L6S
-- Which decodes to: password123
