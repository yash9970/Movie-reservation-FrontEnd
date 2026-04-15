import { apiClient } from "./api";

/**
 * Showtime API - Complete CRUD operations for showtime management
 * All functions use apiClient wrapper which handles authentication automatically
 */

// Note: These functions are designed to be called from components that have access to the token
// The token should be passed to apiClient by the calling component

/**
 * Get all showtimes with optional filters
 * @param {Object} filters - Optional filters (movieId, theaterId, date, etc.)
 * @param {string} token - Auth token
 * @returns {Promise} Array of showtimes
 */
export const getAllShowtimes = (filters = {}, token) => {
    const params = new URLSearchParams();

    if (filters.movieId) params.append('movieId', filters.movieId);
    if (filters.theaterId) params.append('theaterId', filters.theaterId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    return apiClient(`/api/showtimes${queryString ? `?${queryString}` : ''}`, token);
};

/**
 * Get showtime by ID
 * @param {number} id - Showtime ID
 * @param {string} token - Auth token
 * @returns {Promise} Showtime details
 */
export const getShowtimeById = (id, token) =>
    apiClient(`/api/showtimes/${id}`, token);

/**
 * Get showtimes for a specific movie
 * @param {number} movieId - Movie ID
 * @param {string} token - Auth token
 * @returns {Promise} Array of showtimes for the movie
 */
export const getShowtimesByMovie = (movieId, token) =>
    apiClient(`/api/showtimes/movie/${movieId}`, token);

/**
 * Get showtimes for a specific theater
 * @param {number} theaterId - Theater ID
 * @param {string} token - Auth token
 * @returns {Promise} Array of showtimes for the theater
 */
export const getShowtimesByTheater = (theaterId, token) =>
    apiClient(`/api/showtimes/theater/${theaterId}`, token);

// ============================================================================
// CREATE Operation
// ============================================================================

/**
 * Create a new showtime
 * @param {Object} showtimeData - Showtime data
 * @param {number} showtimeData.movieId - Movie ID
 * @param {number} showtimeData.theaterId - Theater ID
 * @param {number} showtimeData.screenNumber - Screen number
 * @param {string} showtimeData.showDateTime - Show date and time (ISO format)
 * @param {number} showtimeData.pricePerSeat - Price per seat
 * @param {number} showtimeData.totalSeats - Total seats
 * @param {number} showtimeData.availableSeats - Available seats
 * @param {string} token - Auth token
 * @returns {Promise} Created showtime
 */
export const createShowtime = (showtimeData, token) =>
    apiClient("/api/showtimes", token, {
        method: 'POST',
        body: JSON.stringify(showtimeData),
    });

// ============================================================================
// UPDATE Operation
// ============================================================================

/**
 * Update an existing showtime
 * @param {number} id - Showtime ID
 * @param {Object} showtimeData - Updated showtime data
 * @param {string} token - Auth token
 * @returns {Promise} Updated showtime
 */
export const updateShowtime = (id, showtimeData, token) =>
    apiClient(`/api/showtimes/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(showtimeData),
    });

// ============================================================================
// DELETE Operation
// ============================================================================

/**
 * Delete a showtime
 * @param {number} id - Showtime ID
 * @param {string} token - Auth token
 * @returns {Promise} Deletion confirmation
 */
export const deleteShowtime = (id, token) =>
    apiClient(`/api/showtimes/${id}`, token, {
        method: 'DELETE',
    });
