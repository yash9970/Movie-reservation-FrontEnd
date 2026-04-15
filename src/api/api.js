import { API_BASE_URL, API_TIMEOUT, API_RETRY_ATTEMPTS, API_RETRY_DELAY, DEBUG_MODE } from '../config/constants';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Enhanced fetch with timeout
 */
const fetchWithTimeout = async (url, options, timeout = API_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, null);
    }
    throw error;
  }
};

/**
 * Enhanced API client with retry logic and better error handling
 * @param {string} url - API endpoint
 * @param {string} token - Auth token
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
export const apiClient = async (url, token, options = {}) => {
  const fullUrl = API_BASE_URL + url;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Always log for debugging
  console.log(`[API Request] ${options.method || 'GET'} ${fullUrl}`);
  console.log('[API Headers]', config.headers);
  console.log('[Token Present]', !!token);

  if (DEBUG_MODE) {
    console.log('[Full Config]', config);
  }

  let lastError;

  // Retry logic
  for (let attempt = 0; attempt < API_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetchWithTimeout(fullUrl, config);

      if (DEBUG_MODE) {
        console.log(`[API Response] ${response.status} ${fullUrl}`);
      }

      // Handle different status codes
      if (response.status === 401) {
        throw new ApiError('Unauthorized - Please log in again', 401, null);
      }

      if (response.status === 403) {
        throw new ApiError('Forbidden - You don\'t have permission', 403, null);
      }

      if (response.status === 404) {
        throw new ApiError('Resource not found', 404, null);
      }

      if (response.status >= 500) {
        throw new ApiError('Server error - Please try again later', response.status, null);
      }

      // Try to parse JSON response
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ApiError(
          data?.message || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 408 (timeout)
      if (error.status >= 400 && error.status < 500 && error.status !== 408) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt < API_RETRY_ATTEMPTS - 1) {
        if (DEBUG_MODE) {
          console.log(`[API Retry] Attempt ${attempt + 1} failed, retrying...`);
        }
        await sleep(API_RETRY_DELAY * (attempt + 1)); // Exponential backoff
      }
    }
  }

  // All retries failed
  throw lastError || new ApiError('Request failed after retries', 0, null);
};

/**
 * Convenience wrapper that maintains backward compatibility
 */
export const authFetch = apiClient;

// Re-export for backward compatibility
export const API_BASE = API_BASE_URL;
