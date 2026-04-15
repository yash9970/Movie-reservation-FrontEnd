import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for API calls with loading, error, and data states
 * @param {Function} apiFunction - Async function that makes the API call
 * @param {boolean} immediate - Whether to call immediately on mount (default: true)
 * @returns {object} - { data, loading, error, refetch, setData }
 */
export const useApi = (apiFunction, immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = useCallback(
        async (...params) => {
            try {
                setLoading(true);
                setError(null);
                const result = await apiFunction(...params);
                setData(result);
                return result;
            } catch (err) {
                setError(err.message || 'An error occurred');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [apiFunction]
    );

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, []);

    return {
        data,
        loading,
        error,
        refetch: execute,
        setData,
    };
};
