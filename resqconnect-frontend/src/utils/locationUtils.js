/**
 * Utility functions for handling location data safely
 */

/**
 * Safely formats a location string, handling null/undefined values
 * @param {string|null|undefined} location - The location to format
 * @param {string} defaultValue - Default value to return if location is invalid
 * @returns {string} Formatted location or empty string
 */
export const formatLocation = (location, defaultValue = '') => {
  if (location === null || location === undefined) {
    return defaultValue;
  }
  
  try {
    return String(location).trim();
  } catch (error) {
    console.error('Error formatting location:', error);
    return defaultValue;
  }
};

/**
 * Validates if a location string is usable for API calls
 * @param {string|null|undefined} location - The location to validate
 * @returns {boolean} Whether the location is valid
 */
export const isValidLocation = (location) => {
  const formatted = formatLocation(location);
  return formatted !== null && formatted !== undefined && formatted.length > 0;
};

/**
 * Safely encodes a location for use in URLs
 * @param {string|null|undefined} location - The location to encode
 * @returns {string} URL-encoded location or empty string
 */
export const encodeLocationForUrl = (location) => {
  const formatted = formatLocation(location);
  if (!isValidLocation(formatted)) {
    return '';
  }
  
  try {
    return encodeURIComponent(formatted);
  } catch (error) {
    console.error('Error encoding location for URL:', error);
    return '';
  }
}; 