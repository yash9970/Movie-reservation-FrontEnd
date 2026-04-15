import api from "./axios";

export const createBooking = (data) =>
  api.post("/api/bookings", data);

export const getMyBookings = (userId) =>
  api.get(`/api/bookings/user/${userId}`);

export const getBookingById = (id) =>
  api.get(`/api/bookings/${id}`);

export const getBookingByReference = (reference) =>
  api.get(`/api/bookings/reference/${reference}`);

export const confirmBooking = (id) =>
  api.patch(`/api/bookings/${id}/confirm`);

export const cancelBooking = (id) =>
  api.patch(`/api/bookings/${id}/cancel`);

export const updatePaymentStatus = (id, status) =>
  api.patch(`/api/bookings/${id}/payment?status=${status}`);

export const getShowtimeBookings = (showtimeId) =>
  api.get(`/api/bookings/showtime/${showtimeId}`);
