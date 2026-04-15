import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const tokenStr = localStorage.getItem("token");
  if (tokenStr) {
    try {
      // Token is stored as JSON string, so we need to parse it
      const token = JSON.parse(tokenStr);
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      // If parsing fails, try using it directly (backward compatibility)
      config.headers.Authorization = `Bearer ${tokenStr}`;
    }
  }
  return config;
});

// Handle 401 Unauthorized errors (invalid/expired token)
api.interceptors.response.use(
  (response) => response.data, // Automatically unwrap data
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
