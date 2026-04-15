import { useState, useEffect } from 'react';
import * as storage from '../utils/storage';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @returns {[*, Function]} - [storedValue, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
    // State to store our value
    const [storedValue, setStoredValue] = useState(() => {
        return storage.getItem(key, initialValue);
    });

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            storage.setItem(key, valueToStore);
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};
