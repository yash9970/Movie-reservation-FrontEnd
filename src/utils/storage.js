/**
 * Secure localStorage wrapper with error handling
 */

/**
 * Gets an item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} - Stored value or default
 */
export const getItem = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (key: ${key}):`, error);
        return defaultValue;
    }
};

/**
 * Sets an item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} - Success status
 */
export const setItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage (key: ${key}):`, error);
        return false;
    }
};

/**
 * Removes an item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - Success status
 */
export const removeItem = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage (key: ${key}):`, error);
        return false;
    }
};

/**
 * Clears all items from localStorage
 * @returns {boolean} - Success status
 */
export const clear = () => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

/**
 * Checks if a key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - True if key exists
 */
export const hasItem = (key) => {
    try {
        return localStorage.getItem(key) !== null;
    } catch (error) {
        console.error(`Error checking localStorage (key: ${key}):`, error);
        return false;
    }
};
