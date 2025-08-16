/**
 * Advanced Formatting Utility for Enterprise Roofing App
 * Features:
 * - Currency formatting (multi-locale)
 * - Measurement formatting (imperial/metric, rounding, units)
 * - Date/time formatting (local, ISO, human-readable)
 * - Customer/contact info formatting
 * - CSV/JSON export helpers
 * - Error/validation formatting
 */

// Currency formatting
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch (err) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// Measurement formatting
export function formatMeasurement({ area, unit = 'sqm', perimeter = null }) {
  let str = '';
  if (area) {
    str += `Area: ${area.toFixed(2)} ${unit === 'sqm' ? 'm²' : 'ft²'}`;
  }
  if (perimeter !== null) {
    str += ` | Perimeter: ${perimeter.toFixed(2)} ${unit === 'sqm' ? 'm' : 'ft'}`;
  }
  return str;
}

// Date formatting
export function formatDate(date, locale = 'en-US', options = {}) {
  try {
    return new Date(date).toLocaleDateString(locale, options);
  } catch {
    return date;
  }
}

// Time formatting
export function formatTime(date, locale = 'en-US', options = {}) {
  try {
    return new Date(date).toLocaleTimeString(locale, options);
  } catch {
    return date;
  }
}

// Customer/contact formatting
export function formatContact({ name, email, phone }) {
  let contact = '';
  if (name) contact += `Name: ${name}\n`;
  if (email) contact += `Email: ${email}\n`;
  if (phone) contact += `Phone: ${phone}\n`;
  return contact.trim();
}

// CSV export
export function toCSV(objArray, columns = null) {
  if (!Array.isArray(objArray)) return '';
  if (!objArray.length) return '';
  const keys = columns || Object.keys(objArray[0]);
  const header = keys.join(',');
  const rows = objArray.map(obj =>
    keys.map(k => `"${(obj[k] !== undefined ? obj[k] : '')}"`).join(',')
  );
  return [header, ...rows].join('\n');
}

// JSON export
export function toJSON(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '{}';
  }
}

// Error formatting
export function formatError(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return JSON.stringify(error);
}
