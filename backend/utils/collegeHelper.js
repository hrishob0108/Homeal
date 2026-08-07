/**
 * Utility functions for Multi-Tenant College Isolation
 */

// Generate a sanitized, uniform Socket.IO room name for a college
const getCollegeRoom = (collegeName) => {
  if (!collegeName || typeof collegeName !== 'string') return '';
  const sanitized = collegeName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return sanitized ? `college_${sanitized}` : '';
};

// Safely escape special regex characters for case-insensitive MongoDB queries
const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = { getCollegeRoom, escapeRegex };
