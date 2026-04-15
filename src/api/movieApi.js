import api from "./axios";

export const getMovies = () =>
  api.get("/api/movies");

export const getMovieById = (id) =>
  api.get(`/api/movies/${id}`);

export const getMoviesByStatus = (status) =>
  api.get(`/api/movies/status/${status}`);

export const getMoviesByGenre = (genre) =>
  api.get(`/api/movies/genre/${genre}`);

export const searchMovies = (title) =>
  api.get(`/api/movies/search?title=${encodeURIComponent(title)}`);

export const getShowtimesByMovie = (movieId) =>
  api.get(`/api/showtimes/movie/${movieId}`);
