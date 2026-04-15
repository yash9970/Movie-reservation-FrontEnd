/**
 * Application-wide constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// Application Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'CineMax';
export const MAX_SEATS_PER_BOOKING = parseInt(import.meta.env.VITE_MAX_SEATS_PER_BOOKING) || 10;

// Seat Configuration
export const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const SEATS_PER_ROW = 10;

// Toast Configuration
export const TOAST_DURATION = 3000;
export const TOAST_POSITION = 'top-right';

// Pagination
export const MOVIES_PER_PAGE = 12;
export const BOOKINGS_PER_PAGE = 10;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  MOVIES: '/movies',
  MOVIE_DETAIL: '/movies/:id',
  BOOKING: '/booking/:showtimeId',
  MY_BOOKINGS: '/my-bookings',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
  },
  MOVIES: {
    LIST: '/api/movies',
    DETAIL: (id) => `/api/movies/${id}`,
  },
  SHOWTIMES: {
    DETAIL: (id) => `/api/showtimes/${id}`,
  },
  BOOKINGS: {
    LIST: '/api/bookings',
    CREATE: '/api/bookings',
    DETAIL: (id) => `/api/bookings/${id}`,
    CANCEL: (id) => `/api/bookings/${id}/cancel`,
  },
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
};

// Debug Mode
export const DEBUG_MODE = import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true';
