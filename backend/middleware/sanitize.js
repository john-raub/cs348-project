/**
 * sanitizeString - clean user input before saving to DB
 * @param {string} value - the input string
 * @param {number} maxLength - optional max length
 * @returns {string} sanitized string
 */
export function sanitizeString(value, maxLength = 200) {
  if (typeof value !== "string") return "";

  // Trim whitespace
  let sanitized = value.trim();

  // Remove dangerous HTML tags (basic XSS protection)
  sanitized = sanitized.replace(/<[^>]*>?/gm, "");

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

  // Optional: limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}
