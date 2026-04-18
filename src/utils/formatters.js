import { format, parseISO } from 'date-fns';

/**
 * Formats a date string or Date object
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
 * @returns {string} - Formatted date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Formats a datetime string for showtime display
 * @param {string|Date} datetime - DateTime to format
 * @returns {string} - Formatted datetime
 */
export const formatShowtime = (datetime) => {
    return formatDate(datetime, 'MMMM dd, yyyy - h:mm a');
};

/**
 * Formats a price value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} - Formatted price
 */
export const formatPrice = (amount, currency = '₹') => {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount);
    }
    if (isNaN(amount)) return `${currency}0.00`;
    return `${currency}${amount.toFixed(2)}`;
};

/**
 * Formats duration in minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration (e.g., "2h 30m")
 */
export const formatDuration = (minutes) => {
    if (!minutes || minutes < 0) return '0m';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
};

/**
 * Truncates text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Formats an array of seat numbers for display
 * @param {string[]} seats - Array of seat numbers
 * @returns {string} - Formatted seat list
 */
export const formatSeatList = (seats) => {
    if (!seats || seats.length === 0) return 'None';
    return seats.join(', ');
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
