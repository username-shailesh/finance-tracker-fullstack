/**
 * Form validation utilities
 * Provides reusable validation rules for all forms
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

/**
 * Validate username
 * @param {string} username
 * @returns {string|null} Error message or null if valid
 */
export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 50) return 'Username must be less than 50 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return null;
};

/**
 * Validate amount field
 * @param {string|number} amount
 * @returns {string|null} Error message or null if valid
 */
export const validateAmount = (amount) => {
  if (!amount && amount !== 0) return 'Amount is required';
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Amount must be a valid number';
  if (num <= 0) return 'Amount must be greater than 0';
  if (num > 1000000) return 'Amount cannot exceed 1,000,000';
  return null;
};

/**
 * Validate required field
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate date field
 * @param {string} date
 * @returns {string|null} Error message or null if valid
 */
export const validateDate = (date) => {
  if (!date) return 'Date is required';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Please enter a valid date';
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  if (d > future) return 'Date cannot be more than 1 year in the future';
  return null;
};

/**
 * Validate expense form
 * @param {object} data - Expense form data
 * @returns {object} Validation errors object
 */
export const validateExpenseForm = (data) => {
  const errors = {};

  const amountError = validateAmount(data.amount);
  if (amountError) errors.amount = amountError;

  if (!data.categoryId) errors.categoryId = 'Category is required';

  const dateError = validateDate(data.expenseDate);
  if (dateError) errors.expenseDate = dateError;

  return errors;
};

/**
 * Validate budget form
 * @param {object} data - Budget form data
 * @returns {object} Validation errors object
 */
export const validateBudgetForm = (data) => {
  const errors = {};

  const amountError = validateAmount(data.limitAmount);
  if (amountError) errors.limitAmount = amountError;

  if (!data.categoryId) errors.categoryId = 'Category is required';

  return errors;
};

/**
 * Validate register form
 * @param {object} data - Registration form data
 * @returns {object} Validation errors object
 */
export const validateRegisterForm = (data) => {
  const errors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const usernameError = validateUsername(data.username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  if (data.confirmPassword !== data.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/**
 * Check if an errors object has any errors
 * @param {object} errors
 * @returns {boolean}
 */
export const hasErrors = (errors) => Object.keys(errors).length > 0;
