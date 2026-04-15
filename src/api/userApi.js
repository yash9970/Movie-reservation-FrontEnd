import api from "./axios";

export const getUsers = () =>
    api.get("/api/users");

export const getUserById = (id) =>
    api.get(`/api/users/${id}`);

export const getUserByEmail = (email) =>
    api.get(`/api/users/email/${email}`);

export const createUser = (data) =>
    api.post("/api/users", data);

// Admin-specific user creation endpoint (bypasses gateway filter)
export const adminCreateUser = (data) =>
    api.post("/api/auth/adminRegister", data);

export const updateUser = (id, data) =>
    api.put(`/api/users/${id}`, data);

export const deleteUser = (id) =>
    api.delete(`/api/users/${id}`);
