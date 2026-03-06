// src/utils/validation.js

/**
 * Validate Ethiopian phone number (e.g., +251912345678 or 0912345678)
 * @param {string} phone
 * @returns {boolean}
 */
export const validateEthiopianPhone = (phone) => {
  const regex = /^(\+251|0)?9\d{8}$/;
  return regex.test(phone);
};

/**
 * Format price with commas (e.g., 1250000 -> 1,250,000)
 * @param {string|number} value
 * @returns {string}
 */
export const formatPriceInput = (value) => {
  const num = value.toString().replace(/[^\d]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Parse price string back to number
 * @param {string} formatted
 * @returns {number}
 */
export const parsePrice = (formatted) => {
  return parseFloat(formatted.replace(/,/g, '')) || 0;
};