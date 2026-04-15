import api from "./axios";

export const getTheaters = () =>
    api.get("/api/theaters");

export const getTheaterById = (id) =>
    api.get(`/api/theaters/${id}`);

export const getTheatersByCity = (city) =>
    api.get(`/api/theaters/city/${city}`);

export const createTheater = (data) =>
    api.post("/api/theaters", data);

export const updateTheater = (id, data) =>
    api.put(`/api/theaters/${id}`, data);

export const deleteTheater = (id) =>
    api.delete(`/api/theaters/${id}`);
