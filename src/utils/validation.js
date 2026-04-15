import { VALIDATION } from '../config/constants';

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Validates a password
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
    const errors = [];

    if (!password) {
        errors.push('Password is required');
        return { isValid: false, errors };
    }

    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
        errors.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
    }

    if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
        errors.push(`Password must be less than ${VALIDATION.PASSWORD_MAX_LENGTH} characters`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Gets password strength
 * @param {string} password - Password to check
 * @returns {object} - { strength: 'weak'|'medium'|'strong', score: number }
 */
export const getPasswordStrength = (password) => {
    if (!password) return { strength: 'weak', score: 0 };

    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) return { strength: 'weak', score };
    if (score <= 4) return { strength: 'medium', score };
    return { strength: 'strong', score };
};

/**
 * Validates a form field is not empty
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {string|null} - Error message or null if valid
 */
export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || value.trim() === '') {
        return `${fieldName} is required`;
    }
    return null;
};

/**
 * Validates a number is within range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {string|null} - Error message or null if valid
 */
export const validateRange = (value, min, max) => {
    const num = Number(value);
    if (isNaN(num)) return 'Must be a valid number';
    if (num < min) return `Must be at least ${min}`;
    if (num > max) return `Must be at most ${max}`;
    return null;
};
