import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired / invalid → clear and redirect
      localStorage.removeItem("gc_token");
      localStorage.removeItem("gc_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
